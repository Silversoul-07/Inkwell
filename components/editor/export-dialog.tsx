"use client";

import { useState } from "react";
import { Download, FileText, FileCode, FileType } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ExportDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportDialog({
  projectId,
  open,
  onOpenChange,
}: ExportDialogProps) {
  const [exporting, setExporting] = useState<string | null>(null);
  const [exportType, setExportType] = useState<
    "content" | "characters" | "lorebook" | "all"
  >("content");

  const handleExport = async (format: "txt" | "md" | "docx" | "json") => {
    setExporting(format);
    try {
      const response = await fetch(
        `/api/export?projectId=${projectId}&format=${format}&exportType=${exportType}`,
      );
      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `export.${format}`;

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      onOpenChange(false);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export file");
    } finally {
      setExporting(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Export Project</DialogTitle>
          <DialogDescription>
            Choose what to export and in which format
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <div className="text-sm font-medium">Export Type</div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={exportType === "content" ? "default" : "outline"}
                size="sm"
                onClick={() => setExportType("content")}
              >
                Content Only
              </Button>
              <Button
                variant={exportType === "characters" ? "default" : "outline"}
                size="sm"
                onClick={() => setExportType("characters")}
              >
                Characters
              </Button>
              <Button
                variant={exportType === "lorebook" ? "default" : "outline"}
                size="sm"
                onClick={() => setExportType("lorebook")}
              >
                Lorebook
              </Button>
              <Button
                variant={exportType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setExportType("all")}
              >
                Everything
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">File Format</div>
            <div className="grid gap-2">
              {exportType === "content" ? (
                <>
                  <Button
                    variant="outline"
                    className="justify-start h-auto p-4"
                    onClick={() => handleExport("txt")}
                    disabled={!!exporting}
                  >
                    <FileText className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Plain Text (.txt)</div>
                      <div className="text-xs text-muted-foreground">
                        Simple text, compatible with all editors
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto p-4"
                    onClick={() => handleExport("md")}
                    disabled={!!exporting}
                  >
                    <FileCode className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Markdown (.md)</div>
                      <div className="text-xs text-muted-foreground">
                        Formatted with chapter and scene structure
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto p-4"
                    onClick={() => handleExport("docx")}
                    disabled={!!exporting}
                  >
                    <FileType className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Word Document (.docx)</div>
                      <div className="text-xs text-muted-foreground">
                        Compatible with Word, Google Docs
                      </div>
                    </div>
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={() => handleExport("json")}
                  disabled={!!exporting}
                >
                  <FileCode className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">JSON (.json)</div>
                    <div className="text-xs text-muted-foreground">
                      Structured data for{" "}
                      {exportType === "all"
                        ? "complete project backup"
                        : exportType}
                    </div>
                  </div>
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
