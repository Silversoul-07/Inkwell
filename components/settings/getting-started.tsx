'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, CheckCircle2, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function GettingStarted() {
  const { toast } = useToast()
  const [isInitializing, setIsInitializing] = useState(false)
  const [initialized, setInitialized] = useState(false)

  const handleInitialize = async () => {
    setIsInitializing(true)
    try {
      const response = await fetch('/api/initialize-defaults', {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        setInitialized(true)
        toast({
          title: 'Success!',
          description: `Initialized ${data.created.templates} templates, ${data.created.modes} writing modes, and ${data.created.instructions} user instructions.`,
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to initialize defaults',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to initialize defaults:', error)
      toast({
        title: 'Error',
        description: 'Failed to initialize defaults',
        variant: 'destructive',
      })
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Getting Started</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Set up your Inkwell workspace with default templates and settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Initialize Default Content</CardTitle>
              <CardDescription className="mt-1">
                Get started quickly with pre-built prompt templates, writing modes, and user instructions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h3 className="font-medium">What you'll get:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                <span>
                  <strong className="text-foreground">15 Prompt Templates</strong> - Including Standard Continue, Descriptive Continue, Dialogue-Heavy, Rephrase, Expand, Shorten, and Grammar Fix templates
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                <span>
                  <strong className="text-foreground">8 Writing Modes</strong> - Balanced, Plotter, Pantser, Dialogue Master, Description Mode, Action Mode, Literary/Poetic, and Screenplay modes
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                <span>
                  <strong className="text-foreground">5 User Instructions</strong> - Best practices for maintaining character consistency, avoiding clichés, showing emotions, natural dialogue, and active voice
                </span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t">
            <Button
              onClick={handleInitialize}
              disabled={isInitializing || initialized}
              size="lg"
              className="w-full"
            >
              {isInitializing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Initializing...
                </>
              ) : initialized ? (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Initialized!
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Initialize Default Content
                </>
              )}
            </Button>
            {initialized && (
              <p className="text-sm text-muted-foreground text-center mt-3">
                You can now explore the other tabs to customize your templates, modes, and instructions.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm">
            <li className="flex gap-2">
              <span className="font-semibold text-primary">1.</span>
              <span>Initialize the default content above (if you haven't already)</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-primary">2.</span>
              <span>Configure your AI models in the <strong>AI Models</strong> tab</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-primary">3.</span>
              <span>Customize prompt templates in the <strong>Prompt Templates</strong> tab</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-primary">4.</span>
              <span>Try different writing modes in the <strong>Writing Modes</strong> tab</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-primary">5.</span>
              <span>Set up your writing preferences in the <strong>User Instructions</strong> tab</span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
