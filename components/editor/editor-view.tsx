'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { EditorSidebar } from './editor-sidebar'
import { TiptapEditorNovelAI } from './tiptap-editor-novelai'
import { EditorToolbar } from './editor-toolbar'
import { AISidebar } from './ai-sidebar'
import { DebugSidebar } from './debug-sidebar'
import { PomodoroTimer } from './pomodoro-timer'
import { AgentDialog } from '@/components/dialogs/agent-dialog'
import { SettingsDialog } from '@/components/dialogs/settings-dialog-full'

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

interface EditorViewProps {
  project: Project
  settings: Settings | null
}

export function EditorView({ project, settings }: EditorViewProps) {
  const router = useRouter()
  const [selectedSceneId, setSelectedSceneId] = useState<string>(
    project.chapters[0]?.scenes[0]?.id || ''
  )
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false)
  const [debugSidebarOpen, setDebugSidebarOpen] = useState(false)
  const [pomodoroOpen, setPomodoroOpen] = useState(false)
  const [zenMode, setZenMode] = useState(false)
  const [agentDialogOpen, setAgentDialogOpen] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [sceneContext, setSceneContext] = useState('')
  const [selectedText, setSelectedText] = useState('')

  const selectedScene = project.chapters
    .flatMap((c) => c.scenes)
    .find((s) => s.id === selectedSceneId)

  const selectedChapter = project.chapters.find((c) =>
    c.scenes.some((s) => s.id === selectedSceneId)
  )

  const handleRefresh = useCallback(() => {
    router.refresh()
  }, [router])

  const handleReplaceSelection = useCallback((text: string) => {
    // This will be called from AICanvas to replace selected text
    console.log('Replace selection:', text)
  }, [])

  const handleInsertText = useCallback((text: string) => {
    // This will be called from AICanvas to insert text
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
          agentDialogOpen={agentDialogOpen}
          setAgentDialogOpen={setAgentDialogOpen}
          settingsDialogOpen={settingsDialogOpen}
          setSettingsDialogOpen={setSettingsDialogOpen}
        />
      )}

      <div className="flex-1 flex overflow-hidden">
        {!zenMode && sidebarOpen && (
          <EditorSidebar
            project={project}
            selectedSceneId={selectedSceneId}
            onSelectScene={setSelectedSceneId}
            onRefresh={handleRefresh}
          />
        )}

        <div className="flex-1 min-w-0 overflow-auto relative">
          {selectedScene && (
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
        </div>

        {/* AI Sidebar - Push Layout */}
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

        {/* Debug Sidebar - Push Layout */}
        {!zenMode && selectedScene && (
          <DebugSidebar
            isOpen={debugSidebarOpen}
            onClose={() => setDebugSidebarOpen(false)}
            projectId={project.id}
            sceneContext={sceneContext}
          />
        )}
      </div>

      {/* Pomodoro Timer - Floating */}
      {pomodoroOpen && <PomodoroTimer projectId={project.id} />}

      {/* Agent Dialog - Floating */}
      <AgentDialog
        open={agentDialogOpen}
        onOpenChange={setAgentDialogOpen}
        currentProjectId={project.id}
        projects={[{ id: project.id, title: project.title }]}
      />

      {/* Settings Dialog - Floating */}
      <SettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
      />
    </div>
  )
}
