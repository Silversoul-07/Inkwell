'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface AlternativesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  alternatives: string[]
  onSelect: (alternative: string) => void
}

export function AlternativesDialog({
  open,
  onOpenChange,
  alternatives,
  onSelect,
}: AlternativesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Choose an Alternative</DialogTitle>
          <DialogDescription>
            Select one of these AI-generated alternatives to replace your selection
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {alternatives.map((alt, index) => (
            <div
              key={index}
              className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-2">
                    Option {index + 1}
                  </div>
                  <p className="text-sm leading-relaxed">{alt}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => onSelect(alt)}
                >
                  Use This
                </Button>
              </div>
            </div>
          ))}
        </div>

        {alternatives.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No alternatives generated yet
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
