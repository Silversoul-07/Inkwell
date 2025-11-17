'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Comment {
  id: string
  content: string
  userId: string
  user: {
    name: string | null
    email: string
    image: string | null
  }
  createdAt: Date
  updatedAt: Date
}

interface CommentTooltipProps {
  commentId: string
  position: { x: number; y: number }
  onEdit: (commentId: string, content: string) => void
  onDelete: (commentId: string) => void
  onClose: () => void
}

export function CommentTooltip({
  commentId,
  position,
  onEdit,
  onDelete,
  onClose,
}: CommentTooltipProps) {
  const [comment, setComment] = useState<Comment | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchComment = async () => {
      try {
        const response = await fetch(`/api/comments/${commentId}`)
        if (response.ok) {
          const data = await response.json()
          setComment(data)
        }
      } catch (error) {
        console.error('Failed to fetch comment:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchComment()
  }, [commentId])

  if (isLoading) {
    return (
      <div
        className="fixed z-[100] bg-popover text-popover-foreground rounded-lg shadow-lg border border-border p-3 w-[300px]"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        <p className="text-sm text-muted-foreground">Loading comment...</p>
      </div>
    )
  }

  if (!comment) {
    return null
  }

  return (
    <div
      className="fixed z-[100] bg-popover text-popover-foreground rounded-lg shadow-xl border border-border overflow-hidden w-[320px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onMouseLeave={onClose}
    >
      {/* Header */}
      <div className="px-3 py-2 border-b border-border bg-muted/30 flex items-center gap-2">
        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-3 w-3 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">
            {comment.user.name || comment.user.email}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
      </div>

      {/* Actions */}
      <div className="px-3 py-2 border-t border-border bg-muted/20 flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(comment.id, comment.content)}
          className="flex-1 h-7 text-xs"
        >
          <Edit2 className="h-3 w-3 mr-1" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(comment.id)}
          className="flex-1 h-7 text-xs text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Delete
        </Button>
      </div>
    </div>
  )
}
