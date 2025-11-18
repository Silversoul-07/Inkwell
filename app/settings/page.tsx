import * as React from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { SettingsPageClient } from '@/app/settings/settings-client'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const settings = await prisma.settings.findUnique({
    where: {
      userId: session.user.id,
    },
  })

  return <SettingsPageClient settings={settings} />
}


