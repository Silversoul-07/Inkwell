import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Built-in Prompt Templates
const builtinTemplates = [
  // CONTINUE ACTION TEMPLATES
  {
    name: 'Standard Continue',
    description: 'Default continuation style',
    action: 'continue',
    template: 'Continue writing this {{genre}} story naturally, maintaining the same tone and style. Keep the {{pov}} perspective and {{tense}} tense consistent.',
    variables: JSON.stringify(['genre', 'pov', 'tense']),
    isDefault: true,
    isBuiltin: true,
    category: 'standard',
  },
  {
    name: 'Descriptive Continue',
    description: 'Focus on sensory details and atmosphere',
    action: 'continue',
    template: 'Continue this story with rich sensory details and atmospheric description. Focus on what the characters see, hear, smell, and feel. Paint a vivid picture. Maintain {{pov}} perspective.',
    variables: JSON.stringify(['pov']),
    isDefault: false,
    isBuiltin: true,
    category: 'style',
  },
  {
    name: 'Dialogue-Heavy Continue',
    description: 'Emphasize character conversations',
    action: 'continue',
    template: 'Continue this story by advancing the plot through dialogue. Focus on natural conversation between characters. Show personality through speech patterns and word choice.',
    variables: JSON.stringify([]),
    isDefault: false,
    isBuiltin: true,
    category: 'style',
  },
  {
    name: 'Action-Packed Continue',
    description: 'Fast-paced, energetic continuation',
    action: 'continue',
    template: 'Continue with fast-paced action. Use short, punchy sentences. Keep the momentum high. Focus on movement, decisions, and consequences.',
    variables: JSON.stringify([]),
    isDefault: false,
    isBuiltin: true,
    category: 'style',
  },
  {
    name: 'Introspective Continue',
    description: 'Internal thoughts and emotions',
    action: 'continue',
    template: 'Continue by exploring the character\'s internal thoughts and emotions. Show their inner conflict, memories, and decision-making process. Deep character introspection.',
    variables: JSON.stringify([]),
    isDefault: false,
    isBuiltin: true,
    category: 'style',
  },

  // REPHRASE ACTION TEMPLATES
  {
    name: 'Standard Rephrase',
    description: 'Improve clarity and flow',
    action: 'rephrase',
    template: 'Rephrase this text to improve clarity and flow while keeping the same meaning: "{{selection}}"',
    variables: JSON.stringify(['selection']),
    isDefault: true,
    isBuiltin: true,
    category: 'standard',
  },
  {
    name: 'Simplify',
    description: 'Make clearer and more concise',
    action: 'rephrase',
    template: 'Simplify this text. Make it clearer, more concise, and easier to understand: "{{selection}}"',
    variables: JSON.stringify(['selection']),
    isDefault: false,
    isBuiltin: true,
    category: 'style',
  },
  {
    name: 'Elaborate',
    description: 'Add more detail and nuance',
    action: 'rephrase',
    template: 'Expand and elaborate on this text. Add more detail, nuance, and depth: "{{selection}}"',
    variables: JSON.stringify(['selection']),
    isDefault: false,
    isBuiltin: true,
    category: 'style',
  },
  {
    name: 'Formal Tone',
    description: 'Professional, formal writing',
    action: 'rephrase',
    template: 'Rewrite this text in a formal, professional tone: "{{selection}}"',
    variables: JSON.stringify(['selection']),
    isDefault: false,
    isBuiltin: true,
    category: 'tone',
  },
  {
    name: 'Casual Tone',
    description: 'Conversational, approachable writing',
    action: 'rephrase',
    template: 'Rewrite this text in a casual, conversational tone: "{{selection}}"',
    variables: JSON.stringify(['selection']),
    isDefault: false,
    isBuiltin: true,
    category: 'tone',
  },

  // EXPAND ACTION TEMPLATES
  {
    name: 'Standard Expand',
    description: 'Add detail and depth',
    action: 'expand',
    template: 'Expand on this text with more detail, description, and depth: "{{selection}}"',
    variables: JSON.stringify(['selection']),
    isDefault: true,
    isBuiltin: true,
    category: 'standard',
  },
  {
    name: 'Sensory Expansion',
    description: 'Add sensory details',
    action: 'expand',
    template: 'Expand this text by adding rich sensory details (sight, sound, smell, touch, taste): "{{selection}}"',
    variables: JSON.stringify(['selection']),
    isDefault: false,
    isBuiltin: true,
    category: 'style',
  },

  // SHORTEN ACTION TEMPLATES
  {
    name: 'Standard Shorten',
    description: 'Make more concise',
    action: 'shorten',
    template: 'Make this text more concise while keeping the key points: "{{selection}}"',
    variables: JSON.stringify(['selection']),
    isDefault: true,
    isBuiltin: true,
    category: 'standard',
  },

  // GRAMMAR ACTION TEMPLATES
  {
    name: 'Standard Grammar Fix',
    description: 'Fix grammar, spelling, and punctuation',
    action: 'grammar',
    template: 'Fix any grammar, spelling, or punctuation errors in this text: "{{selection}}"',
    variables: JSON.stringify(['selection']),
    isDefault: true,
    isBuiltin: true,
    category: 'standard',
  },
]

// Built-in Writing Modes
const builtinModes = [
  {
    name: 'Balanced',
    description: 'Standard creative writing mode with balanced settings',
    isBuiltin: true,
    temperature: 0.7,
    maxTokens: 500,
    systemPrompt: 'You are a creative writing assistant. Help the writer craft engaging, well-written prose.',
    continuePrompt: null,
    preferredActions: JSON.stringify(['continue', 'rephrase', 'expand', 'shorten', 'grammar']),
  },
  {
    name: 'Plotter',
    description: 'Structured, outline-focused writing with consistency',
    isBuiltin: true,
    temperature: 0.5,
    maxTokens: 500,
    systemPrompt: 'Focus on plot structure and consistency. Maintain continuity with established plot points and character arcs. Think ahead to consequences.',
    continuePrompt: 'Continue while keeping the overall plot structure in mind. Ensure this advances the story arc meaningfully.',
    preferredActions: JSON.stringify(['continue', 'expand', 'grammar']),
  },
  {
    name: 'Pantser',
    description: 'Flow and discovery writing with higher creativity',
    isBuiltin: true,
    temperature: 0.8,
    maxTokens: 600,
    systemPrompt: 'Encourage creative flow and character discovery. Embrace unexpected developments and character-driven plot evolution.',
    continuePrompt: 'Continue by following the natural flow of the story. Let characters surprise you with their choices.',
    preferredActions: JSON.stringify(['continue', 'rephrase', 'expand']),
  },
  {
    name: 'Dialogue Master',
    description: 'Optimized for natural character conversations',
    isBuiltin: true,
    temperature: 0.75,
    maxTokens: 400,
    systemPrompt: 'Focus on natural dialogue and character voice. Each character should have distinct speech patterns, vocabulary, and mannerisms. Show personality through dialogue.',
    continuePrompt: 'Continue with natural dialogue that reveals character and advances the plot. Include subtext and emotional undertones.',
    preferredActions: JSON.stringify(['continue', 'rephrase']),
  },
  {
    name: 'Description Mode',
    description: 'Rich sensory details and atmosphere',
    isBuiltin: true,
    temperature: 0.7,
    maxTokens: 600,
    systemPrompt: 'Emphasize sensory details, vivid imagery, and atmospheric description. Paint pictures with words. Appeal to all five senses.',
    continuePrompt: 'Continue with rich, sensory descriptions. Create vivid imagery and strong atmosphere.',
    preferredActions: JSON.stringify(['continue', 'expand', 'rephrase']),
  },
  {
    name: 'Action Mode',
    description: 'Fast-paced scenes with momentum',
    isBuiltin: true,
    temperature: 0.6,
    maxTokens: 400,
    systemPrompt: 'Write fast-paced action. Use short, powerful sentences. Maintain momentum and tension. Focus on beats, not exposition.',
    continuePrompt: 'Continue the action. Keep it fast-paced with short sentences. Maintain high energy and tension.',
    preferredActions: JSON.stringify(['continue', 'shorten']),
  },
  {
    name: 'Literary/Poetic',
    description: 'Elevated prose with literary devices',
    isBuiltin: true,
    temperature: 0.8,
    maxTokens: 600,
    systemPrompt: 'Use literary devices: metaphors, similes, symbolism, alliteration. Craft beautiful, elevated prose. Focus on rhythm and flow.',
    continuePrompt: 'Continue with literary, poetic language. Use metaphors and elevated prose.',
    preferredActions: JSON.stringify(['continue', 'rephrase', 'expand']),
  },
  {
    name: 'Screenplay',
    description: 'Script format for screenplays',
    isBuiltin: true,
    temperature: 0.6,
    maxTokens: 500,
    systemPrompt: 'Write in screenplay format: INT/EXT for locations, character names in caps, action lines, and dialogue. Focus on what can be seen and heard.',
    continuePrompt: 'Continue in screenplay format. Show don\'t tell. Focus on visual action and dialogue.',
    preferredActions: JSON.stringify(['continue', 'rephrase']),
  },
]

// Example User Instructions
const exampleInstructions = [
  {
    scope: 'global',
    instructions: 'Always maintain consistency with established character personalities and backstories.',
    isEnabled: true,
    priority: 5,
  },
  {
    scope: 'global',
    instructions: 'Avoid clichés and overused phrases. Strive for fresh, original descriptions.',
    isEnabled: true,
    priority: 4,
  },
  {
    scope: 'global',
    instructions: 'Show emotions through actions and body language rather than telling.',
    isEnabled: true,
    priority: 3,
  },
  {
    scope: 'global',
    instructions: 'Keep dialogue natural and character-appropriate. Consider age, background, and personality.',
    isEnabled: true,
    priority: 4,
  },
  {
    scope: 'global',
    instructions: 'Use active voice when possible for more engaging prose.',
    isEnabled: true,
    priority: 2,
  },
]

async function main() {
  console.log('Starting seed...')

  // Note: Built-in templates and modes are created per-user on signup
  // This seed file documents the built-in content structure

  console.log('Built-in templates structure:')
  console.log(`- ${builtinTemplates.length} prompt templates`)
  console.log('Built-in modes structure:')
  console.log(`- ${builtinModes.length} writing modes`)
  console.log('Example user instructions:')
  console.log(`- ${exampleInstructions.length} global instructions`)

  console.log('Seed structure documented successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

// Export the built-in data for use in signup/initialization
export { builtinTemplates, builtinModes, exampleInstructions }
