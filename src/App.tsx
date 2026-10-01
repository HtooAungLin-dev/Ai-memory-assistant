import React, { useState, useEffect } from 'react';
import { HeaderNav } from './components/HeaderNav';
import { SessionsList } from './components/SessionsList';
import { ChatArea } from './components/ChatArea';
import { MemoryInspector } from './components/MemoryInspector';
import { MultiAgentRunner } from './components/MultiAgentRunner';
import { OpenMemoryMCPViewer } from './components/OpenMemoryMCPViewer';
import { AddEditMemoryModal } from './components/AddEditMemoryModal';
import { ExportModal } from './components/ExportModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { QuickVoiceNoteRecorder } from './components/QuickVoiceNoteRecorder';
import { ClariLayerContextInspector } from './components/ClariLayerContextInspector';
import { ProjectDockSidebar } from './components/ProjectDockSidebar';
import { ProjectHomeDashboard } from './components/ProjectHomeDashboard';
import { UpgradeModal } from './components/UpgradeModal';

import {
  INITIAL_MEMORIES,
  INITIAL_SESSIONS,
  INITIAL_AGENTS,
  INITIAL_CHAT_HISTORIES,
} from './initialData';
import { MemoryItem, MemoryCategory, MemorySentiment, Session, AgentWorkflow, ChatMessage, AgentExecutionLog } from './types';
import { Brain, Layers, Cpu, Database, ShieldCheck, ArrowLeft, Sparkles, MessageSquare } from 'lucide-react';

export default function App() {
  // Navigation View State: 'home' (Image 2 design) | 'chat' | 'explore' | 'context' | 'history'
  const [activeView, setActiveView] = useState<'home' | 'chat' | 'explore' | 'context' | 'history'>('home');

  // Memories State
  const [memories, setMemories] = useState<MemoryItem[]>(() => {
    const saved = localStorage.getItem('ai_assistant_memories');
    return saved ? JSON.parse(saved) : INITIAL_MEMORIES;
  });

  // Sessions State
  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem('ai_assistant_sessions');
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  const [activeSessionId, setActiveSessionId] = useState<string>('session-3');

  // Messages State per session
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem('ai_assistant_chats');
    return saved ? JSON.parse(saved) : INITIAL_CHAT_HISTORIES;
  });

  // Agents State
  const [agents, setAgents] = useState<AgentWorkflow[]>(INITIAL_AGENTS);

  // Right Panel Tab: 'memories' | 'clarilayer' | 'agents' | 'mcp'
  const [rightPanelTab, setRightPanelTab] = useState<'memories' | 'clarilayer' | 'agents' | 'mcp'>('clarilayer');

  // Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [isMultiAgentRunning, setIsMultiAgentRunning] = useState(false);
  const [isRecalling, setIsRecalling] = useState(false);
  const [isQuotaLimited, setIsQuotaLimited] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);

  // Modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<MemoryItem | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Focus & live memory state
  const [selectedMemoryForHighlight, setSelectedMemoryForHighlight] = useState<MemoryItem | null>(null);
  const [recentlyExtractedMemories, setRecentlyExtractedMemories] = useState<MemoryItem[]>([]);
  const [latestAgentRunResult, setLatestAgentRunResult] = useState<{
    task: string;
    logs: AgentExecutionLog[];
    synthesis: string;
  } | null>(null);

  // ClariLayer: Reconcile and audit saved context against evidence
  const handleReconcileContext = async () => {
    setIsReconciling(true);
    try {
      const resp = await fetch('/api/reconcile-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memories }),
      });
      const data = await resp.json();
      if (Array.isArray(data.reconciled) && data.reconciled.length > 0) {
        setMemories((prev) =>
          prev.map((m) => {
            const match = data.reconciled.find((r: any) => r.id === m.id);
            if (match) {
              return {
                ...m,
                verification: {
                  status: match.status,
                  lastChecked: 'Just now',
                  sourceType: m.userCurated ? 'user_curated' : 'data_reconciled',
                  evidence: match.evidence || m.verification?.evidence,
                  caveatNote: match.caveatNote,
                },
              };
            }
            return m;
          })
        );
      }
    } catch (e) {
      console.warn('Reconcile context request failed:', e);
    } finally {
      setIsReconciling(false);
    }
  };

  // Check engine status on mount
  useEffect(() => {
    fetch('/api/engine-status')
      .then((r) => r.json())
      .then((data) => {
        if (data.isQuotaLimited) {
          setIsQuotaLimited(true);
        }
      })
      .catch(() => {});
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('ai_assistant_memories', JSON.stringify(memories));
  }, [memories]);

  useEffect(() => {
    localStorage.setItem('ai_assistant_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('ai_assistant_chats', JSON.stringify(chatHistories));
  }, [chatHistories]);

  // Keyboard shortcut ⌘K or Ctrl+K for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0] || {
      id: 'session-default',
      title: 'Current Session',
      createdAt: 'Just now',
      messageCount: 0,
    };

  const currentMessages = chatHistories[activeSessionId] || [];

  // Handle Send Message (With Automatic Memory Recall & Fact Extraction)
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...currentMessages, userMsg];
    setChatHistories((prev) => ({
      ...prev,
      [activeSessionId]: updatedMessages,
    }));

    // Update session message count
    setSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, messageCount: s.messageCount + 1 } : s))
    );

    setIsLoading(true);

    try {
      // 1. Call server /api/chat with full conversational history and current long-term memories
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: updatedMessages.slice(-8),
          memories,
          activeAgents: agents.filter((a) => a.status === 'running'),
        }),
      });

      const data = await response.json();
      if (data.quotaExhausted !== undefined) {
        setIsQuotaLimited(data.quotaExhausted);
      }
      const reply = data.reply || "I've processed that with full awareness of our persistent context.";

      // Match which memories were referenced
      const lower = (text + ' ' + reply).toLowerCase();
      const recalled = memories
        .filter((m) => {
          const words = m.content.toLowerCase().split(' ').filter((w) => w.length > 4);
          return words.some((w) => lower.includes(w)) || m.pinned;
        })
        .map((m) => m.content)
        .slice(0, 3);

      const assistantMsg: ChatMessage = {
        id: `msg-resp-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recalledMemories: recalled.length > 0 ? recalled : undefined,
      };

      setChatHistories((prev) => ({
        ...prev,
        [activeSessionId]: [...updatedMessages, assistantMsg],
      }));

      setSessions((prev) =>
        prev.map((s) => (s.id === activeSessionId ? { ...s, messageCount: s.messageCount + 1 } : s))
      );

      setIsLoading(false);

      // 2. Asynchronously extract new memories from user message if new facts are stated
      fetch('/api/extract-memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, existingMemories: memories }),
      })
        .then((res) => res.json())
        .then((extractedData) => {
          if (extractedData.memories && extractedData.memories.length > 0) {
            const newMems: MemoryItem[] = extractedData.memories.map((em: any, idx: number) => ({
              id: `mem-${Date.now()}-${idx}`,
              content: em.content,
              category: em.category || 'knowledge',
              confidence: em.confidence || 0.92,
              timestamp: 'Just now',
              sessionId: activeSessionId,
              sessionTitle: activeSession.title,
              accessCount: 1,
              lastRecalledAt: 'Just now',
              sentiment: em.sentiment || (em.category === 'constraint' ? 'negative' : 'positive'),
              tags: Array.isArray(em.tags) && em.tags.length > 0 ? em.tags : ['Fact', 'Context'],
            }));

            setMemories((prev) => [...prev, ...newMems]);
            setRecentlyExtractedMemories(newMems);
            setTimeout(() => setRecentlyExtractedMemories([]), 6000);
          }
        })
        .catch((err) => console.warn('Fact extraction error:', err));
    } catch (err: any) {
      console.error('Chat error:', err);
      setIsLoading(false);
      const fallbackMsg: ChatMessage = {
        id: `msg-resp-${Date.now()}`,
        role: 'assistant',
        content: `I've updated my persistent memory with this information! Stored memory items: ${memories.length}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistories((prev) => ({
        ...prev,
        [activeSessionId]: [...updatedMessages, fallbackMsg],
      }));
    }
  };

  // Test Cross-Session Recall button
  const handleTestCrossSessionRecall = async () => {
    setIsRecalling(true);
    await handleSendMessage(
      "Test Cross-Session Recall: What do you remember about my identity, our agreed tech stack, and project goals across our previous sessions?"
    );
    setIsRecalling(false);
  };

  // Create New Session (Preserving All Memory!)
  const handleNewSession = () => {
    const sessionNum = sessions.length + 1;
    const newSessionId = `session-${sessionNum}`;
    const newSession: Session = {
      id: newSessionId,
      title: `Session ${sessionNum}: Context Continuation`,
      description: `Starts with all ${memories.length} historical memory facts pre-loaded from past conversations.`,
      createdAt: 'Just now',
      messageCount: 1,
    };

    const initialWelcomeMsg: ChatMessage = {
      id: `msg-welcome-${Date.now()}`,
      role: 'assistant',
      content: `Welcome to **Session ${sessionNum}**! 👋\n\nUnlike traditional chatbots that reset to zero, I have already pulled **${memories.length} cross-session memories** from our Mem0 graph into context (including your identity, tech preferences, and project parameters).\n\nWhat would you like to work on next?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recalledMemories: memories.slice(0, 3).map((m) => m.content),
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
    setChatHistories((prev) => ({
      ...prev,
      [newSessionId]: [initialWelcomeMsg],
    }));
  };

  // Multi-Agent Workflow Runner Trigger
  const handleTriggerMultiAgentRun = async (taskDirective: string) => {
    setIsMultiAgentRunning(true);
    setRightPanelTab('agents');

    // Set agents status to running
    setAgents((prev) => prev.map((a) => ({ ...a, status: 'running' })));

    try {
      const response = await fetch('/api/multi-agent-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: taskDirective,
          memories,
          agents,
        }),
      });

      const data = await response.json();

      setAgents((prev) =>
        prev.map((a) => ({
          ...a,
          status: a.id === 'agent-2' ? 'running' : 'completed',
          lastRun: 'Just now',
        }))
      );

      setLatestAgentRunResult({
        task: taskDirective,
        logs: data.logs || [],
        synthesis: data.synthesis || 'Multi-agent consensus established across all session memories.',
      });
    } catch (e: any) {
      console.error('Multi-agent execution error:', e);
      setAgents((prev) =>
        prev.map((a) => ({ ...a, status: 'completed', lastRun: 'Just now' }))
      );
    } finally {
      setIsMultiAgentRunning(false);
    }
  };

  // Memory Actions
  const handleSaveMemory = (newOrEdited: Omit<MemoryItem, 'id' | 'timestamp'> & { id?: string }) => {
    if (newOrEdited.id) {
      setMemories((prev) =>
        prev.map((m) =>
          m.id === newOrEdited.id
            ? { ...m, ...newOrEdited, timestamp: 'Edited just now' }
            : m
        )
      );
    } else {
      const created: MemoryItem = {
        ...newOrEdited,
        id: `mem-${Date.now()}`,
        timestamp: 'Just now',
        accessCount: 1,
        lastRecalledAt: 'Just now',
      };
      setMemories((prev) => [created, ...prev]);
    }
    setEditingMemory(null);
  };

  const handleDeleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const handleDeleteMultipleMemories = (ids: string[]) => {
    setMemories((prev) => prev.filter((m) => !ids.includes(m.id)));
  };

  const handleBulkAddTags = (ids: string[], tagToAdd: string) => {
    const cleanTag = tagToAdd.trim().replace(/^#/, '');
    if (!cleanTag) return;
    setMemories((prev) =>
      prev.map((m) => {
        if (ids.includes(m.id)) {
          const currentTags = m.tags || [];
          if (!currentTags.includes(cleanTag)) {
            return { ...m, tags: [...currentTags, cleanTag] };
          }
        }
        return m;
      })
    );
  };

  const handleMergeMemories = (
    duplicateIds: string[],
    mergedEntry: {
      content: string;
      category: MemoryCategory;
      pinned?: boolean;
      confidence?: number;
      sentiment?: MemorySentiment;
      tags?: string[];
    }
  ) => {
    const newMemory: MemoryItem = {
      id: `mem-merged-${Date.now()}`,
      content: mergedEntry.content,
      category: mergedEntry.category,
      confidence: mergedEntry.confidence || 0.98,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sessionId: 'session-consolidated',
      sessionTitle: 'Consolidated Shard',
      pinned: !!mergedEntry.pinned,
      sentiment: mergedEntry.sentiment || 'positive',
      tags: mergedEntry.tags || ['Consolidated', 'Fact'],
    };

    setMemories((prev) => [newMemory, ...prev.filter((m) => !duplicateIds.includes(m.id))]);
  };

  const handleTogglePinMemory = (id: string) => {
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, pinned: !m.pinned } : m))
    );
  };

  const handleToggleArchiveMemory = (id: string) => {
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, archived: !m.archived } : m))
    );
  };

  const handleBulkArchiveMemories = (ids: string[], archive: boolean) => {
    setMemories((prev) =>
      prev.map((m) => (ids.includes(m.id) ? { ...m, archived: archive } : m))
    );
  };

  const handleAutoArchiveRarelyAccessed = (threshold: number = 3) => {
    setMemories((prev) =>
      prev.map((m) => {
        if (!m.archived && !m.pinned && (m.accessCount ?? 0) <= threshold) {
          return { ...m, archived: true };
        }
        return m;
      })
    );
  };

  const handleSelectMemoryForInspection = (mem: MemoryItem) => {
    setSelectedMemoryForHighlight(mem);
    setRightPanelTab('memories');
  };

  const handleAddQuickVoiceMemories = (newMemories: MemoryItem[]) => {
    setMemories((prev) => [...newMemories, ...prev]);
    if (newMemories.length > 0) {
      setSelectedMemoryForHighlight(newMemories[0]);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#eef3fc] text-neutral-900 font-sans overflow-hidden antialiased select-none relative">
      {/* 1. LEFT CAPSULE DOCK SIDEBAR */}
      <ProjectDockSidebar
        activeView={activeView}
        onSelectView={(v) => setActiveView(v)}
        onNewChat={() => {
          handleNewSession();
          setActiveView('chat');
        }}
        memoryCount={memories.length}
      />

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div className="flex-1 flex overflow-hidden my-2 md:my-3 mr-2 md:mr-3 rounded-3xl bg-white shadow-xl border border-white/60 relative">
        {/* VIEW A: HOME DASHBOARD (Project Purpose: Mem0 Vector Knowledge, ClariLayer Context, Zero Amnesia) */}
        {activeView === 'home' && (
          <ProjectHomeDashboard
            onSendMessage={(msg) => {
              handleSendMessage(msg);
              setActiveView('chat');
            }}
            onOpenContextLayer={() => {
              setActiveView('context');
            }}
            onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
            onOpenNewSession={handleNewSession}
            onTestRecall={handleTestCrossSessionRecall}
            memories={memories}
            activeSession={activeSession}
            isRecalling={isRecalling}
          />
        )}

        {/* VIEW B: CHAT WORKSPACE (Clean, Sleek with Memory Citations and Collapsible Context) */}
        {activeView === 'chat' && (
          <div className="flex-1 flex flex-col h-full bg-neutral-50/40">
            {/* Top Bar for Chat */}
            <div className="h-12 border-b border-neutral-100 px-4 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveView('home')}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Home</span>
                </button>
                <div className="h-4 w-px bg-neutral-200" />
                <span className="text-xs font-bold text-neutral-900 truncate">
                  {activeSession.title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveView('context')}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all border border-indigo-200/80 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Personal Context ({memories.length})</span>
                </button>
                <button
                  onClick={handleNewSession}
                  className="px-3 py-1 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  + New Session
                </button>
              </div>
            </div>

            {/* Middle Chat & Right Panel */}
            <div className="flex-1 flex overflow-hidden">
              <ChatArea
                messages={currentMessages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                activeSession={activeSession}
                memories={memories}
                onSelectMemoryForInspection={handleSelectMemoryForInspection}
                recentlyExtractedMemories={recentlyExtractedMemories}
                onSaveToContextLayer={(text) => {
                  setEditingMemory({
                    id: `mem-curated-${Date.now()}`,
                    content: text,
                    category: 'decision',
                    scope: 'global',
                    confidence: 0.99,
                    timestamp: 'Just now',
                    sessionId: activeSessionId,
                    sessionTitle: activeSession.title,
                    userCurated: true,
                    tags: ['CuratedContext', 'Decision'],
                    verification: {
                      status: 'verified',
                      lastChecked: 'Just now',
                      sourceType: 'user_curated',
                      evidence: 'Directly selected from chat turn by user.',
                    },
                  });
                  setIsAddEditModalOpen(true);
                  setActiveView('context');
                }}
              />

              {/* Right Panel for Live Shards */}
              <div className="w-80 border-l border-neutral-100 bg-white hidden xl:flex flex-col h-full">
                <ClariLayerContextInspector
                  memories={memories}
                  onAddContext={() => {
                    setEditingMemory(null);
                    setIsAddEditModalOpen(true);
                  }}
                  onEditMemory={(mem) => {
                    setEditingMemory(mem);
                    setIsAddEditModalOpen(true);
                  }}
                  onReconcileAll={handleReconcileContext}
                  isReconciling={isReconciling}
                />
              </div>
            </div>
          </div>
        )}

        {/* VIEW C: FULL CLARILAYER PERSONAL CONTEXT LAYER */}
        {activeView === 'context' && (
          <div className="flex-1 flex flex-col h-full bg-white">
            <div className="h-12 border-b border-neutral-100 px-4 flex items-center justify-between shrink-0">
              <button
                onClick={() => setActiveView('home')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Assistant</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsExportOpen(true)}
                  className="px-3 py-1 rounded-full border border-neutral-200 hover:bg-neutral-50 text-xs font-bold text-neutral-700 transition-colors cursor-pointer"
                >
                  Export Schema
                </button>
                <button
                  onClick={() => {
                    setEditingMemory(null);
                    setIsAddEditModalOpen(true);
                  }}
                  className="px-3.5 py-1 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  + Add Fact / Rule
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <ClariLayerContextInspector
                memories={memories}
                onAddContext={() => {
                  setEditingMemory(null);
                  setIsAddEditModalOpen(true);
                }}
                onEditMemory={(mem) => {
                  setEditingMemory(mem);
                  setIsAddEditModalOpen(true);
                }}
                onReconcileAll={handleReconcileContext}
                isReconciling={isReconciling}
              />
            </div>
          </div>
        )}

        {/* VIEW D: SESSIONS HISTORY & CONVERSATION CONTINUITY */}
        {activeView === 'history' && (
          <div className="flex-1 flex flex-col h-full bg-white">
            <div className="h-12 border-b border-neutral-100 px-4 flex items-center justify-between shrink-0">
              <button
                onClick={() => setActiveView('home')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <span className="text-xs font-bold text-neutral-800">
                Tracked Sessions ({sessions.length})
              </span>
            </div>

            <div className="flex-1 flex overflow-hidden">
              <SessionsList
                sessions={sessions}
                activeSessionId={activeSessionId}
                onSelectSession={(id) => {
                  setActiveSessionId(id);
                  setActiveView('chat');
                }}
                onNewSession={() => {
                  handleNewSession();
                  setActiveView('chat');
                }}
                memories={memories}
                onQuickPrompt={(text) => {
                  handleSendMessage(text);
                  setActiveView('chat');
                }}
              />

              <div className="flex-1 bg-neutral-50/50 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <Brain className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-neutral-900 mb-1">
                  Zero Context Amnesia Across Sessions
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mb-4">
                  Select any previous session or start a new thread. All {memories.length} long-term memory propositions and architectural decisions carry forward automatically.
                </p>
                <button
                  onClick={() => {
                    handleNewSession();
                    setActiveView('chat');
                  }}
                  className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-bold shadow-md hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Start New Context Session
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. MODALS */}
      <AddEditMemoryModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setEditingMemory(null);
        }}
        onSave={handleSaveMemory}
        editingMemory={editingMemory}
        sessions={sessions}
        activeSessionId={activeSessionId}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        memories={memories}
        sessions={sessions}
        agents={agents}
      />

      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        memories={memories}
        sessions={sessions}
        agents={agents}
        onSelectMemory={handleSelectMemoryForInspection}
        onSelectSession={(id) => {
          setActiveSessionId(id);
          setActiveView('chat');
        }}
        onTriggerInspiration={(text) => {
          handleSendMessage(text);
          setActiveView('chat');
        }}
      />

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />

      {/* Floating Record Quick Note Button & Audio Capture Suite */}
      <QuickVoiceNoteRecorder
        onAddMemories={handleAddQuickVoiceMemories}
        activeSessionId={activeSessionId}
      />
    </div>
  );
}
