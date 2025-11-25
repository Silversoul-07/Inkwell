import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string
    const format = formData.get('format') as string
    const importType = (formData.get('importType') as string) || 'content' // 'content', 'characters', 'lorebook', 'all'

    if (!file || !projectId) {
      return NextResponse.json({ error: 'File and projectId required' }, { status: 400 })
    }

    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId, userId: session.user.id },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const content = await file.text()

    // Initialize counters for response
    let chaptersImported = 0
    let charactersImported = 0
    let lorebookImported = 0

    // Handle JSON import (for all, characters, or lorebook)
    if (format === 'json') {
      try {
        const jsonData = JSON.parse(content)

        // Import characters
        if ((importType === 'characters' || importType === 'all') && jsonData.characters) {
          for (const charData of jsonData.characters) {
            await prisma.character.create({
              data: {
                projectId,
                name: charData.name,
                age: charData.age || null,
                role: charData.role || null,
                description: charData.description || null,
                traits: charData.traits || null,
                background: charData.background || null,
                relationships: charData.relationships || null,
                goals: charData.goals || null,
              },
            })
            charactersImported++
          }
        }

        // Import lorebook entries
        if ((importType === 'lorebook' || importType === 'all') && jsonData.lorebook) {
          for (const entryData of jsonData.lorebook) {
            await prisma.lorebookEntry.create({
              data: {
                projectId,
                key: entryData.key,
                value: entryData.value,
                category: entryData.category || null,
                keys: entryData.keys || null,
                triggerMode: entryData.triggerMode || 'auto',
                priority: entryData.priority || 0,
                searchable: entryData.searchable !== false,
                regexPattern: entryData.regexPattern || null,
                contextStrategy: entryData.contextStrategy || 'full',
              },
            })
            lorebookImported++
          }
        }

        // Import chapters (if included in JSON)
        if ((importType === 'content' || importType === 'all') && jsonData.chapters) {
          const maxOrder = await prisma.chapter.findFirst({
            where: { projectId },
            orderBy: { order: 'desc' },
            select: { order: true },
          })

          let chapterOrder = maxOrder ? maxOrder.order + 1 : 0

          for (const chapterData of jsonData.chapters) {
            await prisma.chapter.create({
              data: {
                title: chapterData.title,
                content: chapterData.content || '',
                wordCount: (chapterData.content || '').split(/\s+/).length,
                projectId,
                order: chapterOrder++,
              },
            })
            chaptersImported++
          }
        }

        // Update project's updatedAt
        await prisma.project.update({
          where: { id: projectId },
          data: { updatedAt: new Date() },
        })

        return NextResponse.json({
          success: true,
          chaptersImported,
          charactersImported,
          lorebookImported,
        })
      } catch (error) {
        console.error('JSON parsing error:', error)
        return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 })
      }
    }

    // Handle Markdown/Plain text import (content only)
    const chapters: {
      title: string
      content: string
    }[] = []

    if (format === 'md' || format === 'markdown') {
      // Parse Markdown format
      const lines = content.split('\n')
      let currentChapter: {
        title: string
        content: string
      } | null = null
      let chapterContent: string[] = []

      for (const line of lines) {
        if (line.startsWith('## ')) {
          // New chapter
          if (currentChapter) {
            currentChapter.content = chapterContent.join('\n').trim()
            chapters.push(currentChapter)
          }
          currentChapter = {
            title: line.replace('## ', '').trim(),
            content: '',
          }
          chapterContent = []
        } else if (line.startsWith('### ')) {
          // Scene headers - add them as content with the scene title
          chapterContent.push(`\n${line.replace('### ', '').trim()}\n`)
        } else if (currentChapter) {
          // Chapter content
          chapterContent.push(line)
        }
      }

      // Add last chapter
      if (currentChapter) {
        currentChapter.content = chapterContent.join('\n').trim()
        chapters.push(currentChapter)
      }
    } else {
      // Parse plain text format
      // Split by double newlines or chapter markers
      const sections = content.split(/\n\n\n+/)

      for (const section of sections) {
        const lines = section.trim().split('\n')
        if (lines.length === 0) continue

        // First line is chapter title, rest is content
        const chapterTitle = lines[0].trim()
        if (!chapterTitle) continue

        // Remove the underline if present
        let contentStart = 1
        if (lines[1] && /^[-=]+$/.test(lines[1].trim())) {
          contentStart = 2
        }

        // Merge all content as single chapter content
        const chapterContent = lines.slice(contentStart).join('\n').trim()
        if (chapterContent) {
          chapters.push({
            title: chapterTitle,
            content: chapterContent,
          })
        }
      }
    }

    // Get current highest chapter order
    const maxOrder = await prisma.chapter.findFirst({
      where: { projectId },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    let chapterOrder = maxOrder ? maxOrder.order + 1 : 0

    // Create chapters in database
    for (const chapterData of chapters) {
      await prisma.chapter.create({
        data: {
          title: chapterData.title,
          content: chapterData.content,
          wordCount: chapterData.content.split(/\s+/).length,
          projectId,
          order: chapterOrder++,
        },
      })
      chaptersImported++
    }

    // Update project's updatedAt
    await prisma.project.update({
      where: { id: projectId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({
      success: true,
      chaptersImported,
      charactersImported,
      lorebookImported,
    })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
