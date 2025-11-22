'use client'

import React from 'react'

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Simple markdown parser
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n')
    const elements: React.ReactElement[] = []
    let inCodeBlock = false
    let codeLines: string[] = []
    let codeLanguage = ''

    lines.forEach((line, index) => {
      // Code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // End code block
          elements.push(
            <pre key={`code-${index}`} className="bg-muted p-3 rounded-lg overflow-x-auto my-2">
              <code className="text-sm font-mono">{codeLines.join('\n')}</code>
            </pre>
          )
          codeLines = []
          inCodeBlock = false
        } else {
          // Start code block
          codeLanguage = line.slice(3).trim()
          inCodeBlock = true
        }
        return
      }

      if (inCodeBlock) {
        codeLines.push(line)
        return
      }

      // Headers
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-lg font-semibold mt-4 mb-2">
            {line.slice(4)}
          </h3>
        )
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-xl font-bold mt-4 mb-2">
            {line.slice(3)}
          </h2>
        )
      } else if (line.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-2xl font-bold mt-4 mb-2">
            {line.slice(2)}
          </h1>
        )
      }
      // Lists
      else if (line.match(/^[\*\-\+]\s/)) {
        elements.push(
          <li key={index} className="ml-4">
            {formatInlineMarkdown(line.slice(2))}
          </li>
        )
      } else if (line.match(/^\d+\.\s/)) {
        elements.push(
          <li key={index} className="ml-4 list-decimal">
            {formatInlineMarkdown(line.replace(/^\d+\.\s/, ''))}
          </li>
        )
      }
      // Blockquotes
      else if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={index} className="border-l-4 border-primary pl-4 italic my-2">
            {formatInlineMarkdown(line.slice(2))}
          </blockquote>
        )
      }
      // Horizontal rule
      else if (line.match(/^[\-\*\_]{3,}$/)) {
        elements.push(<hr key={index} className="my-4 border-border" />)
      }
      // Inline code
      else if (line.trim()) {
        elements.push(
          <p key={index} className="my-1">
            {formatInlineMarkdown(line)}
          </p>
        )
      } else {
        elements.push(<br key={index} />)
      }
    })

    return elements
  }

  const formatInlineMarkdown = (text: string) => {
    const parts: (string | React.ReactElement)[] = []
    let remaining = text
    let key = 0

    while (remaining.length > 0) {
      // Inline code
      const codeMatch = remaining.match(/`([^`]+)`/)
      if (codeMatch && codeMatch.index !== undefined) {
        if (codeMatch.index > 0) {
          const formatted = formatBoldItalic(remaining.slice(0, codeMatch.index), key++)
          if (Array.isArray(formatted)) {
            parts.push(...formatted)
          } else {
            parts.push(formatted)
          }
        }
        parts.push(
          <code key={`code-${key++}`} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
            {codeMatch[1]}
          </code>
        )
        remaining = remaining.slice(codeMatch.index + codeMatch[0].length)
        continue
      }

      // Links
      const linkMatch = remaining.match(/\[([^\]]+)\]\(([^\)]+)\)/)
      if (linkMatch && linkMatch.index !== undefined) {
        if (linkMatch.index > 0) {
          const formatted = formatBoldItalic(remaining.slice(0, linkMatch.index), key++)
          if (Array.isArray(formatted)) {
            parts.push(...formatted)
          } else {
            parts.push(formatted)
          }
        }
        parts.push(
          <a
            key={`link-${key++}`}
            href={linkMatch[2]}
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {linkMatch[1]}
          </a>
        )
        remaining = remaining.slice(linkMatch.index + linkMatch[0].length)
        continue
      }

      const formatted = formatBoldItalic(remaining, key++)
      if (Array.isArray(formatted)) {
        parts.push(...formatted)
      } else {
        parts.push(formatted)
      }
      break
    }

    return parts
  }

  const formatBoldItalic = (text: string, key: number) => {
    const parts: (string | React.ReactElement)[] = []
    let remaining = text
    let innerKey = 0

    while (remaining.length > 0) {
      // Bold
      const boldMatch = remaining.match(/\*\*([^\*]+)\*\*/)
      if (boldMatch && boldMatch.index !== undefined) {
        if (boldMatch.index > 0) {
          const formatted = formatItalic(remaining.slice(0, boldMatch.index), innerKey++)
          if (Array.isArray(formatted)) {
            parts.push(...formatted)
          } else {
            parts.push(formatted)
          }
        }
        parts.push(
          <strong key={`bold-${key}-${innerKey++}`} className="font-bold">
            {boldMatch[1]}
          </strong>
        )
        remaining = remaining.slice(boldMatch.index + boldMatch[0].length)
        continue
      }

      // Italic
      const italicMatch = remaining.match(/\*([^\*]+)\*/)
      if (italicMatch && italicMatch.index !== undefined) {
        if (italicMatch.index > 0) {
          parts.push(remaining.slice(0, italicMatch.index))
        }
        parts.push(
          <em key={`italic-${key}-${innerKey++}`} className="italic">
            {italicMatch[1]}
          </em>
        )
        remaining = remaining.slice(italicMatch.index + italicMatch[0].length)
        continue
      }

      parts.push(remaining)
      break
    }

    return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts
  }

  const formatItalic = (text: string, key: number) => {
    const italicMatch = text.match(/\*([^\*]+)\*/)
    if (italicMatch && italicMatch.index !== undefined) {
      return [
        text.slice(0, italicMatch.index),
        <em key={`italic-inner-${key}`} className="italic">
          {italicMatch[1]}
        </em>,
        text.slice(italicMatch.index + italicMatch[0].length),
      ]
    }
    return text
  }

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">{renderMarkdown(content)}</div>
  )
}
