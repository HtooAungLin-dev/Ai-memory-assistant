import React, { useState, useEffect } from 'react';
import { X, Brain, Sparkles, Pin, Tag, Plus, CheckCircle, ShieldCheck, HelpCircle } from 'lucide-react';
import { MemoryItem, MemoryCategory, MemorySentiment, ContextScope, VerificationStatus, Session } from '../types';

interface AddEditMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memory: Omit<MemoryItem, 'id' | 'timestamp'> & { id?: string }) => void;
  editingMemory?: MemoryItem | null;
  sessions: Session[];
  activeSessionId: string;
}

export const AddEditMemoryModal: React.FC<AddEditMemoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMemory,
  sessions,
  activeSessionId,
}) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<MemoryCategory>('preference');
  const [scope, setScope] = useState<ContextScope>('global');
  const [decisionRationale, setDecisionRationale] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('verified');
  const [confidence, setConfidence] = useState(0.95);
  const [pinned, setPinned] = useState(false);
  const [userCurated, setUserCurated] = useState(true);
  const [sessionId, setSessionId] = useState(activeSessionId);
  const [sentiment, setSentiment] = useState<MemorySentiment>('neutral');
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [applicableTools, setApplicableTools] = useState<string[]>(['Claude Code', 'Cursor', 'OpenMemory MCP']);

  useEffect(() => {
    if (editingMemory) {
      setContent(editingMemory.content);
      setCategory(editingMemory.category);
      setScope(editingMemory.scope || 'global');
      setDecisionRationale(editingMemory.decisionRationale || '');
      setVerificationStatus(editingMemory.verification?.status || 'verified');
      setConfidence(editingMemory.confidence);
      setPinned(editingMemory.pinned || false);
      setUserCurated(editingMemory.userCurated !== false);
      setSessionId(editingMemory.sessionId);
      setSentiment(editingMemory.sentiment || 'neutral');
      setTags(editingMemory.tags || []);
      setApplicableTools(editingMemory.applicableTools || ['Claude Code', 'Cursor', 'OpenMemory MCP']);
    } else {
      setContent('');
      setCategory('preference');
      setScope('global');
      setDecisionRationale('');
      setVerificationStatus('verified');
      setConfidence(0.95);
      setPinned(false);
      setUserCurated(true);
      setSessionId(activeSessionId);
      setSentiment('positive');
      setTags(['Preferences', 'Context']);
      setApplicableTools(['Claude Code', 'Cursor', 'OpenMemory MCP']);
    }
  }, [editingMemory, activeSessionId, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e && 'key' in e && e.key !== 'Enter') return;
    e?.preventDefault();
    const trimmed = newTagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const matchedSession = sessions.find((s) => s.id === sessionId);

    onSave({
      ...(editingMemory ? { id: editingMemory.id } : {}),
      content: content.trim(),
      category,
      scope,
      decisionRationale: decisionRationale.trim() || undefined,
      confidence,
      pinned,
      userCurated,
      sessionId,
      sessionTitle: matchedSession?.title || 'Session Context',
      sentiment,
      tags,
      verification: {
        status: verificationStatus,
        lastChecked: 'Just now',
        sourceType: userCurated ? 'user_curated' : 'ai_extracted',
        evidence: userCurated
          ? 'Explicitly curated and confirmed by user.'
          : 'Extracted automatically from conversation proposition.',
      },
      applicableTools,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between shrink-0 bg-neutral-50/70">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                <span>{editingMemory ? 'Edit Context Item' : 'Add ClariLayer Context Item'}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 font-mono">
                  Durable Context
                </span>
              </h3>
              <p className="text-[10px] text-neutral-500">
                Curate personal preferences, decisions, data definitions, and rules with full attribution
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs overflow-y-auto flex-1">
          <div>
            <label className="block font-semibold text-neutral-700 mb-1">
              Context Statement / Decision / Definition
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="e.g. Decision: Adopted PostgreSQL for relational integrity; Definition: Active user is someone active in last 14 days."
              rows={3}
              required
              className="w-full p-2.5 rounded-lg border border-neutral-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 leading-relaxed font-medium"
            />
          </div>

          {/* Decision Rationale */}
          {(category === 'decision' || category === 'rule' || category === 'preference' || category === 'lesson') && (
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-lg p-2.5 space-y-1">
              <label className="block text-[11px] font-bold text-amber-900">
                Decision Rationale & Context (ClariLayer Principle)
              </label>
              <textarea
                value={decisionRationale}
                onChange={(e) => setDecisionRationale(e.target.value)}
                placeholder="Explain WHY this decision was made or why this preference holds (e.g. 'Prevents duplicate billing when webhook retries fail')."
                rows={2}
                className="w-full p-2 rounded-md border border-amber-200 bg-white text-xs outline-none focus:border-amber-400"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MemoryCategory)}
                className="w-full p-2 rounded-lg border border-neutral-200 outline-none bg-white font-medium"
              >
                <option value="preference">Preference (Personal/Team)</option>
                <option value="decision">Decision (Arch / Tech)</option>
                <option value="definition">Definition (Metric / Data)</option>
                <option value="rule">Rule (Team Policy)</option>
                <option value="lesson">Lesson Learned</option>
                <option value="constraint">System Constraint</option>
                <option value="identity">User Identity</option>
                <option value="project">Project Context</option>
                <option value="workflow">Workflow</option>
                <option value="knowledge">Knowledge Base</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Context Scope (ClariLayer Guardrail)
              </label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as ContextScope)}
                className="w-full p-2 rounded-lg border border-neutral-200 outline-none bg-white font-medium"
              >
                <option value="global">Global (Applies Across All Projects)</option>
                <option value="project">Project-Specific (Current App)</option>
                <option value="task-scoped">Task-Scoped (Temporary Scratchpad)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Origin Session
              </label>
              <select
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                className="w-full p-2 rounded-lg border border-neutral-200 outline-none bg-white"
              >
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Reconciliation / Audit Status
              </label>
              <select
                value={verificationStatus}
                onChange={(e) => setVerificationStatus(e.target.value as VerificationStatus)}
                className="w-full p-2 rounded-lg border border-neutral-200 outline-none bg-white"
              >
                <option value="verified">Verified (Consistent & Grounded)</option>
                <option value="caveat">Caveat (Flagged with Note)</option>
                <option value="drifted">Drifted (May Need Update)</option>
                <option value="unverified">Unverified (Pending Audit)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 mb-1">
              Sentiment Polarity
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSentiment('positive')}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                  sentiment === 'positive'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-2 ring-emerald-200'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <span>😊</span>
                <span>Positive</span>
              </button>
              <button
                type="button"
                onClick={() => setSentiment('neutral')}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                  sentiment === 'neutral'
                    ? 'bg-neutral-100 border-neutral-300 text-neutral-800 ring-2 ring-neutral-200'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <span>😐</span>
                <span>Neutral</span>
              </button>
              <button
                type="button"
                onClick={() => setSentiment('negative')}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                  sentiment === 'negative'
                    ? 'bg-rose-50 border-rose-300 text-rose-800 ring-2 ring-rose-200'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <span>⚠️</span>
                <span>Negative</span>
              </button>
            </div>
          </div>

          {/* Descriptive Tags */}
          <div>
            <label className="block font-semibold text-neutral-700 mb-1">
              Descriptive Topic Tags
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((t, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-neutral-100 text-neutral-800 border border-neutral-200"
                >
                  <Tag className="w-3 h-3 text-neutral-400" />
                  <span>{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-600 ml-0.5 text-neutral-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-1.5">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add topic tag (e.g. 'Decision', 'PostgreSQL')..."
                className="flex-1 p-2 rounded-lg border border-neutral-200 outline-none text-xs focus:border-indigo-400"
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={!newTagInput.trim()}
                className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 text-neutral-700 text-xs font-semibold flex items-center gap-1 border border-neutral-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="userCurated"
                checked={userCurated}
                onChange={(e) => setUserCurated(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="userCurated" className="text-neutral-700 font-medium cursor-pointer">
                User-Curated (High Trust Anchor)
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="pinned"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="pinned" className="text-neutral-700 font-medium cursor-pointer">
                Pin as Invariant
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-semibold transition-colors"
            >
              {editingMemory ? 'Update Context Item' : 'Save to Context Layer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
