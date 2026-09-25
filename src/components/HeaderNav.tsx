import React from 'react';
import {
  Brain,
  Database,
  Layers,
  Cpu,
  Sparkles,
  Download,
  Plus,
  RefreshCw,
  Share2,
} from 'lucide-react';

interface HeaderNavProps {
  memoryCount: number;
  sessionCount: number;
  onNewSession: () => void;
  onExport: () => void;
  onTestCrossSessionRecall: () => void;
  isRecalling?: boolean;
  isQuotaLimited?: boolean;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  memoryCount,
  sessionCount,
  onNewSession,
  onExport,
  onTestCrossSessionRecall,
  isRecalling,
  isQuotaLimited,
}) => {
  return (
    <header className="h-14 border-b border-neutral-200/80 bg-white/95 backdrop-blur-md px-4 flex items-center justify-between shrink-0 select-none z-20">
      {/* Title & Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center shadow-xs">
          <Brain className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-neutral-900 tracking-tight">
              AI Assistant With Memory
            </h1>
            <span className="text-[10px] text-neutral-400 font-mono">v2.5</span>
          </div>
          <p className="text-[11px] text-neutral-500 font-normal truncate max-w-xl hidden md:block">
            Remembers useful context across different conversations instead of starting from zero every time.
          </p>
        </div>
      </div>

      {/* Tech Stack Status Indicators */}
      <div className="hidden lg:flex items-center gap-2 text-[11px] text-neutral-500">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-neutral-50 border border-neutral-200/70">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="font-semibold text-neutral-700">Mem0</span>
          <span className="text-neutral-400">Graph</span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-neutral-50 border border-neutral-200/70">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span className="font-semibold text-neutral-700">OpenMemory</span>
          <span className="text-neutral-400">MCP</span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-neutral-50 border border-neutral-200/70">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          <span className="font-semibold text-neutral-700">LangChain</span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-neutral-50 border border-neutral-200/70">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="font-semibold text-neutral-700">CrewAI</span>
          <span className="text-neutral-400">Multi-Agent</span>
        </div>

        {isQuotaLimited && (
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-50 border border-amber-200/80 text-amber-800 animate-in fade-in duration-300"
            title="Gemini free tier quota exhausted (429). The system seamlessly uses the local Mem0 intelligent memory engine with zero context loss."
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            <span className="font-semibold">Mem0 Local Engine</span>
            <span className="text-amber-600 text-[10px]">(429 Fallback Active)</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onTestCrossSessionRecall}
          disabled={isRecalling}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50 text-xs font-medium text-neutral-700 transition-colors shadow-2xs"
          title="Verify that assistant recalls identity and tech stack from past sessions"
        >
          {isRecalling ? (
            <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          )}
          <span className="hidden sm:inline">Test Memory Recall</span>
        </button>

        <button
          onClick={onNewSession}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition-all shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Session</span>
        </button>

        <button
          onClick={onExport}
          className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-600 transition-colors"
          title="Export Memory Graph & MCP Config"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
