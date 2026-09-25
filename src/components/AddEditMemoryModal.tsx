import React, { useState, useEffect } from 'react';
import { X, Brain, Sparkles, Pin, Tag, Plus } from 'lucide-react';
import { MemoryItem, MemoryCategory, MemorySentiment, Session } from '../types';

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
  const [confidence, setConfidence] = useState(0.95);
  const [pinned, setPinned] = useState(false);
  const [sessionId, setSessionId] = useState(activeSessionId);
  const [sentiment, setSentiment] = useState<MemorySentiment>('neutral');
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');

  useEffect(() => {
    if (editingMemory) {
      setContent(editingMemory.content);
      setCategory(editingMemory.category);
      setConfidence(editingMemory.confidence);
      setPinned(editingMemory.pinned || false);
      setSessionId(editingMemory.sessionId);
      setSentiment(editingMemory.sentiment || 'neutral');
      setTags(editingMemory.tags || []);
    } else {
      setContent('');
      setCategory('preference');
      setConfidence(0.95);
      setPinned(false);
      setSessionId(activeSessionId);
      setSentiment('positive');
      setTags(['Preferences', 'Context']);
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
      confidence,
      pinned,
      sessionId,
      sessionTitle: matchedSession?.title || 'Session Context',
      sentiment,
      tags,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-neutral-900">
                {editingMemory ? 'Edit Long-Term Memory' : 'Add Long-Term Memory Fact'}
              </h3>
              <p className="text-[10px] text-neutral-500">
                Directly modify propositions stored in Mem0 vector graph
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
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-neutral-700 mb-1">
              Memory Proposition / Fact
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="e.g. User prefers React 19, TypeScript, and dark-themed developer tools."
              rows={3}
              required
              className="w-full p-2.5 rounded-lg border border-neutral-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MemoryCategory)}
                className="w-full p-2 rounded-lg border border-neutral-200 outline-none bg-white"
              >
                <option value="identity">Identity</option>
                <option value="preference">Preference</option>
                <option value="project">Project Context</option>
                <option value="constraint">Constraint</option>
                <option value="workflow">Workflow</option>
                <option value="knowledge">Knowledge</option>
              </select>
            </div>

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
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 mb-1">
              Sentiment Analysis
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
                placeholder="Add topic tag (e.g. 'TypeScript', 'Frontend')..."
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

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-neutral-700">
                Confidence Score
              </label>
              <span className="font-mono text-neutral-500">{(confidence * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.0"
              step="0.01"
              value={confidence}
              onChange={(e) => setConfidence(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="pinned"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="pinned" className="text-neutral-700 font-medium cursor-pointer">
              Pin as Core Priority Memory (Always loaded first)
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
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
              {editingMemory ? 'Update Memory' : 'Save to Mem0'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
