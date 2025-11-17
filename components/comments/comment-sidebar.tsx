'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Plus, Check, Trash2, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Comment {
  id: string
  sceneId: string
  userId: string
  content: string
  isResolved: boolean
  startPos: number | null
  endPos: number | null
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  replies: CommentReply[]
}

interface CommentReply {
  id: string
  commentId: string
  userId: string
  content: string
  createdAt: Date
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

interface CommentSidebarProps {
  sceneId: string
  onCommentSelect?: (comment: Comment) => void
}

export function CommentSidebar({ sceneId, onCommentSelect }: CommentSidebarProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')

  useEffect(() => {
    loadComments()
  }, [sceneId])

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/comments?sceneId=${sceneId}`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error('Failed to load comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneId,
          content: newComment,
        }),
      })

      if (response.ok) {
        await loadComments()
        setNewComment('')
      }
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }

  const handleResolve = async (commentId: string, isResolved: boolean) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isResolved: !isResolved }),
      })

      if (response.ok) {
        await loadComments()
      }
    } catch (error) {
      console.error('Failed to resolve comment:', error)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadComments()
      }
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }

  const handleAddReply = async (commentId: string) => {
    if (!replyContent.trim()) return

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneId,
          content: replyContent,
          commentId,
        }),
      })

      if (response.ok) {
        await loadComments()
        setReplyTo(null)
        setReplyContent('')
      }
    } catch (error) {
      console.error('Failed to add reply:', error)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments ({comments.length})
        </h3>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* New Comment Input */}
          <Card>
            <CardContent className="pt-4">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  size="sm"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Comment
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Comments List */}
          {comments.map((comment) => (
            <Card
              key={comment.id}
              className={comment.isResolved ? 'opacity-60' : ''}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {comment.user.name || 'User'}
                      {comment.isResolved && (
                        <Badge variant="secondary" className="text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          Resolved
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {new Date(comment.createdAt).toLocaleString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleResolve(comment.id, comment.isResolved)
                      }
                      className="h-8 w-8"
                      title={
                        comment.isResolved ? 'Mark as unresolved' : 'Resolve'
                      }
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(comment.id)}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{comment.content}</p>

                {/* Replies */}
                {comment.replies.length > 0 && (
                  <div className="space-y-2 pl-4 border-l-2">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium">
                            {reply.user.name || 'User'}
                          </span>
                          <span>
                            {new Date(reply.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Input */}
                {replyTo === comment.id ? (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Write a reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={2}
                      className="text-sm"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReplyTo(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAddReply(comment.id)}
                        disabled={!replyContent.trim()}
                      >
                        Reply
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyTo(comment.id)}
                    className="text-xs"
                  >
                    Reply
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}

          {comments.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No comments yet. Add your first comment above.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
