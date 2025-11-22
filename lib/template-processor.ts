/**
 * Process prompt templates by replacing variables with actual values
 */

interface TemplateVariables {
  selection?: string
  context?: string
  genre?: string
  tone?: string
  pov?: string
  character?: string
  style?: string
  tense?: string
  instructions?: string
  [key: string]: string | undefined
}

/**
 * Replace variables in a template with provided values
 * Variables use {{variableName}} syntax
 */
export function processTemplate(template: string, variables: TemplateVariables): string {
  let result = template

  // Replace each variable
  Object.keys(variables).forEach(key => {
    const value = variables[key]
    if (value !== undefined) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
      result = result.replace(regex, value)
    }
  })

  // Remove any unreplaced variables (replace with empty string)
  result = result.replace(/\{\{[^}]+\}\}/g, '')

  return result
}

/**
 * Build variables object from editor context
 */
export function buildEditorVariables(context: {
  selection?: string
  sceneContext?: string
  genre?: string
  pov?: string
  tense?: string
  tone?: string
  style?: string
  character?: string
  instructions?: string
}): TemplateVariables {
  return {
    selection: context.selection || '',
    context: context.sceneContext || '',
    genre: context.genre || '',
    pov: context.pov || '',
    tense: context.tense || '',
    tone: context.tone || '',
    style: context.style || '',
    character: context.character || '',
    instructions: context.instructions || '',
  }
}
