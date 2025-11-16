import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { CharacterManager } from '@/components/characters/character-manager'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default async function CharactersPage({
  params,
}: {
  params: { projectId: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const project = await prisma.project.findUnique({
    where: {
      id: params.projectId,
      userId: session.user.id,
    },
  })

  if (!project) {
    redirect('/dashboard')
  }

  const characters = await prisma.character.findMany({
    where: { projectId: params.projectId },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Link href={`/editor/${params.projectId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Editor
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Characters</h1>
          <p className="text-muted-foreground">
            Manage characters for {project.title}
          </p>
        </div>

        <CharacterManager projectId={params.projectId} initialCharacters={characters} />
      </div>
    </div>
  )
}
