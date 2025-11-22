import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const format = searchParams.get('format') || 'txt'
    const exportType = searchParams.get('exportType') || 'content' // 'content', 'characters', 'lorebook', 'all'

    if (!projectId) {
      return NextResponse.json({ error: 'projectId required' }, { status: 400 })
    }

    // Verify project ownership and fetch data
    const project = await prisma.project.findUnique({
      where: { id: projectId, userId: session.user.id },
      include: {
        chapters: {
          orderBy: { order: 'asc' },
          include: {
            scenes: {
              orderBy: { order: 'asc' },
            },
          },
        },
        characters: exportType === 'characters' || exportType === 'all',
        lorebookEntries: exportType === 'lorebook' || exportType === 'all',
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    let content = ''
    let mimeType = 'text/plain'
    let filename = `${project.title}.txt`

    // Handle JSON export for characters, lorebook, or all
    if (format === 'json') {
      const jsonData: any = {}

      if (exportType === 'content' || exportType === 'all') {
        jsonData.chapters = project.chapters.map((chapter: any) => ({
          title: chapter.title,
          scenes: chapter.scenes.map((scene: any) => ({
            title: scene.title,
            content: scene.content,
          })),
        }))
      }

      if ((exportType === 'characters' || exportType === 'all') && 'characters' in project) {
        jsonData.characters = project.characters.map((char: any) => ({
          name: char.name,
          age: char.age,
          role: char.role,
          description: char.description,
          traits: char.traits,
          background: char.background,
          relationships: char.relationships,
          goals: char.goals,
        }))
      }

      if ((exportType === 'lorebook' || exportType === 'all') && 'lorebookEntries' in project) {
        jsonData.lorebook = project.lorebookEntries.map((entry: any) => ({
          key: entry.key,
          value: entry.value,
          category: entry.category,
          keys: entry.keys,
          triggerMode: entry.triggerMode,
          priority: entry.priority,
          searchable: entry.searchable,
          regexPattern: entry.regexPattern,
          contextStrategy: entry.contextStrategy,
        }))
      }

      content = JSON.stringify(jsonData, null, 2)
      mimeType = 'application/json'
      filename = `${project.title}-${exportType}.json`
    } else if (format === 'md' || format === 'markdown') {
      // Markdown format
      content = `# ${project.title}\n\n`
      if (project.description) {
        content += `${project.description}\n\n`
      }
      content += '---\n\n'

      for (const chapter of project.chapters) {
        content += `## ${chapter.title}\n\n`
        for (const scene of chapter.scenes) {
          content += `### ${scene.title}\n\n`
          content += `${scene.content}\n\n`
        }
      }

      mimeType = 'text/markdown'
      filename = `${project.title}.md`
    } else if (format === 'docx') {
      // For DOCX, we'll generate an XML-based format
      // This is a simplified DOCX format (actual DOCX is a complex ZIP file)
      // For now, return RTF which is simpler and widely supported
      content = `{\\rtf1\\ansi\\deff0\n`
      content += `{\\fonttbl{\\f0 Times New Roman;}}\n`
      content += `{\\colortbl;\\red0\\green0\\blue0;}\n`

      content += `{\\pard\\qc\\b\\fs32 ${project.title}\\par}\n`
      if (project.description) {
        content += `{\\pard\\qc\\fs24 ${project.description}\\par}\n`
      }
      content += `{\\pard\\par}\n`

      for (const chapter of project.chapters) {
        content += `{\\pard\\b\\fs28 ${chapter.title}\\par}\n`
        for (const scene of chapter.scenes) {
          content += `{\\pard\\b\\fs24 ${scene.title}\\par}\n`
          // Escape RTF special characters
          const rtfContent = scene.content
            .replace(/\\/g, '\\\\')
            .replace(/{/g, '\\{')
            .replace(/}/g, '\\}')
            .replace(/\n/g, '\\par\n')
          content += `{\\pard\\fs24 ${rtfContent}\\par}\n`
          content += `{\\pard\\par}\n`
        }
      }

      content += `}`
      mimeType = 'application/rtf'
      filename = `${project.title}.rtf`
    } else {
      // Plain text format
      content = `${project.title}\n`
      content += '='.repeat(project.title.length) + '\n\n'

      if (project.description) {
        content += `${project.description}\n\n`
      }

      for (const chapter of project.chapters) {
        content += `\n\n${chapter.title}\n`
        content += '-'.repeat(chapter.title.length) + '\n\n'

        for (const scene of chapter.scenes) {
          content += `\n${scene.title}\n\n`
          content += `${scene.content}\n`
        }
      }
    }

    // Return file as download
    return new NextResponse(content, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
