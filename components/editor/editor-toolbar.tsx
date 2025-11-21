"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Home,
  PanelLeft,
  Minimize2,
  Settings,
  BarChart3,
  Users,
  BookOpen,
  FolderOpen,
  ChevronDown,
  Sparkles,
  Bug,
  Timer,
  Download,
  Upload,
  PanelRight,
  Info,
  Zap,
  PenLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSelector } from "@/components/ui/theme-selector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { ExportDialog } from "./export-dialog";
import { ImportDialog } from "./import-dialog";

interface Project {
  id: string;
  title: string;
}

type EditorMode = "writing" | "ai-storm";

interface EditorToolbarProps {
  project: Project;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  editorMode: EditorMode;
  setEditorMode: (mode: EditorMode) => void;
  contextPanelOpen: boolean;
  setContextPanelOpen: (open: boolean) => void;
  debugSidebarOpen: boolean;
  setDebugSidebarOpen: (open: boolean) => void;
  zenMode: boolean;
  setZenMode: (zen: boolean) => void;
  pomodoroOpen: boolean;
  setPomodoroOpen: (open: boolean) => void;
  settingsDialogOpen: boolean;
  setSettingsDialogOpen: (open: boolean) => void;
}

export function EditorToolbar({
  project,
  sidebarOpen,
  setSidebarOpen,
  editorMode,
  setEditorMode,
  contextPanelOpen,
  setContextPanelOpen,
  debugSidebarOpen,
  setDebugSidebarOpen,
  zenMode,
  setZenMode,
  pomodoroOpen,
  setPomodoroOpen,
  settingsDialogOpen,
  setSettingsDialogOpen,
}: EditorToolbarProps) {
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  return (
    <>
      <div className="border-b border-border bg-gradient-to-b from-card to-card/80 backdrop-blur-sm px-3 py-2.5 flex items-center justify-between shadow-sm">
        {/* Left Section - Navigation & Project */}
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              title="Back to Dashboard"
            >
              <Home className="h-4 w-4" />
            </Button>
          </Link>

          <Button
            variant={sidebarOpen ? "secondary" : "ghost"}
            size="icon"
            className="h-9 w-9"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="Toggle Sidebar"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>

          {/* Project Tools Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 gap-1">
                <FolderOpen className="h-3.5 w-3.5" />
                <ChevronDown className="h-3.5 w-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                Project Tools
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href={`/analytics/${project.id}`}
                  className="cursor-pointer"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`/characters/${project.id}`}
                  className="cursor-pointer"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Characters
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`/lorebook/${project.id}`}
                  className="cursor-pointer"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Lorebook
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setExportOpen(true)}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setImportOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-foreground truncate max-w-[200px]">
              {project.title}
            </h1>

            {/* Mode Selector Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-2 min-w-[140px]"
                >
                  {editorMode === "writing" ? (
                    <>
                      <PenLine className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">Writing Mode</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">AI Storm Mode</span>
                    </>
                  )}
                  <ChevronDown className="h-3 w-3 opacity-50 ml-auto" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                  Editor Mode
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setEditorMode("writing")}
                  className={editorMode === "writing" ? "bg-accent" : ""}
                >
                  <PenLine className="h-4 w-4 mr-2" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">Writing Mode</span>
                    <span className="text-xs text-muted-foreground">
                      Focus on writing and editing your story
                    </span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setEditorMode("ai-storm")}
                  className={editorMode === "ai-storm" ? "bg-accent" : ""}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">AI Storm Mode</span>
                    <span className="text-xs text-muted-foreground">
                      Brainstorm and generate ideas with AI
                    </span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Right Section - Settings & Tools */}
        <div className="flex items-center gap-1.5">
          {/* Context Panel Toggle - different function based on mode */}
          <Button
            variant={contextPanelOpen ? "secondary" : "ghost"}
            size="icon"
            className="h-9 w-9"
            onClick={() => setContextPanelOpen(!contextPanelOpen)}
            title={editorMode === "writing" ? "Scene Context" : "AI Context"}
          >
            <PanelRight className="h-4 w-4" />
          </Button>

          {/* Debug */}
          <Button
            variant={debugSidebarOpen ? "secondary" : "ghost"}
            size="icon"
            className="h-9 w-9"
            onClick={() => setDebugSidebarOpen(!debugSidebarOpen)}
            title="Debug"
          >
            <Bug className="h-4 w-4" />
          </Button>

          {/* Pomodoro */}
          <Button
            variant={pomodoroOpen ? "secondary" : "ghost"}
            size="icon"
            className="h-9 w-9"
            onClick={() => setPomodoroOpen(!pomodoroOpen)}
            title="Pomodoro Timer"
          >
            <Timer className="h-4 w-4" />
          </Button>

          {/* Zen Mode */}
          <Button
            variant={zenMode ? "secondary" : "ghost"}
            size="icon"
            className="h-9 w-9"
            onClick={() => setZenMode(!zenMode)}
            title="Zen Mode"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>

          {/* Theme */}
          <ThemeSelector />

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setSettingsDialogOpen(true)}
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      <ExportDialog
        projectId={project.id}
        open={exportOpen}
        onOpenChange={setExportOpen}
      />
      <ImportDialog
        projectId={project.id}
        open={importOpen}
        onOpenChange={setImportOpen}
      />
    </>
  );
}
