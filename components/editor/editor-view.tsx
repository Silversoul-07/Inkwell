'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { EditorSidebarNew } from './editor-sidebar'
import { TiptapEditorNovelAI } from './tiptap-editor-novelai'
import { EditorToolbar } from './editor-toolbar'
import { AICanvas } from './ai-canvas'
import { PomodoroTimer } from './pomodoro-timer'
import { SettingsDialog } from '@/components/dialogs/settings-dialog'
import { ContentViewer } from './content-viewer'
import { SceneContextPanel } from './scene-context-panel'
import { AIContextIndicator } from './ai-context-indicator'

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
  age: string | null
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
type EditorMode = 'writing' | 'ai-storm'

interface EditorViewProps {
  project: Project
  settings: Settings | null
}

export function EditorView({ project, settings }: EditorViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [editorMode, setEditorMode] = useState<EditorMode>('writing')
  const [contextPanelOpen, setContextPanelOpen] = useState(false)
  const [pomodoroOpen, setPomodoroOpen] = useState(false)
  const [zenMode, setZenMode] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [sceneContext, setSceneContext] = useState('')
  const [selectedText, setSelectedText] = useState('')

  const [selectedSceneId, setSelectedSceneId] = useState<string>(
    project.chapters[0]?.scenes[0]?.id || ''
  )
  const [viewType, setViewType] = useState<ViewType>('scene')
  const [viewContent, setViewContent] = useState<Character | LorebookEntry | null>(null)

  const selectedScene = project.chapters.flatMap(c => c.scenes).find(s => s.id === selectedSceneId)

  const selectedChapter = project.chapters.find(c => c.scenes.some(s => s.id === selectedSceneId))

  // Initialize mode from URL on mount
  useEffect(() => {
    const modeParam = searchParams.get('mode')
    if (modeParam === 'ai' || modeParam === 'ai-storm') {
      setEditorMode('ai-storm')
    } else if (modeParam === 'writing' || modeParam === 'writer') {
      setEditorMode('writing')
    }
    // Default is 'writing' if no param or invalid param
  }, [searchParams])

  const handleRefresh = useCallback(() => {
    router.refresh()
  }, [router])

  // Handle mode change with URL update
  const handleModeChange = useCallback((mode: EditorMode) => {
    setEditorMode(mode)
    const modeParam = mode === 'ai-storm' ? 'ai' : 'writing'
    const url = new URL(window.location.href)
    url.searchParams.set('mode', modeParam)
    router.push(url.pathname + url.search, { scroll: false })
  }, [router])

  const handleSelectScene = useCallback((sceneId: string) => {
    setSelectedSceneId(sceneId)
    setViewType('scene')
    setViewContent(null)
  }, [])

  const handleViewCharacter = useCallback((character: Character) => {
    setViewType('character')
    setViewContent(character)
  }, [])

  const handleViewLorebook = useCallback((entry: LorebookEntry) => {
    setViewType('lorebook')
    setViewContent(entry)
  }, [])

  const handleBackToScene = useCallback(() => {
    setViewType('scene')
    setViewContent(null)
  }, [])

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {!zenMode && (
        <EditorToolbar
          project={project}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          editorMode={editorMode}
          setEditorMode={handleModeChange}
          contextPanelOpen={contextPanelOpen}
          setContextPanelOpen={setContextPanelOpen}
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
          {/* Writing Mode - Show Editor */}
          {editorMode === 'writing' && viewType === 'scene' && selectedScene && (
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

          {/* Writing Mode - Character/Lorebook View */}
          {editorMode === 'writing' && viewType !== 'scene' && viewContent && (
            <ContentViewer
              key={viewContent.id}
              type={viewType}
              content={viewContent}
              projectId={project.id}
              onBack={handleBackToScene}
            />
          )}

          {/* AI Storm Mode - Show AI Canvas */}
          {editorMode === 'ai-storm' && selectedScene && selectedChapter && (
            <div className="w-full h-full flex flex-col bg-background">
              <AICanvas
                sceneContext={sceneContext || selectedScene.content}
                selectedText={selectedText}
                projectId={project.id}
                sceneInfo={{
                  id: selectedScene.id,
                  title: selectedScene.title,
                  content: selectedScene.content,
                  chapterId: selectedChapter.id,
                }}
                onReplaceSelection={() => {}}
                onInsertText={() => {}}
                onSceneUpdated={handleRefresh}
              />
            </div>
          )}
        </div>

        {/* Scene Context Panel - Writing Mode only */}
        {!zenMode && editorMode === 'writing' && contextPanelOpen && selectedScene && (
          <SceneContextPanel
            sceneContent={selectedScene.content}
            projectId={project.id}
            onViewCharacter={handleViewCharacter}
            onViewLorebook={handleViewLorebook}
          />
        )}

        {/* Optional: Additional side panel for AI Storm mode if needed */}
        {/* Removed duplicate AI Canvas from side panel since it's now in main area */}
      </div>

      {/* Pomodoro Timer */}
      {pomodoroOpen && <PomodoroTimer projectId={project.id} />}

      {/* Settings Dialog */}
      <SettingsDialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen} />
    </div>
  )
}
