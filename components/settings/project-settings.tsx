'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2, BookOpen, Settings2, Target, Tag as TagIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Project {
  id: string
  title: string
  description: string | null
  genre: string | null
  subgenre: string | null
  targetAudience: string | null
  pov: string | null
  tense: string | null
  targetWordCount: number | null
  tags: string | null
  notes: string | null
  coverImage: string | null
  status: string
  defaultTemperature: number | null
  defaultMaxTokens: number | null
  contextWindowSize: number
  activeWritingMode: string | null
  metadata: string | null
}

interface ProjectSettingsProps {
  projectId: string
}

export function ProjectSettings({ projectId }: ProjectSettingsProps) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    subgenre: '',
    targetAudience: '',
    pov: '',
    tense: '',
    targetWordCount: 0,
    notes: '',
    coverImage: '',
    status: 'draft',
    defaultTemperature: 0.7,
    defaultMaxTokens: 500,
    contextWindowSize: 8000,
  })

  useEffect(() => {
    loadProject()
  }, [projectId])

  const loadProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data)

        // Parse tags
        const parsedTags = data.tags ? JSON.parse(data.tags) : []
        setTags(parsedTags)

        // Set form data
        setFormData({
          title: data.title || '',
          description: data.description || '',
          genre: data.genre || '',
          subgenre: data.subgenre || '',
          targetAudience: data.targetAudience || '',
          pov: data.pov || '',
          tense: data.tense || '',
          targetWordCount: data.targetWordCount || 0,
          notes: data.notes || '',
          coverImage: data.coverImage || '',
          status: data.status || 'draft',
          defaultTemperature: data.defaultTemperature || 0.7,
          defaultMaxTokens: data.defaultMaxTokens || 500,
          contextWindowSize: data.contextWindowSize || 8000,
        })
      }
    } catch (error) {
      console.error('Failed to load project:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: JSON.stringify(tags),
        }),
      })

      if (response.ok) {
        const updated = await response.json()
        setProject(updated)
        // Show success feedback
      }
    } catch (error) {
      console.error('Failed to save project:', error)
      alert('Failed to save project settings')
    } finally {
      setSaving(false)
    }
  }

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag])
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Project Settings</h2>
          <p className="text-sm text-muted-foreground">
            Configure your project metadata and AI behavior
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle>Basic Information</CardTitle>
          </div>
          <CardDescription>
            Core details about your project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="My Novel"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="A brief description of your project..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="revision">Revision</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="abandoned">Abandoned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Story Metadata */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            <CardTitle>Story Metadata</CardTitle>
          </div>
          <CardDescription>
            These settings influence how the AI understands and continues your story
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Select
                value={formData.genre}
                onValueChange={(value) =>
                  setFormData({ ...formData, genre: value })
                }
              >
                <SelectTrigger id="genre">
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fantasy">Fantasy</SelectItem>
                  <SelectItem value="science-fiction">Science Fiction</SelectItem>
                  <SelectItem value="mystery">Mystery</SelectItem>
                  <SelectItem value="thriller">Thriller</SelectItem>
                  <SelectItem value="romance">Romance</SelectItem>
                  <SelectItem value="horror">Horror</SelectItem>
                  <SelectItem value="literary">Literary Fiction</SelectItem>
                  <SelectItem value="historical">Historical Fiction</SelectItem>
                  <SelectItem value="contemporary">Contemporary</SelectItem>
                  <SelectItem value="young-adult">Young Adult</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subgenre">Subgenre</Label>
              <Input
                id="subgenre"
                value={formData.subgenre}
                onChange={(e) =>
                  setFormData({ ...formData, subgenre: e.target.value })
                }
                placeholder="e.g., Urban Fantasy, Space Opera"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pov">Point of View</Label>
              <Select
                value={formData.pov}
                onValueChange={(value) =>
                  setFormData({ ...formData, pov: value })
                }
              >
                <SelectTrigger id="pov">
                  <SelectValue placeholder="Select POV" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="first-person">First Person</SelectItem>
                  <SelectItem value="second-person">Second Person</SelectItem>
                  <SelectItem value="third-person-limited">Third Person Limited</SelectItem>
                  <SelectItem value="third-person-omniscient">Third Person Omniscient</SelectItem>
                  <SelectItem value="multiple">Multiple POV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tense">Tense</Label>
              <Select
                value={formData.tense}
                onValueChange={(value) =>
                  setFormData({ ...formData, tense: value })
                }
              >
                <SelectTrigger id="tense">
                  <SelectValue placeholder="Select tense" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="past">Past Tense</SelectItem>
                  <SelectItem value="present">Present Tense</SelectItem>
                  <SelectItem value="future">Future Tense</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Select
                value={formData.targetAudience}
                onValueChange={(value) =>
                  setFormData({ ...formData, targetAudience: value })
                }
              >
                <SelectTrigger id="targetAudience">
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="children">Children (0-8)</SelectItem>
                  <SelectItem value="middle-grade">Middle Grade (8-12)</SelectItem>
                  <SelectItem value="young-adult">Young Adult (12-18)</SelectItem>
                  <SelectItem value="new-adult">New Adult (18-25)</SelectItem>
                  <SelectItem value="adult">Adult (18+)</SelectItem>
                  <SelectItem value="all-ages">All Ages</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals & Tracking */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle>Goals & Tracking</CardTitle>
          </div>
          <CardDescription>
            Set targets and organize your project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="targetWordCount">Target Word Count</Label>
            <Input
              id="targetWordCount"
              type="number"
              value={formData.targetWordCount || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  targetWordCount: parseInt(e.target.value) || 0,
                })
              }
              placeholder="80000"
            />
            <p className="text-xs text-muted-foreground">
              Typical novel length: 80,000-100,000 words
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
                placeholder="Add tag..."
              />
              <Button type="button" onClick={addTag} variant="outline">
                <TagIcon className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Project Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Internal notes, reminders, etc..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* AI Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            <CardTitle>AI Settings</CardTitle>
          </div>
          <CardDescription>
            Default AI behavior for this project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultTemperature">
              Default Temperature: {formData.defaultTemperature.toFixed(2)}
            </Label>
            <Slider
              id="defaultTemperature"
              min={0}
              max={1}
              step={0.05}
              value={[formData.defaultTemperature]}
              onValueChange={([value]) =>
                setFormData({ ...formData, defaultTemperature: value })
              }
            />
            <p className="text-xs text-muted-foreground">
              Lower = more focused and consistent, Higher = more creative and varied
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultMaxTokens">
              Default Max Tokens: {formData.defaultMaxTokens}
            </Label>
            <Slider
              id="defaultMaxTokens"
              min={100}
              max={2000}
              step={50}
              value={[formData.defaultMaxTokens]}
              onValueChange={([value]) =>
                setFormData({ ...formData, defaultMaxTokens: value })
              }
            />
            <p className="text-xs text-muted-foreground">
              Maximum length of AI responses (roughly 0.75 words per token)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contextWindowSize">
              Context Window Size: {formData.contextWindowSize.toLocaleString()} tokens
            </Label>
            <Slider
              id="contextWindowSize"
              min={2000}
              max={16000}
              step={1000}
              value={[formData.contextWindowSize]}
              onValueChange={([value]) =>
                setFormData({ ...formData, contextWindowSize: value })
              }
            />
            <p className="text-xs text-muted-foreground">
              How much context to send to the AI. Larger = more context but slower/costlier.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save All Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
