import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
      userId: session.user.id,
    },
  })

  if (!project) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <Link href={`/editor/${projectId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Editor
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Analytics</h1>
          <p className="text-muted-foreground">
            Track your progress for {project.title}
          </p>
        </div>

        <AnalyticsDashboard projectId={projectId} />
      </div>
    </div>
  )
}
