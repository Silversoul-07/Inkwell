'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useState, useRef } from 'react'
import { Bold, Italic, List, ListOrdered, Undo, Redo } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WikiEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
}

export function WikiEditor({
  content,
  onChange,
  placeholder = 'Click to edit...',
  className,
}: WikiEditorProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit as any],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert focus:outline-none min-h-[1.5em]',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '')
    }
  }, [content, editor])

  // Handle right-click context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      setMenuPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setShowMenu(true)
    }
  }

  // Close menu on click outside
  useEffect(() => {
    const handleClick = () => setShowMenu(false)
    if (showMenu) {
      document.addEventListener('click', handleClick)
      return () => document.removeEventListener('click', handleClick)
    }
  }, [showMenu])

  if (!editor) return null

  const menuItems = [
    { icon: Bold, label: 'Bold', action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
    { icon: Italic, label: 'Italic', action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
    { type: 'divider' },
    { icon: List, label: 'Bullet List', action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
    { icon: ListOrdered, label: 'Numbered List', action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
    { type: 'divider' },
    { icon: Undo, label: 'Undo', action: () => editor.chain().focus().undo().run(), disabled: !editor.can().undo() },
    { icon: Redo, label: 'Redo', action: () => editor.chain().focus().redo().run(), disabled: !editor.can().redo() },
  ]

  return (
    <div ref={containerRef} className={cn('relative', className)} onContextMenu={handleContextMenu}>
      <EditorContent editor={editor} />

      {/* Empty state placeholder */}
      {editor.isEmpty && (
        <div className="absolute top-0 left-0 text-muted-foreground/50 pointer-events-none">
          {placeholder}
        </div>
      )}

      {/* Context Menu */}
      {showMenu && (
        <div
          className="absolute z-50 bg-popover border rounded-md shadow-md py-1 min-w-[160px]"
          style={{ left: menuPos.x, top: menuPos.y }}
        >
          {menuItems.map((item, i) =>
            item.type === 'divider' ? (
              <div key={i} className="h-px bg-border my-1" />
            ) : (
              <button
                key={i}
                type="button"
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted transition-colors text-left',
                  item.active && 'bg-muted',
                  item.disabled && 'opacity-50 cursor-not-allowed'
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  if (!item.disabled) {
                    item.action?.()
                    setShowMenu(false)
                  }
                }}
                disabled={item.disabled}
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                <span>{item.label}</span>
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}
