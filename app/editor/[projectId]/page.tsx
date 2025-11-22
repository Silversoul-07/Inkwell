import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { EditorView } from '@/components/editor/editor-view'

export default async function EditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>
  searchParams: Promise<{ mode?: string }>
}) {
  const { projectId } = await params
  const { mode } = await searchParams
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
      userId: session.user.id,
    },
    include: {
      chapters: {
        orderBy: { order: 'asc' },
        include: {
          scenes: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  })

  if (!project) {
    redirect('/dashboard')
  }

  const settings = await prisma.settings.findUnique({
    where: {
      userId: session.user.id,
    },
  })

  const isReadOnly = mode === 'readonly'

  return <EditorView project={project} settings={settings} isReadOnly={isReadOnly} />
}
