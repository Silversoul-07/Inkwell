'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { EditorSidebarNew } from './editor-sidebar'
import { TiptapEditorNovelAI } from './tiptap-editor-novelai'
import { EditorToolbar } from './editor-toolbar'
import { AISidebar } from './ai-sidebar'
import { DebugSidebar } from './debug-sidebar'
import { PomodoroTimer } from './pomodoro-timer'
import { SettingsDialog } from '@/components/dialogs/settings-dialog'
import { ContentViewer } from './content-viewer'

interface Scene {
  id: string
  title: string | null
  content: string
  wordCount: number
  order: number
}

interface Chapter {
  id: string
  title: string
  order: number
  scenes: Scene[]
}

interface Project {
  id: string
  title: string
  description: string | null
  chapters: Chapter[]
}

interface Settings {
  editorFont: string
  editorFontSize: number
  editorLineHeight: number
  editorWidth: number
  editorTheme: string
  autoSaveInterval: number
}

interface Character {
  id: string
  name: string
  role: string | null
  description: string | null
  traits: string | null
  background: string | null
  relationships: string | null
  goals: string | null
}

interface LorebookEntry {
  id: string
  key: string
  value: string
  category: string | null
  useCount: number
}

type ViewType = 'scene' | 'character' | 'lorebook'

interface EditorViewProps {
  project: Project
  settings: Settings | null
}

export function EditorView({ project, settings }: EditorViewProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false)
  const [debugSidebarOpen, setDebugSidebarOpen] = useState(false)
  const [pomodoroOpen, setPomodoroOpen] = useState(false)
  const [zenMode, setZenMode] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [sceneContext, setSceneContext] = useState('')
  const [selectedText, setSelectedText] = useState('')

  // View state
  const [viewType, setViewType] = useState<ViewType>('scene')
  const [selectedSceneId, setSelectedSceneId] = useState<string>(
    project.chapters[0]?.scenes[0]?.id || ''
  )
  const [viewContent, setViewContent] = useState<Character | LorebookEntry | null>(null)

  // Parse hash and update state
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) // Remove #
      if (!hash) {
        // Default to first scene
        const firstSceneId = project.chapters[0]?.scenes[0]?.id
        if (firstSceneId) {
          window.location.hash = `scene-${firstSceneId}`
        }
        return
      }

      const [type, id] = hash.split('-')

      if (type === 'scene') {
        setViewType('scene')
        setSelectedSceneId(id)
        setViewContent(null)
      } else if (type === 'character') {
        // Fetch character data
        fetch(`/api/characters?projectId=${project.id}`)
          .then(res => res.json())
          .then((chars: Character[]) => {
            const char = chars.find(c => c.id === id)
            if (char) {
              setViewType('character')
              setViewContent(char)
            }
          })
      } else if (type === 'lorebook') {
        // Fetch lorebook data
        fetch(`/api/lorebook?projectId=${project.id}`)
          .then(res => res.json())
          .then((entries: LorebookEntry[]) => {
            const entry = entries.find(e => e.id === id)
            if (entry) {
              setViewType('lorebook')
              setViewContent(entry)
            }
          })
      }
    }

    // Initial parse
    handleHashChange()

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [project.id, project.chapters])

  const selectedScene = project.chapters
    .flatMap((c) => c.scenes)
    .find((s) => s.id === selectedSceneId)

  const selectedChapter = project.chapters.find((c) =>
    c.scenes.some((s) => s.id === selectedSceneId)
  )

  const handleRefresh = useCallback(() => {
    router.refresh()
  }, [router])

  const handleSelectScene = useCallback((sceneId: string) => {
    window.location.hash = `scene-${sceneId}`
  }, [])

  const handleViewCharacter = useCallback((character: Character) => {
    window.location.hash = `character-${character.id}`
  }, [])

  const handleViewLorebook = useCallback((entry: LorebookEntry) => {
    window.location.hash = `lorebook-${entry.id}`
  }, [])

  const handleBackToScene = useCallback(() => {
    window.location.hash = `scene-${selectedSceneId}`
  }, [selectedSceneId])

  const handleReplaceSelection = useCallback((text: string) => {
    console.log('Replace selection:', text)
  }, [])

  const handleInsertText = useCallback((text: string) => {
    console.log('Insert text:', text)
  }, [])

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {!zenMode && (
        <EditorToolbar
          project={project}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          aiSidebarOpen={aiSidebarOpen}
          setAiSidebarOpen={setAiSidebarOpen}
          debugSidebarOpen={debugSidebarOpen}
          setDebugSidebarOpen={setDebugSidebarOpen}
          zenMode={zenMode}
          setZenMode={setZenMode}
          pomodoroOpen={pomodoroOpen}
          setPomodoroOpen={setPomodoroOpen}
          settingsDialogOpen={settingsDialogOpen}
          setSettingsDialogOpen={setSettingsDialogOpen}
        />
      )}

      <div className="flex-1 flex overflow-hidden">
        {!zenMode && sidebarOpen && (
          <EditorSidebarNew
            project={project}
            selectedSceneId={selectedSceneId}
            onSelectScene={handleSelectScene}
            onRefresh={handleRefresh}
            onViewCharacter={handleViewCharacter}
            onViewLorebook={handleViewLorebook}
            selectedViewType={viewType}
            selectedViewId={viewContent?.id || selectedSceneId}
          />
        )}

        <div className="flex-1 min-w-0 overflow-auto relative">
          {viewType === 'scene' && selectedScene && (
            <TiptapEditorNovelAI
              key={selectedScene.id}
              scene={selectedScene}
              projectId={project.id}
              settings={settings}
              zenMode={zenMode}
              onExitZen={() => setZenMode(false)}
              chapterTitle={selectedChapter?.title}
              sceneTitle={selectedScene.title || undefined}
            />
          )}
          {viewType !== 'scene' && viewContent && (
            <ContentViewer
              key={viewContent.id}
              type={viewType}
              content={viewContent}
              projectId={project.id}
              onBack={handleBackToScene}
            />
          )}
        </div>

        {/* AI Sidebar */}
        {!zenMode && selectedScene && (
          <AISidebar
            isOpen={aiSidebarOpen}
            onClose={() => setAiSidebarOpen(false)}
            sceneContext={sceneContext}
            selectedText={selectedText}
            onReplaceSelection={handleReplaceSelection}
            onInsertText={handleInsertText}
          />
        )}

        {/* Debug Sidebar */}
        {!zenMode && selectedScene && (
          <DebugSidebar
            isOpen={debugSidebarOpen}
            onClose={() => setDebugSidebarOpen(false)}
            projectId={project.id}
            sceneContext={sceneContext}
          />
        )}
      </div>

      {/* Pomodoro Timer */}
      {pomodoroOpen && <PomodoroTimer projectId={project.id} />}

      {/* Settings Dialog */}
      <SettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
      />
    </div>
  )
}
