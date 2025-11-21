"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState, useRef } from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Wand2,
  CheckCircle,
  RefreshCw,
  Minimize2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WikiEditorProps {
  content: string;
  onChange: (text: string) => void;
  placeholder?: string;
  className?: string;
}

export function WikiEditor({
  content,
  onChange,
  placeholder = "Click to edit...",
  className,
}: WikiEditorProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [hasSelection, setHasSelection] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit as any],
    content: content || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert focus:outline-none min-h-[1.5em]",
      },
    },
    onUpdate: ({ editor }) => {
      // Get plain text for storage
      onChange(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      setHasSelection(from !== to);
    },
  });

  // Sync content when prop changes (e.g., navigating between entries)
  useEffect(() => {
    if (editor) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setMenuPos({
        x: Math.min(e.clientX - rect.left, rect.width - 180),
        y: e.clientY - rect.top,
      });
      setShowMenu(true);
    }
  };

  useEffect(() => {
    const handleClick = () => setShowMenu(false);
    if (showMenu) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [showMenu]);

  if (!editor) return null;

  const formatItems = [
    {
      icon: Bold,
      label: "Bold",
      action: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
    },
    {
      icon: Italic,
      label: "Italic",
      action: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
    },
    {
      icon: List,
      label: "Bullet List",
      action: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
    },
    {
      icon: ListOrdered,
      label: "Numbered List",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
    },
  ];

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      onContextMenu={handleContextMenu}
    >
      <EditorContent editor={editor} />

      {editor.isEmpty && (
        <div className="absolute top-0 left-0 text-muted-foreground/50 pointer-events-none">
          {placeholder}
        </div>
      )}

      {showMenu && (
        <div
          className="absolute z-50 bg-popover border rounded-md shadow-lg py-1 min-w-[180px]"
          style={{ left: menuPos.x, top: menuPos.y }}
        >
          {/* Formatting Icons Row */}
          <div className="flex items-center gap-1 px-2 py-1.5 border-b">
            {formatItems.map((item, i) => (
              <button
                key={i}
                type="button"
                className={cn(
                  "p-1.5 rounded hover:bg-muted transition-colors",
                  item.active && "bg-muted",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  item.action();
                }}
                title={item.label}
              >
                <item.icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
