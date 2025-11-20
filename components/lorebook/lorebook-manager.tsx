'use client'

import { useState, useEffect } from 'react'
import {
  Book,
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  Filter,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Tag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface LorebookEntry {
  id: string
  projectId: string
  key: string
  value: string
  category: string | null
  keys: string | null // JSON array
  triggerMode: string
  priority: number
  searchable: boolean
  lastUsed: Date | null
  useCount: number
  regexPattern: string | null
  contextStrategy: string
  createdAt: Date
  updatedAt: Date
}

interface LorebookManagerProps {
  projectId: string
}

export function LorebookManager({ projectId }: LorebookManagerProps) {
  const [entries, setEntries] = useState<LorebookEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<LorebookEntry | null>(null)

  const [formData, setFormData] = useState({
    key: '',
    value: '',
    category: '',
    keys: '',
    triggerMode: 'auto',
    priority: 5,
    searchable: true,
    regexPattern: '',
    contextStrategy: 'full',
  })

  const categories = [
    'Characters',
    'Locations',
    'Magic',
    'Technology',
    'History',
    'Culture',
    'Organizations',
    'Items',
    'Other',
  ]

  useEffect(() => {
    loadEntries()
  }, [projectId, sortBy, categoryFilter])

  const loadEntries = async () => {
    try {
      let url = `/api/lorebook?projectId=${projectId}&sortBy=${sortBy}`
      if (categoryFilter !== 'all') {
        url += `&category=${categoryFilter}`
      }

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setEntries(data)
      }
    } catch (error) {
      console.error('Failed to load lorebook:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      key: '',
      value: '',
      category: '',
      keys: '',
      triggerMode: 'auto',
      priority: 5,
      searchable: true,
      regexPattern: '',
      contextStrategy: 'full',
    })
  }

  const handleCreate = async () => {
    try {
      // Convert keys string to JSON array
      const keysArray = formData.keys
        ? formData.keys.split(',').map((k) => k.trim()).filter((k) => k)
        : []

      const response = await fetch('/api/lorebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          keys: keysArray.length > 0 ? JSON.stringify(keysArray) : null,
          projectId,
        }),
      })

      if (response.ok) {
        await loadEntries()
        setIsCreateOpen(false)
        resetForm()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create entry')
      }
    } catch (error) {
      console.error('Failed to create entry:', error)
      alert('Failed to create entry')
    }
  }

  const handleEdit = (entry: LorebookEntry) => {
    setSelectedEntry(entry)

    // Parse keys array
    let keysStr = ''
    if (entry.keys) {
      try {
        const keysArray = JSON.parse(entry.keys)
        keysStr = keysArray.join(', ')
      } catch (e) {
        console.error('Failed to parse keys:', e)
      }
    }

    setFormData({
      key: entry.key,
      value: entry.value,
      category: entry.category || '',
      keys: keysStr,
      triggerMode: entry.triggerMode,
      priority: entry.priority,
      searchable: entry.searchable,
      regexPattern: entry.regexPattern || '',
      contextStrategy: entry.contextStrategy,
    })
    setIsEditOpen(true)
  }

  const handleUpdate = async () => {
    if (!selectedEntry) return

    try {
      // Convert keys string to JSON array
      const keysArray = formData.keys
        ? formData.keys.split(',').map((k) => k.trim()).filter((k) => k)
        : []

      const response = await fetch(`/api/lorebook/${selectedEntry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          keys: keysArray.length > 0 ? JSON.stringify(keysArray) : null,
        }),
      })

      if (response.ok) {
        await loadEntries()
        setIsEditOpen(false)
        setSelectedEntry(null)
        resetForm()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update entry')
      }
    } catch (error) {
      console.error('Failed to update entry:', error)
      alert('Failed to update entry')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    try {
      const response = await fetch(`/api/lorebook/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadEntries()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete entry')
      }
    } catch (error) {
      console.error('Failed to delete entry:', error)
      alert('Failed to delete entry')
    }
  }

  const filteredEntries = entries.filter((entry) => {
    const query = searchQuery.toLowerCase()
    return (
      entry.key.toLowerCase().includes(query) ||
      entry.value.toLowerCase().includes(query) ||
      entry.category?.toLowerCase().includes(query)
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const LorebookForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="key">Primary Key *</Label>
        <Input
          id="key"
          value={formData.key}
          onChange={(e) => setFormData({ ...formData, key: e.target.value })}
          placeholder="Main trigger word or phrase"
        />
        <p className="text-xs text-muted-foreground">
          The main keyword that triggers this entry
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="keys">Additional Keywords</Label>
        <Input
          id="keys"
          value={formData.keys}
          onChange={(e) => setFormData({ ...formData, keys: e.target.value })}
          placeholder="keyword1, keyword2, keyword3"
        />
        <p className="text-xs text-muted-foreground">
          Comma-separated list of alternative trigger words
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="value">Content *</Label>
        <Textarea
          id="value"
          value={formData.value}
          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          placeholder="The information about this entry..."
          rows={6}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="triggerMode">Trigger Mode</Label>
          <Select
            value={formData.triggerMode}
            onValueChange={(value) => setFormData({ ...formData, triggerMode: value })}
          >
            <SelectTrigger id="triggerMode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto (Smart Trigger)</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="priority">Priority: {formData.priority}</Label>
          <Badge variant="outline">{formData.priority}/10</Badge>
        </div>
        <Slider
          id="priority"
          min={0}
          max={10}
          step={1}
          value={[formData.priority]}
          onValueChange={([value]) => setFormData({ ...formData, priority: value })}
        />
        <p className="text-xs text-muted-foreground">
          Higher priority entries are included first when context is limited
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="regexPattern">Regex Pattern (Advanced)</Label>
        <Input
          id="regexPattern"
          value={formData.regexPattern}
          onChange={(e) => setFormData({ ...formData, regexPattern: e.target.value })}
          placeholder="Optional regex pattern for matching"
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Advanced: Use regex for complex matching patterns
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label htmlFor="searchable">Searchable</Label>
          <p className="text-xs text-muted-foreground">
            Enable smart triggering for this entry
          </p>
        </div>
        <Switch
          id="searchable"
          checked={formData.searchable}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, searchable: checked })
          }
        />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Book className="h-6 w-6" />
            Lorebook
          </h2>
          <p className="text-sm text-muted-foreground">
            World-building information that triggers automatically
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Lorebook Entry</DialogTitle>
              <DialogDescription>
                Add world-building information that auto-triggers based on context
              </DialogDescription>
            </DialogHeader>
            <LorebookForm />
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!formData.key || !formData.value}>
                Create Entry
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search lorebook..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Recently Created</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="useCount">Most Used</SelectItem>
            <SelectItem value="lastUsed">Recently Used</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Entries List */}
      {filteredEntries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Book className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              {searchQuery
                ? 'No entries found matching your search.'
                : 'No lorebook entries yet. Create your first entry to get started.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{entry.key}</CardTitle>
                      {entry.category && (
                        <Badge variant="outline">{entry.category}</Badge>
                      )}
                      {entry.triggerMode === 'auto' && entry.searchable && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          Auto
                        </Badge>
                      )}
                      <Badge variant="outline" className="flex items-center gap-1">
                        <ArrowUp className="h-3 w-3" />
                        {entry.priority}
                      </Badge>
                    </div>
                    {entry.keys && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {JSON.parse(entry.keys).map((key: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {key}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(entry)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(entry.id)}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {entry.value}
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span>Used {entry.useCount} times</span>
                  {entry.lastUsed && (
                    <span>
                      Last used {new Date(entry.lastUsed).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Lorebook Entry</DialogTitle>
            <DialogDescription>
              Update lorebook entry details
            </DialogDescription>
          </DialogHeader>
          <LorebookForm />
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditOpen(false)
                setSelectedEntry(null)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!formData.key || !formData.value}
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
