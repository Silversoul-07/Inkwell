import { prisma } from '@/lib/prisma'
import { builtinTemplates, builtinModes, exampleInstructions } from '@/prisma/seed'

/**
 * Initialize default templates, modes, and instructions for a user
 * Only runs if the user has no existing data (first login)
 */
export async function initUserDefaults(userId: string) {
  // Check if user already has templates (indicates already initialized)
  const existingTemplates = await prisma.promptTemplate.count({
    where: { userId },
  })

  if (existingTemplates > 0) {
    return { initialized: false }
  }

  // Create built-in templates
  for (const template of builtinTemplates) {
    await prisma.promptTemplate.create({
      data: {
        ...template,
        userId,
      },
    })
  }

  // Create built-in writing modes
  for (const mode of builtinModes) {
    await prisma.writingMode.create({
      data: {
        ...mode,
        userId,
      },
    })
  }

  // Create example user instructions
  for (const instruction of exampleInstructions) {
    await prisma.userInstructions.create({
      data: {
        ...instruction,
        userId,
      },
    })
  }

  return {
    initialized: true,
    created: {
      templates: builtinTemplates.length,
      modes: builtinModes.length,
      instructions: exampleInstructions.length,
    },
  }
}
