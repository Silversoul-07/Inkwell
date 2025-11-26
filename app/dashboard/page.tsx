import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { ProjectList } from '@/components/dashboard/project-list'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { initUserDefaults } from '@/lib/init-user-defaults'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Initialize defaults on first login (checks if already done)
  const initResult = await initUserDefaults(session.user.id)

  // Log initialization result for debugging
  if (initResult.error) {
    console.error('User defaults initialization failed:', initResult.error)
  }

  const projects = await prisma.project.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      chapters: true,
    },
  })

  const settings = await prisma.settings.findUnique({
    where: {
      userId: session.user.id,
    },
  })

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} settings={settings} />
      <main className="container mx-auto px-4 py-8">
        <ProjectList projects={projects} />
      </main>
    </div>
  )
}
