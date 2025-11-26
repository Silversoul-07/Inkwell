import { prisma } from '@/lib/prisma'
import { builtinTemplates, builtinModes, exampleInstructions } from '@/prisma/seed'

/**
 * Initialize default templates, modes, and instructions for a user
 * Only runs if the user has no existing data (first login)
 */
export async function initUserDefaults(userId: string) {
  try {
    // Verify user exists first
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      console.error(`User ${userId} not found in database`)
      return { initialized: false, error: 'User not found' }
    }

    // Check if user already has templates (indicates already initialized)
    const existingTemplates = await prisma.promptTemplate.count({
      where: { userId },
    })

    if (existingTemplates > 0) {
      return { initialized: false, reason: 'Already initialized' }
    }

    // Use a transaction to ensure all-or-nothing creation
    await prisma.$transaction(async tx => {
      // Create built-in templates
      for (const template of builtinTemplates) {
        await tx.promptTemplate.create({
          data: {
            ...template,
            userId,
          },
        })
      }

      // Create built-in writing modes
      for (const mode of builtinModes) {
        await tx.writingMode.create({
          data: {
            ...mode,
            userId,
          },
        })
      }

      // Create example user instructions
      for (const instruction of exampleInstructions) {
        await tx.userInstructions.create({
          data: {
            ...instruction,
            userId,
          },
        })
      }
    })

    return {
      initialized: true,
      created: {
        templates: builtinTemplates.length,
        modes: builtinModes.length,
        instructions: exampleInstructions.length,
      },
    }
  } catch (error) {
    console.error('Failed to initialize user defaults:', error)
    return {
      initialized: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
