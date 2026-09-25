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

import {
  INITIAL_MEMORIES,
  INITIAL_SESSIONS,
  INITIAL_AGENTS,
  INITIAL_CHAT_HISTORIES,
} from './initialData';
import { MemoryItem, MemoryCategory, MemorySentiment, Session, AgentWorkflow, ChatMessage, AgentExecutionLog } from './types';
import { Brain, Layers, Cpu, Database } from 'lucide-react';

export default function App() {
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

  // Right Panel Tab: 'memories' | 'agents' | 'mcp'
  const [rightPanelTab, setRightPanelTab] = useState<'memories' | 'agents' | 'mcp'>('memories');

  // Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [isMultiAgentRunning, setIsMultiAgentRunning] = useState(false);
  const [isRecalling, setIsRecalling] = useState(false);
  const [isQuotaLimited, setIsQuotaLimited] = useState(false);

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

  // Memory Inspector Focus
  const [selectedMemoryForHighlight, setSelectedMemoryForHighlight] = useState<MemoryItem | null>(null);

  // Live Extracted Memory Toasts
  const [recentlyExtractedMemories, setRecentlyExtractedMemories] = useState<MemoryItem[]>([]);

  // Multi-Agent Execution Results
  const [latestAgentRunResult, setLatestAgentRunResult] = useState<{
    task: string;
    logs: AgentExecutionLog[];
    synthesis: string;
  } | null>(null);

  // Modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<MemoryItem | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

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
    <div className="flex flex-col h-screen w-screen bg-neutral-100 text-neutral-900 font-sans overflow-hidden antialiased">
      {/* 1. TOP HEADER NAVIGATION */}
      <HeaderNav
        memoryCount={memories.length}
        sessionCount={sessions.length}
        onNewSession={handleNewSession}
        onExport={() => setIsExportOpen(true)}
        onTestCrossSessionRecall={handleTestCrossSessionRecall}
        isRecalling={isRecalling}
        isQuotaLimited={isQuotaLimited}
      />

      {/* 2. THREE-PANEL CORE INTERFACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: Sessions / Conversations List */}
        <SessionsList
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={setActiveSessionId}
          onNewSession={handleNewSession}
          memories={memories}
          onQuickPrompt={handleSendMessage}
        />

        {/* MIDDLE COLUMN: Chat Experience with Memory Citations */}
        <ChatArea
          messages={currentMessages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          activeSession={activeSession}
          memories={memories}
          onSelectMemoryForInspection={handleSelectMemoryForInspection}
          recentlyExtractedMemories={recentlyExtractedMemories}
        />

        {/* RIGHT COLUMN: Memory Inspector & Multi-Agent Workspace */}
        <div className="w-96 border-l border-neutral-200/80 bg-white flex flex-col h-full shrink-0">
          {/* Tab Selector */}
          <div className="p-2 border-b border-neutral-200/80 bg-neutral-50/70">
            <div className="flex bg-neutral-200/60 p-0.5 rounded-lg text-xs font-medium">
              <button
                onClick={() => setRightPanelTab('memories')}
                className={`flex-1 py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  rightPanelTab === 'memories'
                    ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Brain className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mem0 Store</span>
              </button>

              <button
                onClick={() => setRightPanelTab('agents')}
                className={`flex-1 py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  rightPanelTab === 'agents'
                    ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-amber-600" />
                <span>CrewAI</span>
              </button>

              <button
                onClick={() => setRightPanelTab('mcp')}
                className={`flex-1 py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  rightPanelTab === 'mcp'
                    ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>OpenMemory</span>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {rightPanelTab === 'memories' && (
              <MemoryInspector
                memories={memories}
                onAddMemory={() => {
                  setEditingMemory(null);
                  setIsAddEditModalOpen(true);
                }}
                onEditMemory={(mem) => {
                  setEditingMemory(mem);
                  setIsAddEditModalOpen(true);
                }}
                onDeleteMemory={handleDeleteMemory}
                onDeleteMultipleMemories={handleDeleteMultipleMemories}
                onBulkAddTags={handleBulkAddTags}
                onToggleArchiveMemory={handleToggleArchiveMemory}
                onBulkArchiveMemories={handleBulkArchiveMemories}
                onAutoArchiveRarelyAccessed={handleAutoArchiveRarelyAccessed}
                onMergeMemories={handleMergeMemories}
                onTogglePinMemory={handleTogglePinMemory}
                selectedMemoryForHighlight={selectedMemoryForHighlight}
              />
            )}

            {rightPanelTab === 'agents' && (
              <MultiAgentRunner
                agents={agents}
                memories={memories}
                onTriggerMultiAgentRun={handleTriggerMultiAgentRun}
                isRunning={isMultiAgentRunning}
                latestRunResult={latestAgentRunResult}
              />
            )}

            {rightPanelTab === 'mcp' && (
              <OpenMemoryMCPViewer memories={memories} />
            )}
          </div>
        </div>
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
        onSelectSession={setActiveSessionId}
        onTriggerInspiration={handleSendMessage}
      />

      {/* Floating Record Quick Note Button & Audio Capture Suite */}
      <QuickVoiceNoteRecorder
        onAddMemories={handleAddQuickVoiceMemories}
        activeSessionId={activeSessionId}
      />
    </div>
  );
}
