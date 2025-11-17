'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'

interface CommentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedText: string
  onSubmit: (content: string) => Promise<void>
  initialContent?: string
  mode?: 'create' | 'edit'
}

export function CommentDialog({
  open,
  onOpenChange,
  selectedText,
  onSubmit,
  initialContent = '',
  mode = 'create',
}: CommentDialogProps) {
  const [content, setContent] = useState(initialContent)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setContent(initialContent)
    }
  }, [open, initialContent])

  const handleSubmit = async () => {
    if (!content.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit(content)
      setContent('')
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to submit comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add Comment' : 'Edit Comment'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a comment to the selected text. It will be highlighted in your document.'
              : 'Update your comment.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {selectedText && (
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Selected Text:
              </p>
              <p className="text-sm italic line-clamp-3">"{selectedText}"</p>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium">
              Comment
            </label>
            <Textarea
              id="comment"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your comment here..."
              className="min-h-[120px] resize-none"
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {mode === 'create' ? 'Add Comment' : 'Update Comment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
