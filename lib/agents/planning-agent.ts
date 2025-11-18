// Multi-phase story planning agent using plain OpenAI for maximum control

import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'
import { AGENT_SYSTEM_PROMPTS } from './system-prompts'
import type { AgentContext } from './tools'

interface PlanningPhase {
  name: string
  prompt: string
  requiresProjectContext?: boolean
}

/**
 * Multi-phase planning agent
 * Phases: Analyze → Identify Issues → Generate Recommendations
 */
export async function executeStoryPlanningAgent(
  context: AgentContext,
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }>
) {
  // Get AI model configuration
  let aiModel

  if (context.modelId) {
    // Use specified model
    aiModel = await prisma.aIModel.findFirst({
      where: { id: context.modelId, userId: context.userId },
    })
  } else {
    // Fall back to default model
    aiModel = await prisma.aIModel.findFirst({
      where: { userId: context.userId, isDefault: true },
    })
  }

  if (!aiModel) {
    throw new Error('No AI model configured. Please select a model or set a default in Settings.')
  }

  const openai = new OpenAI({
    apiKey: aiModel.apiKey || '',
    baseURL: aiModel.baseUrl || undefined,
  })

  // Determine if this requires multi-phase planning
  const needsPlanning = await shouldUsePlanningMode(openai, aiModel.model, userMessage)

  if (!needsPlanning) {
    // Simple conversation mode
    return await simpleChat(openai, aiModel.model, conversationHistory, userMessage, context)
  }

  // Multi-phase planning mode
  return await multiPhasePlanning(openai, aiModel.model, conversationHistory, userMessage, context)
}

/**
 * Determine if the user's message requires multi-phase planning
 */
async function shouldUsePlanningMode(
  openai: OpenAI,
  model: string,
  userMessage: string
): Promise<boolean> {
  const response = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: `You are a classifier. Determine if the user's message requires multi-phase story planning analysis.

Multi-phase planning is needed for:
- "Analyze my story structure"
- "Find plot holes"
- "Help me outline my story"
- "What's wrong with my pacing?"
- "Identify issues in my plot"

Simple conversation for:
- "What is the hero's journey?"
- "Should I use past or present tense?"
- "How do I write a good opening?"

Respond with only "true" or "false".`,
      },
      {
        role: 'user',
        content: userMessage,
      },
    ],
    temperature: 0,
  })

  return response.choices[0].message.content?.trim().toLowerCase() === 'true'
}

/**
 * Simple chat mode for general questions
 */
async function simpleChat(
  openai: OpenAI,
  model: string,
  conversationHistory: Array<{ role: string; content: string }>,
  userMessage: string,
  context: AgentContext
) {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: AGENT_SYSTEM_PROMPTS['story-planning'],
    },
    ...conversationHistory.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
    {
      role: 'user',
      content: userMessage,
    },
  ]

  const response = await openai.chat.completions.create({
    model,
    messages,
    temperature: 0.7,
  })

  return {
    role: 'assistant' as const,
    content: response.choices[0].message.content || '',
    toolCalls: undefined,
    toolResults: undefined,
  }
}

/**
 * Multi-phase planning: Analyze → Identify → Recommend
 */
async function multiPhasePlanning(
  openai: OpenAI,
  model: string,
  conversationHistory: Array<{ role: string; content: string }>,
  userMessage: string,
  context: AgentContext
) {
  // Get project context
  const projectContext = context.projectId
    ? await getProjectContext(context.projectId)
    : null

  const phases: PlanningPhase[] = [
    {
      name: 'Analysis',
      prompt: `You are in ANALYSIS phase. Analyze the story structure based on:

User Request: ${userMessage}

${projectContext ? `Project Context:\n${JSON.stringify(projectContext, null, 2)}` : 'No project context available.'}

Previous Conversation:
${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}

Provide a structured analysis of:
1. Current story structure
2. Key plot points identified
3. Character arcs present
4. Pacing observations
5. Thematic elements

Be specific and reference actual content from the project.`,
    },
    {
      name: 'Issue Identification',
      prompt: `You are in ISSUE IDENTIFICATION phase. Based on your previous analysis, identify specific problems:

Look for:
1. Plot holes or logical inconsistencies
2. Pacing issues (too slow, too fast, uneven)
3. Missing story beats (setup without payoff, etc.)
4. Character arc issues (flat characters, inconsistent behavior)
5. Structural weaknesses (weak climax, unclear conflict, etc.)

List each issue with:
- Severity (Critical, Major, Minor)
- Location (which chapter/scene)
- Specific description
- Impact on the story`,
    },
    {
      name: 'Recommendations',
      prompt: `You are in RECOMMENDATIONS phase. Based on identified issues, provide actionable solutions:

For each issue:
1. Suggest specific fixes
2. Explain WHY this will improve the story
3. Provide examples or alternatives
4. Prioritize (must-fix vs. nice-to-have)

Include:
- Quick wins (easy improvements)
- Strategic changes (larger structural fixes)
- Optional enhancements

Be constructive and encouraging while being honest about what needs work.`,
    },
  ]

  let phaseResults: string[] = []
  let cumulativeContext = ''

  // Execute each phase sequentially
  for (const phase of phases) {
    const phaseMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `${AGENT_SYSTEM_PROMPTS['story-planning']}

You are executing a multi-phase analysis. Current phase: ${phase.name}

${cumulativeContext}`,
      },
      {
        role: 'user',
        content: phase.prompt,
      },
    ]

    const response = await openai.chat.completions.create({
      model,
      messages: phaseMessages,
      temperature: 0.7,
    })

    const phaseResult = response.choices[0].message.content || ''
    phaseResults.push(`## ${phase.name}\n\n${phaseResult}`)

    // Add this phase's result to context for next phase
    cumulativeContext += `\n\n### Results from ${phase.name} phase:\n${phaseResult}`
  }

  // Save the analysis to agent memory
  if (context.projectId) {
    await prisma.agentMemory.create({
      data: {
        userId: context.userId,
        projectId: context.projectId,
        agentType: 'story-planning',
        category: 'plot-analysis',
        key: `analysis-${Date.now()}`,
        content: phaseResults.join('\n\n---\n\n'),
        importance: 8,
      },
    })
  }

  // Combine all phases into final response
  const finalResponse = `I've completed a comprehensive ${phases.length}-phase analysis of your story:\n\n${phaseResults.join('\n\n---\n\n')}\n\n**Note:** This analysis has been saved to your project memory for future reference.`

  return {
    role: 'assistant' as const,
    content: finalResponse,
    toolCalls: [
      {
        id: 'planning-phases',
        name: 'multiPhaseAnalysis',
        arguments: { phases: phases.map(p => p.name) },
      },
    ],
    toolResults: undefined,
  }
}

/**
 * Get project context for planning
 */
async function getProjectContext(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      chapters: {
        include: {
          scenes: {
            select: {
              id: true,
              title: true,
              wordCount: true,
              order: true,
              content: true,
            },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!project) {
    return null
  }

  // Get existing plot memories
  const plotMemories = await prisma.agentMemory.findMany({
    where: {
      projectId,
      agentType: 'story-planning',
    },
    orderBy: { importance: 'desc' },
    take: 10,
  })

  return {
    project: {
      title: project.title,
      description: project.description,
      genre: project.genre,
      subgenre: project.subgenre,
      targetAudience: project.targetAudience,
      pov: project.pov,
      tense: project.tense,
      targetWordCount: project.targetWordCount,
      status: project.status,
    },
    chapters: project.chapters.map(ch => ({
      title: ch.title,
      order: ch.order,
      sceneCount: ch.scenes.length,
      wordCount: ch.scenes.reduce((sum, s) => sum + s.wordCount, 0),
      scenes: ch.scenes.map(s => ({
        title: s.title,
        wordCount: s.wordCount,
        contentPreview: s.content.substring(0, 500) + '...',
      })),
    })),
    totalWordCount: project.chapters.reduce(
      (sum, ch) => sum + ch.scenes.reduce((s, sc) => s + sc.wordCount, 0),
      0
    ),
    previousAnalyses: plotMemories.map(m => ({
      category: m.category,
      key: m.key,
      summary: m.content.substring(0, 200) + '...',
    })),
  }
}
