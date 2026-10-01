import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Mic,
  ArrowRight,
  Send,
  Globe,
  Music,
  Image as ImageIcon,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Layers,
  ShieldCheck,
  CheckCircle,
  Database,
  Share2,
  Calendar,
  MessageSquare,
  Zap,
} from 'lucide-react';
import { NixtioRobotMascot } from './NixtioRobotMascot';
import { MemoryItem, Session } from '../types';

interface NixtioHomeDashboardProps {
  userName?: string;
  onSendMessage: (text: string) => void;
  onOpenContextLayer: () => void;
  onOpenUpgradeModal?: () => void;
  onOpenNewSession?: () => void;
  memories: MemoryItem[];
  activeSession: Session;
}

export const NixtioHomeDashboard: React.FC<NixtioHomeDashboardProps> = ({
  userName = 'Nixtio',
  onSendMessage,
  onOpenContextLayer,
  onOpenUpgradeModal,
  onOpenNewSession,
  memories,
  activeSession,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedPill, setSelectedPill] = useState<string>('Deep Research');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const actionCards = [
    {
      id: 'fast-start',
      icon: (
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
          <Layers className="w-6 h-6 text-amber-500" />
        </div>
      ),
      title: 'Contribute ideas, offer feedback, and manage tasks — all in sync.',
      category: 'Fast Start',
      prompt: 'Summarize our current sprint tasks and persistent tech stack preferences',
    },
    {
      id: 'team-collab',
      icon: (
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
          {/* Slack style 4-color symbol */}
          <div className="grid grid-cols-2 gap-0.5 w-6 h-6">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#36C5F0]" />
            <span className="w-2.5 h-2.5 rounded-xs bg-[#2EB67D]" />
            <span className="w-2.5 h-2.5 rounded-xs bg-[#E01E5A]" />
            <span className="w-2.5 h-2.5 rounded-xs bg-[#ECB22E]" />
          </div>
        </div>
      ),
      title: 'Stay connected, share ideas, and align goals effortlessly. Boost your productivity with AI Bot',
      category: 'Collaborate with Team',
      prompt: 'Check our ClariLayer personal decisions and rules for API team collaboration',
    },
    {
      id: 'planning',
      icon: (
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
          <div className="w-7 h-7 rounded-md bg-white border border-neutral-200 flex flex-col items-center justify-center text-[10px] font-black text-blue-600 shadow-2xs">
            <span className="text-[7px] text-red-500 font-bold -mb-0.5">OCT</span>
            <span>31</span>
          </div>
        </div>
      ),
      title: 'Organize your time efficiently, set clear priorities, and stay focused',
      category: 'Planning',
      prompt: 'Review verified decisions and draft the deployment plan for Google Cloud Run',
    },
  ];

  const pillButtons = [
    { id: 'deep-research', label: 'Deep Research', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'make-image', label: 'Make an Image', icon: <ImageIcon className="w-3.5 h-3.5" /> },
    { id: 'search', label: 'Search', icon: <Search className="w-3.5 h-3.5" /> },
    { id: 'create-music', label: 'Create music', icon: <Music className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-[#f8faff] via-[#f0f4fd] to-[#e8eefa] p-4 md:p-8 overflow-y-auto relative rounded-3xl m-2 md:m-4 border border-white/80 shadow-2xl backdrop-blur-2xl">
      {/* Top Navbar */}
      <div className="flex items-center justify-between shrink-0 mb-8 select-none">
        {/* Model Selector Dropdown */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenContextLayer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white border border-neutral-200/80 shadow-2xs text-xs font-bold text-neutral-800 transition-all cursor-pointer backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Assistant v2.6</span>
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>

          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50/80 border border-indigo-200/70 text-[11px] font-semibold text-indigo-700">
            <ShieldCheck className="w-3 h-3 text-indigo-600" />
            <span>{memories.length} ClariLayer Facts Recalled</span>
          </div>
        </div>

        {/* Center Brand Text */}
        <div className="text-xs font-bold tracking-tight text-neutral-500 hidden md:block">
          Daily Nixtio
        </div>

        {/* Top Right Upgrade Pill */}
        <button
          onClick={onOpenUpgradeModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Upgrade</span>
        </button>
      </div>

      {/* Hero Section with Cute 3D AI Robot and Title */}
      <div className="max-w-4xl mx-auto w-full my-auto flex flex-col justify-center py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 md:mb-12">
          {/* Hero Typography */}
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-neutral-900 leading-[1.15]">
              Hi {userName}, Ready to <br />
              <span className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-indigo-900 bg-clip-text text-transparent">
                Achieve Great Things?
              </span>
            </h1>
            <p className="text-xs md:text-sm text-neutral-500 font-medium mt-2 max-w-lg">
              Empowered with durable cross-session context, past decisions, and verified memory so you never repeat yourself.
            </p>
          </div>

          {/* 3D Mascot Character from Second Image */}
          <div className="shrink-0 relative">
            <NixtioRobotMascot className="w-32 h-32 md:w-40 md:h-40" />
          </div>
        </div>

        {/* Three Frosted Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-8 md:mb-12">
          {actionCards.map((card) => (
            <div
              key={card.id}
              onClick={() => onSendMessage(card.prompt)}
              className="group bg-white/80 hover:bg-white p-5 rounded-2xl border border-white/80 hover:border-indigo-200/80 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between backdrop-blur-md relative overflow-hidden"
            >
              <div className="space-y-4">
                {card.icon}
                <p className="text-xs md:text-[13px] font-semibold text-neutral-800 leading-snug group-hover:text-neutral-900">
                  {card.title}
                </p>
              </div>

              <div className="pt-4 mt-2 flex items-center justify-between border-t border-neutral-100/80 text-[11px] font-bold text-neutral-400 group-hover:text-indigo-600 transition-colors">
                <span>{card.category}</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Floating Prompt Input Box */}
        <div className="max-w-2xl mx-auto w-full space-y-3">
          {/* Plan banner */}
          <div className="flex items-center justify-between px-3 text-[11px] text-neutral-500 select-none">
            <div
              onClick={onOpenUpgradeModal}
              className="flex items-center gap-1.5 hover:text-neutral-800 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-neutral-400" />
              <span>Unlock more with Pro Plan</span>
            </div>

            <div className="flex items-center gap-1.5 font-medium text-neutral-400">
              <Sparkles className="w-3 h-3" />
              <span>Powered by Assistant v2.6 · ClariLayer Context</span>
            </div>
          </div>

          {/* Frosted Floating Pill Input */}
          <form
            onSubmit={handleSubmit}
            className="bg-white/95 backdrop-blur-2xl rounded-3xl p-3 border border-white/90 shadow-xl shadow-indigo-500/5 space-y-3"
          >
            <div className="flex items-center gap-3 px-2">
              <span className="text-neutral-400 font-bold text-base cursor-pointer hover:text-neutral-700">+</span>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder='Example: "Explain quantum computing in simple terms" or "What did we decide on database?"'
                className="flex-1 bg-transparent text-xs text-neutral-900 placeholder-neutral-400 outline-none font-medium"
              />
              <button
                type="button"
                className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-neutral-900 transition-all cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Pill Buttons underneath input */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-neutral-100">
              {pillButtons.map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => {
                    setSelectedPill(pill.label);
                    onSendMessage(`[${pill.label}] `);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    selectedPill === pill.label
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-neutral-100/80 hover:bg-neutral-200 text-neutral-700'
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
