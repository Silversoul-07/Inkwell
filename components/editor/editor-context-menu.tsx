"use client";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  ArrowRight,
  Wand2,
  CheckCircle,
  RefreshCw,
  Minimize2,
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  List,
  ListOrdered,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EditorContextMenuProps {
  children: React.ReactNode;
  hasSelection: boolean;
  isGenerating: boolean;
  onContinue: () => void;
  onAlternative: () => void;
  onFixGrammar: () => void;
  onRephrase: () => void;
  onShorten: () => void;
  formatItems?: Array<{
    icon: any;
    label: string;
    action: () => void;
    active: boolean;
  }>;
}

export function EditorContextMenu({
  children,
  hasSelection,
  isGenerating,
  onContinue,
  onAlternative,
  onFixGrammar,
  onRephrase,
  onShorten,
  formatItems = [],
}: EditorContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {/* Formatting Icons Row */}
        {formatItems.length > 0 && (
          <>
            <div className="flex items-center gap-1 px-2 py-1.5">
              {formatItems.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  className={cn(
                    "p-1.5 rounded hover:bg-muted transition-colors",
                    item.active && "bg-muted text-primary",
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    item.action();
                  }}
                  title={item.label}
                  disabled={isGenerating}
                >
                  <item.icon className="h-4 w-4" />
                </button>
              ))}
            </div>
            <ContextMenuSeparator />
          </>
        )}

        {!hasSelection && (
          <>
            <ContextMenuItem onClick={onContinue} disabled={isGenerating}>
              <ArrowRight className="mr-2 h-4 w-4" />
              <span>Continue Writing</span>
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}

        {hasSelection && (
          <>
            <ContextMenuItem onClick={onAlternative} disabled={isGenerating}>
              <Wand2 className="mr-2 h-4 w-4" />
              <span>Generate Alternative</span>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={onFixGrammar} disabled={isGenerating}>
              <CheckCircle className="mr-2 h-4 w-4" />
              <span>Fix Grammar</span>
            </ContextMenuItem>
            <ContextMenuItem onClick={onRephrase} disabled={isGenerating}>
              <RefreshCw className="mr-2 h-4 w-4" />
              <span>Rephrase</span>
            </ContextMenuItem>
            <ContextMenuItem onClick={onShorten} disabled={isGenerating}>
              <Minimize2 className="mr-2 h-4 w-4" />
              <span>Shorten</span>
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
