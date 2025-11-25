'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { EditorSidebarNew } from './editor-sidebar'
import { TiptapEditorNovelAI } from './tiptap-editor-novelai'
import { EditorToolbar } from './editor-toolbar'
import { AICanvas } from './ai-canvas'
import { PomodoroTimer } from './pomodoro-timer'
import { SettingsDialog } from '@/components/dialogs/settings-dialog'
import { ContentViewer } from './content-viewer'
import { AIContextIndicator } from './ai-context-indicator'
import { ChapterNavigation } from './chapter-navigation'
import { ChapterViewer } from './chapter-viewer'

interface Chapter {
  id: string
  title: string
  order: number
  content: string | null
  wordCount: number | null
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

type ViewType = 'chapter' | 'character' | 'lorebook'
type EditorMode = 'writing' | 'ai-storm'

interface EditorViewProps {
  project: Project
  settings: Settings | null
  isReadOnly?: boolean
}

export function EditorView({ project, settings, isReadOnly = false }: EditorViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Derive initial mode from URL instead of setting state in effect
  const getInitialMode = (): EditorMode => {
    const modeParam = searchParams.get('mode')
    if (modeParam === 'ai' || modeParam === 'ai-storm') {
      return 'ai-storm'
    } else if (modeParam === 'writing' || modeParam === 'writer') {
      return 'writing'
    }
    return 'writing' // default
  }

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [editorMode, setEditorMode] = useState<EditorMode>(getInitialMode())
  const [contextPanelOpen, setContextPanelOpen] = useState(false)
  const [pomodoroOpen, setPomodoroOpen] = useState(false)
  const [zenMode, setZenMode] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [chapterContext, setChapterContext] = useState('')
  const [selectedText, setSelectedText] = useState('')

  const [selectedChapterId, setSelectedChapterId] = useState<string>(project.chapters[0]?.id || '')
  const [viewType, setViewType] = useState<ViewType>('chapter')
  const [viewContent, setViewContent] = useState<Character | LorebookEntry | null>(null)

  const selectedChapter = project.chapters.find(c => c.id === selectedChapterId)

  const handleRefresh = useCallback(() => {
    router.refresh()
  }, [router])

  // Handle mode change with URL update
  const handleModeChange = useCallback(
    (mode: EditorMode) => {
      setEditorMode(mode)
      const modeParam = mode === 'ai-storm' ? 'ai' : 'writing'
      const url = new URL(window.location.href)
      url.searchParams.set('mode', modeParam)
      router.push(url.pathname + url.search, { scroll: false })
    },
    [router]
  )

  const handleSelectScene = useCallback((chapterId: string) => {
    setSelectedChapterId(chapterId)
    setViewType('chapter')
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
    setViewType('chapter')
    setViewContent(null)
  }, [])

  // Read-only mode - Simple chapter reader
  if (isReadOnly) {
    return (
      <div className="h-screen flex overflow-hidden bg-background">
        <ChapterNavigation
          chapters={project.chapters}
          selectedChapterId={selectedChapterId}
          onSelectChapter={setSelectedChapterId}
        />
        <div className="flex-1 overflow-hidden">
          {selectedChapter ? (
            <ChapterViewer chapter={selectedChapter} settings={settings} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No chapter selected
            </div>
          )}
        </div>
      </div>
    )
  }

  // Normal editor mode
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
            selectedChapterId={selectedChapterId}
            onSelectChapter={handleSelectScene}
            onRefresh={handleRefresh}
            onViewCharacter={handleViewCharacter}
            onViewLorebook={handleViewLorebook}
            selectedViewType={viewType !== 'chapter' ? viewType : undefined}
            selectedViewId={viewContent?.id}
          />
        )}

        <div className="flex-1 min-w-0 overflow-auto relative">
          {/* Writing Mode - Show Editor */}
          {editorMode === 'writing' && viewType === 'chapter' && selectedChapter && (
            <TiptapEditorNovelAI
              key={selectedChapter.id}
              chapter={selectedChapter}
              projectId={project.id}
              settings={settings}
              zenMode={zenMode}
              onExitZen={() => setZenMode(false)}
              chapterTitle={selectedChapter.title}
            />
          )}

          {/* Writing Mode - Character/Lorebook View */}
          {editorMode === 'writing' && viewType !== 'chapter' && viewContent && (
            <ContentViewer
              key={viewContent.id}
              type={viewType as 'character' | 'lorebook'}
              content={viewContent}
              projectId={project.id}
              onBack={handleBackToScene}
            />
          )}

          {/* AI Storm Mode - Show AI Canvas */}
          {editorMode === 'ai-storm' && selectedChapter && (
            <div className="w-full h-full flex flex-col bg-background">
              <AICanvas
                sceneContext={chapterContext || selectedChapter.content || ''}
                selectedText={selectedText}
                projectId={project.id}
                sceneInfo={{
                  id: selectedChapter.id,
                  title: selectedChapter.title,
                  content: selectedChapter.content || '',
                  chapterId: selectedChapter.id,
                }}
                onReplaceSelection={() => {}}
                onInsertText={() => {}}
                onSceneUpdated={handleRefresh}
              />
            </div>
          )}
        </div>

        {/* Context panel removed - no longer needed for chapters */}

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
