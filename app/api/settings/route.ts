import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const settings = await prisma.settings.update({
      where: {
        userId: session.user.id,
      },
      data: {
        aiProvider: body.aiProvider,
        aiEndpoint: body.aiEndpoint,
        aiApiKey: body.aiApiKey,
        aiModel: body.aiModel,
        aiTemperature: body.aiTemperature,
        aiMaxTokens: body.aiMaxTokens,
        editorFont: body.editorFont,
        editorFontSize: body.editorFontSize,
        editorLineHeight: body.editorLineHeight,
        editorWidth: body.editorWidth,
        autoSaveInterval: body.autoSaveInterval,
      },
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
