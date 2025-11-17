'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { EditorSidebar } from './editor-sidebar'
import { TiptapEditorNovelAI } from './tiptap-editor-novelai'
import { EditorToolbar } from './editor-toolbar'
import { RightSidebarPanel } from './right-sidebar-panel'

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
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)
  const [zenMode, setZenMode] = useState(false)
  const [sceneContext, setSceneContext] = useState('')
  const [selectedText, setSelectedText] = useState('')

  const selectedScene = project.chapters
    .flatMap((c) => c.scenes)
    .find((s) => s.id === selectedSceneId)

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
          rightSidebarOpen={rightSidebarOpen}
          setRightSidebarOpen={setRightSidebarOpen}
          zenMode={zenMode}
          setZenMode={setZenMode}
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

        <div className="flex-1 overflow-auto relative">
          {selectedScene && (
            <TiptapEditorNovelAI
              key={selectedScene.id}
              scene={selectedScene}
              projectId={project.id}
              settings={settings}
              zenMode={zenMode}
              onExitZen={() => setZenMode(false)}
              rightSidebarOpen={rightSidebarOpen}
              onRightSidebarClose={() => setRightSidebarOpen(false)}
            />
          )}
        </div>

        {/* Right Sidebar - Push Layout */}
        {!zenMode && rightSidebarOpen && selectedScene && (
          <div className="w-[360px] border-l border-border bg-card flex-shrink-0">
            <RightSidebarPanel
              isOpen={rightSidebarOpen}
              onClose={() => setRightSidebarOpen(false)}
              sceneContext={sceneContext}
              selectedText={selectedText}
              projectId={project.id}
              sceneId={selectedScene.id}
              onReplaceSelection={handleReplaceSelection}
              onInsertText={handleInsertText}
            />
          </div>
        )}
      </div>
    </div>
  )
}
