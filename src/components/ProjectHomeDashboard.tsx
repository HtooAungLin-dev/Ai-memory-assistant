import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  Search,
  Mic,
  ArrowRight,
  Send,
  Globe,
  Database,
  Layers,
  ShieldCheck,
  CheckCircle,
  Share2,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  GitBranch,
  Terminal,
  Cpu,
  BookmarkCheck,
  FileCode,
  Sliders,
  MoreHorizontal,
} from 'lucide-react';
import { MemoryGraphVisualizer } from './MemoryGraphVisualizer';
import { MemoryItem, Session } from '../types';

interface ProjectHomeDashboardProps {
  onSendMessage: (text: string) => void;
  onOpenContextLayer: () => void;
  onOpenUpgradeModal?: () => void;
  onOpenNewSession?: () => void;
  onTestRecall?: () => void;
  memories: MemoryItem[];
  activeSession: Session;
  isRecalling?: boolean;
}

export const ProjectHomeDashboard: React.FC<ProjectHomeDashboardProps> = ({
  onSendMessage,
  onOpenContextLayer,
  onOpenUpgradeModal,
  onOpenNewSession,
  onTestRecall,
  memories,
  activeSession,
  isRecalling = false,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedPill, setSelectedPill] = useState<string>('Recall Context');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  // Specific project-centric action cards
  const projectActionCards = [
    {
      id: 'cross-session',
      icon: (
        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200/80 text-indigo-600 flex items-center justify-center">
          <Brain className="w-5 h-5 text-indigo-600" />
        </div>
      ),
      title: 'Continuous Vector Memory Graph',
      subtitle: `${memories.length} persistent shards automatically recalled into current session.`,
      category: 'Mem0 Engine',
      prompt: 'What architectural decisions, stack preferences, and past constraints do you remember across our sessions?',
      badge: 'Zero Amnesia',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'clarilayer-context',
      icon: (
        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
        </div>
      ),
      title: 'Personal Context Layer & ADRs',
      subtitle: 'Attributable decisions, data metric definitions, and live schema drift reconciliation.',
      category: 'ClariLayer Parity',
      prompt: 'Audit our stored context layer decisions and check for any schema caveats or drift',
      badge: 'Grounded Truth',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      id: 'openmemory-mcp',
      icon: (
        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center">
          <Layers className="w-5 h-5 text-blue-600" />
        </div>
      ),
      title: 'Multi-Agent & OpenMemory MCP',
      subtitle: 'CrewAI swarm coordination and Model Context Protocol for Claude Code & Cursor.',
      category: 'MCP Protocol',
      prompt: 'Coordinate multi-agent memory synthesis across CrewAI and format OpenMemory MCP shards',
      badge: 'CrewAI Swarm',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
  ];

  const quickActionPills = [
    { id: 'recall', label: 'Recall Context', icon: <Brain className="w-3.5 h-3.5" />, query: 'What do you remember about our project architecture and stack?' },
    { id: 'adrs', label: 'Review Decisions', icon: <ShieldCheck className="w-3.5 h-3.5" />, query: 'List all verified ClariLayer decisions and rationale.' },
    { id: 'reconcile', label: 'Audit Schema Drift', icon: <RefreshCw className="w-3.5 h-3.5" />, query: 'Audit stored memory shards against active live code.' },
    { id: 'swarm', label: 'CrewAI Swarm', icon: <Cpu className="w-3.5 h-3.5" />, query: 'Run multi-agent CrewAI swarm on current context.' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-[#f8faff] via-[#f0f4fd] to-[#e8eefa] p-4 md:p-8 overflow-y-auto relative rounded-3xl m-2 md:m-4 border border-white/80 shadow-2xl backdrop-blur-2xl">
      {/* Top Status & Architecture Navigation Bar */}
      <div className="flex items-center justify-between shrink-0 mb-6 select-none">
        {/* Memory System Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenContextLayer}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white border border-neutral-200/80 shadow-2xs text-xs font-bold text-neutral-900 transition-all cursor-pointer backdrop-blur-md"
          >
            <Brain className="w-4 h-4 text-emerald-600" />
            <span>Mem0 + ClariLayer v2.6</span>
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50/90 border border-emerald-200/80 text-[11px] font-semibold text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{memories.length} Cross-Session Shards Active</span>
          </div>

          <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50/80 border border-indigo-200/70 text-[11px] font-semibold text-indigo-700">
            <span>FastAPI Python Engine Ready</span>
          </div>
        </div>

        {/* Center Project Identity */}
        <div className="text-xs font-bold tracking-tight text-neutral-600 hidden md:flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          <span>Persistent Autonomous Assistant</span>
        </div>

        {/* Right Action: Cross-Session Test */}
        <div className="flex items-center gap-2">
          {onTestRecall && (
            <button
              onClick={onTestRecall}
              disabled={isRecalling}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white border border-neutral-200 text-xs font-semibold text-neutral-700 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isRecalling ? 'animate-spin' : ''}`} />
              <span>{isRecalling ? 'Recalling...' : 'Test Memory Recall'}</span>
            </button>
          )}

          <button
            onClick={onOpenNewSession}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>New Session</span>
          </button>
        </div>
      </div>

      {/* Hero Section: Project Purpose & Vector Neural Visualizer */}
      <div className="max-w-4xl mx-auto w-full my-auto flex flex-col justify-center py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 md:mb-10">
          {/* Project Hero Typography */}
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100/80 text-indigo-800 text-[11px] font-bold mb-3 border border-indigo-200">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>Zero LLM Amnesia · Cross-Session Continuity</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-neutral-900 leading-[1.15]">
              AI Assistant with <br />
              <span className="bg-gradient-to-r from-indigo-900 via-indigo-700 to-emerald-600 bg-clip-text text-transparent">
                Persistent Long-Term Memory
              </span>
            </h1>
            <p className="text-xs md:text-sm text-neutral-600 font-medium mt-2.5 max-w-lg leading-relaxed">
              Powered by <strong className="text-neutral-900 font-bold">Mem0</strong>, <strong className="text-neutral-900 font-bold">ClariLayer Personal Context</strong>, and <strong className="text-neutral-900 font-bold">OpenMemory MCP</strong>. Retains tech stack preferences, past architecture decisions, and business rules across every conversation.
            </p>
          </div>

          {/* 3D Vector Memory Core Visualizer */}
          <div className="shrink-0 relative">
            <MemoryGraphVisualizer className="w-36 h-36 md:w-44 md:h-44" />
          </div>
        </div>

        {/* Three Core Architecture Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-8 md:mb-10">
          {projectActionCards.map((card) => (
            <div
              key={card.id}
              onClick={() => onSendMessage(card.prompt)}
              className="group bg-white/85 hover:bg-white p-5 rounded-2xl border border-white/80 hover:border-indigo-300 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between backdrop-blur-md relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {card.icon}
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                </div>
                <div>
                  <h3 className="text-xs md:text-sm font-bold text-neutral-900 group-hover:text-indigo-950 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-[11px] text-neutral-500 font-medium mt-1 leading-snug">
                    {card.subtitle}
                  </p>
                </div>
              </div>

              <div className="pt-3.5 mt-3 flex items-center justify-between border-t border-neutral-100 text-[11px] font-bold text-neutral-400 group-hover:text-indigo-600 transition-colors">
                <span>{card.category}</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>

        {/* Floating Context-Primed Prompt Input Box */}
        <div className="max-w-2xl mx-auto w-full space-y-3">
          {/* Subtext info */}
          <div className="flex items-center justify-between px-3 text-[11px] text-neutral-500 select-none">
            <div
              onClick={onOpenContextLayer}
              className="flex items-center gap-1.5 hover:text-neutral-900 transition-colors cursor-pointer font-medium"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Inspect {memories.length} Grounded Context Shards</span>
            </div>

            <div className="flex items-center gap-1.5 font-medium text-neutral-400">
              <Brain className="w-3 h-3 text-emerald-600" />
              <span>Auto-Indexed by Mem0 Vector Engine</span>
            </div>
          </div>

          {/* Frosted Floating Pill Input */}
          <form
            onSubmit={handleSubmit}
            className="bg-white/95 backdrop-blur-2xl rounded-3xl p-3 border border-white/90 shadow-xl shadow-indigo-500/5 space-y-3"
          >
            <div className="flex items-center gap-3 px-2">
              <span
                onClick={onOpenNewSession}
                title="New Session"
                className="text-neutral-400 font-bold text-base cursor-pointer hover:text-neutral-800 transition-colors"
              >
                +
              </span>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder='Ask anything or state a preference (e.g. "We chose PostgreSQL with drizzle", "What did we decide?")'
                className="flex-1 bg-transparent text-xs text-neutral-900 placeholder-neutral-400 outline-none font-medium"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-neutral-900 transition-all cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Filter Triggers */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-neutral-100">
              {quickActionPills.map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => {
                    setSelectedPill(pill.label);
                    onSendMessage(pill.query);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    selectedPill === pill.label
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-neutral-100/90 hover:bg-neutral-200 text-neutral-700'
                  }`}
                >
                  {pill.icon}
                  <span>{pill.label}</span>
                </button>
              ))}

              <button
                type="button"
                onClick={onOpenContextLayer}
                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                title="Open ClariLayer Context Inspector"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
