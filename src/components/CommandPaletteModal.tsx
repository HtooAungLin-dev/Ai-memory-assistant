import React, { useState, useEffect } from 'react';
import { Search, Brain, History, Bot, Sparkles, X, ArrowRight } from 'lucide-react';
import { MemoryItem, Session, AgentWorkflow } from '../types';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: MemoryItem[];
  sessions: Session[];
  agents: AgentWorkflow[];
  onSelectMemory: (mem: MemoryItem) => void;
  onSelectSession: (id: string) => void;
  onTriggerInspiration: (text: string) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  memories,
  sessions,
  agents,
  onSelectMemory,
  onSelectSession,
  onTriggerInspiration,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent
        }
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredMemories = memories.filter(
    (m) =>
      m.content.toLowerCase().includes(query.toLowerCase()) ||
      m.category.toLowerCase().includes(query.toLowerCase())
  );

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-start justify-center z-50 pt-20 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        <div className="p-3 border-b border-neutral-100 flex items-center gap-2.5">
          <Search className="w-4 h-4 text-neutral-400 ml-1" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search memories, switch sessions, or run agent commands..."
            className="w-full text-xs text-neutral-800 placeholder-neutral-400 outline-none py-1"
          />
          <kbd className="text-[10px] bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-500 font-mono">
            ESC
          </kbd>
        </div>

        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {/* Memories */}
          <div>
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-2 py-1">
              Recalled Long-Term Memories ({filteredMemories.length})
            </div>
            {filteredMemories.map((m) => (
              <div
                key={m.id}
                onClick={() => {
                  onSelectMemory(m);
                  onClose();
                }}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 cursor-pointer text-xs group"
              >
                <div className="flex items-center gap-2 truncate">
                  <Brain className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="truncate text-neutral-800">{m.content}</span>
                </div>
                <span className="text-[9px] uppercase font-bold text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded shrink-0">
                  {m.category}
                </span>
              </div>
            ))}
          </div>

          {/* Sessions */}
          <div>
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-2 py-1">
              Switch Session Context ({filteredSessions.length})
            </div>
            {filteredSessions.map((s) => (
              <div
                key={s.id}
                onClick={() => {
                  onSelectSession(s.id);
                  onClose();
                }}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 cursor-pointer text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <History className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                  <span className="truncate text-neutral-800">{s.title}</span>
                </div>
                <span className="text-[10px] text-neutral-400">{s.createdAt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
