"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { EditorSidebarNew } from "./editor-sidebar";
import { TiptapEditorNovelAI } from "./tiptap-editor-novelai";
import { EditorToolbar } from "./editor-toolbar";
import { AICanvas } from "./ai-canvas";
import { DebugSidebar } from "./debug-sidebar";
import { PomodoroTimer } from "./pomodoro-timer";
import { SettingsDialog } from "@/components/dialogs/settings-dialog";
import { ContentViewer } from "./content-viewer";
import { SceneContextPanel } from "./scene-context-panel";
import { AIContextIndicator } from "./ai-context-indicator";

interface Scene {
  id: string;
  title: string | null;
  content: string;
  wordCount: number;
  order: number;
}

interface Chapter {
  id: string;
  title: string;
  order: number;
  scenes: Scene[];
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  chapters: Chapter[];
}

interface Settings {
  editorFont: string;
  editorFontSize: number;
  editorLineHeight: number;
  editorWidth: number;
  editorTheme: string;
  autoSaveInterval: number;
}

interface Character {
  id: string;
  name: string;
  age: string | null;
  role: string | null;
  description: string | null;
  traits: string | null;
  background: string | null;
  relationships: string | null;
  goals: string | null;
}

interface LorebookEntry {
  id: string;
  key: string;
  value: string;
  category: string | null;
  useCount: number;
}

type ViewType = "scene" | "character" | "lorebook";
type EditorMode = "writing" | "ai-storm";

interface EditorViewProps {
  project: Project;
  settings: Settings | null;
}

export function EditorView({ project, settings }: EditorViewProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editorMode, setEditorMode] = useState<EditorMode>("writing");
  const [contextPanelOpen, setContextPanelOpen] = useState(false);
  const [debugSidebarOpen, setDebugSidebarOpen] = useState(false);
  const [pomodoroOpen, setPomodoroOpen] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [sceneContext, setSceneContext] = useState("");
  const [selectedText, setSelectedText] = useState("");

  const [selectedSceneId, setSelectedSceneId] = useState<string>(
    project.chapters[0]?.scenes[0]?.id || "",
  );
  const [viewType, setViewType] = useState<ViewType>("scene");
  const [viewContent, setViewContent] = useState<
    Character | LorebookEntry | null
  >(null);

  const selectedScene = project.chapters
    .flatMap((c) => c.scenes)
    .find((s) => s.id === selectedSceneId);

  const selectedChapter = project.chapters.find((c) =>
    c.scenes.some((s) => s.id === selectedSceneId),
  );

  const handleRefresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const handleSelectScene = useCallback((sceneId: string) => {
    setSelectedSceneId(sceneId);
    setViewType("scene");
    setViewContent(null);
  }, []);

  const handleViewCharacter = useCallback((character: Character) => {
    setViewType("character");
    setViewContent(character);
  }, []);

  const handleViewLorebook = useCallback((entry: LorebookEntry) => {
    setViewType("lorebook");
    setViewContent(entry);
  }, []);

  const handleBackToScene = useCallback(() => {
    setViewType("scene");
    setViewContent(null);
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {!zenMode && (
        <EditorToolbar
          project={project}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          editorMode={editorMode}
          setEditorMode={setEditorMode}
          contextPanelOpen={contextPanelOpen}
          setContextPanelOpen={setContextPanelOpen}
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
          {editorMode === "writing" && (
            <>
              {viewType === "scene" && selectedScene && (
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
              {viewType !== "scene" && viewContent && (
                <ContentViewer
                  key={viewContent.id}
                  type={viewType}
                  content={viewContent}
                  projectId={project.id}
                  onBack={handleBackToScene}
                />
              )}
            </>
          )}

          {editorMode === "ai-storm" && selectedScene && (
            <div className="h-full w-full max-w-5xl mx-auto">
              <AICanvas
                sceneContext={sceneContext || selectedScene.content}
                selectedText={selectedText}
                projectId={project.id}
                onReplaceSelection={() => {}}
                onInsertText={() => {}}
              />
            </div>
          )}
        </div>

        {/* Scene Context Panel - Writing Mode */}
        {!zenMode &&
          editorMode === "writing" &&
          contextPanelOpen &&
          selectedScene && (
            <SceneContextPanel
              sceneContent={selectedScene.content}
              projectId={project.id}
              onViewCharacter={handleViewCharacter}
              onViewLorebook={handleViewLorebook}
            />
          )}

        {/* AI Context Indicator - AI Storm Mode */}
        {!zenMode &&
          editorMode === "ai-storm" &&
          contextPanelOpen &&
          selectedScene && (
            <AIContextIndicator
              sceneContext={sceneContext || selectedScene.content}
              projectId={project.id}
              selectedText={selectedText}
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
  );
}
