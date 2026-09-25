import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Search,
  History,
  Layers,
  Sparkles,
  ChevronRight,
  Database,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { Session, MemoryItem } from '../types';

interface SessionsListProps {
  sessions: Session[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession?: (id: string) => void;
  memories: MemoryItem[];
  onQuickPrompt: (prompt: string) => void;
}

export const SessionsList: React.FC<SessionsListProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  memories,
  onQuickPrompt,
}) => {
  const [search, setSearch] = useState('');

  const filteredSessions = sessions.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <aside className="w-72 border-r border-neutral-200/80 bg-white flex flex-col h-full select-none shrink-0">
      {/* Sessions Top Header */}
      <div className="p-3 border-b border-neutral-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-neutral-500" />
          <span className="text-xs font-bold text-neutral-900">Conversations</span>
          <span className="text-[10px] text-neutral-400 font-mono">({sessions.length})</span>
        </div>

        <button
          onClick={onNewSession}
          className="p-1 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          title="Start New Conversation (Preserves all memory)"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Cross-Session Context Continuity Banner */}
      <div className="mx-3 mt-3 p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/60 text-[11px] leading-relaxed">
        <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-1">
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span>Cross-Session Continuity</span>
        </div>
        <p className="text-emerald-800">
          <strong>{memories.length} long-term memories</strong> are automatically injected into every new conversation thread. You never start from zero.
        </p>
      </div>

      {/* Search Input */}
      <div className="p-3">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200/80 text-xs">
          <Search className="w-3.5 h-3.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-neutral-800 placeholder-neutral-400 outline-none text-xs"
          />
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {filteredSessions.map((session) => {
          const isActive = session.id === activeSessionId;
          return (
            <div
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`group p-2.5 rounded-lg text-xs cursor-pointer transition-all border ${
                isActive
                  ? 'bg-neutral-100/90 border-neutral-300 font-medium text-neutral-900 shadow-2xs'
                  : 'border-transparent text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
              }`}
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <span className="font-semibold truncate max-w-[190px]">
                  {session.title}
                </span>
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                )}
              </div>

              {session.description && (
                <p className="text-[11px] text-neutral-500 line-clamp-1 mb-1.5 font-normal">
                  {session.description}
                </p>
              )}

              <div className="flex items-center justify-between text-[10px] text-neutral-400 font-normal">
                <span>{session.createdAt}</span>
                <span>{session.messageCount} messages</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Test Prompts Area */}
      <div className="p-3 border-t border-neutral-100 bg-neutral-50/50">
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
          Verify Memory Retention
        </span>
        <div className="space-y-1.5">
          <button
            onClick={() => onQuickPrompt('What do you remember about my identity, name, and preferences?')}
            className="w-full text-left p-1.5 rounded-md hover:bg-white border border-transparent hover:border-neutral-200 text-[11px] text-neutral-700 transition-all flex items-center justify-between"
          >
            <span className="truncate">"What do you remember about me?"</span>
            <ChevronRight className="w-3 h-3 text-neutral-400 shrink-0" />
          </button>
          <button
            onClick={() => onQuickPrompt('What tech stack and frameworks did we agree on in previous sessions?')}
            className="w-full text-left p-1.5 rounded-md hover:bg-white border border-transparent hover:border-neutral-200 text-[11px] text-neutral-700 transition-all flex items-center justify-between"
          >
            <span className="truncate">"What tech stack did we agree on?"</span>
            <ChevronRight className="w-3 h-3 text-neutral-400 shrink-0" />
          </button>
          <button
            onClick={() => onQuickPrompt('Remember this new fact: I also require PostgreSQL with Cloud SQL for relational storage.')}
            className="w-full text-left p-1.5 rounded-md hover:bg-white border border-transparent hover:border-neutral-200 text-[11px] text-indigo-700 font-medium transition-all flex items-center justify-between"
          >
            <span className="truncate">+ Inject new database memory</span>
            <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
          </button>
        </div>
      </div>
    </aside>
  );
};
