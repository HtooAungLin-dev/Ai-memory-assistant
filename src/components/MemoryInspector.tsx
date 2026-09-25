import React, { useState, useMemo } from 'react';
import {
  Brain,
  Search,
  Plus,
  Pin,
  Trash2,
  Edit3,
  Sparkles,
  Layers,
  Filter,
  CheckCircle,
  History,
  X,
  Tag,
  ArrowUpDown,
  CheckSquare,
  Square,
  AlertTriangle,
  Check,
  RefreshCw,
  GitMerge,
  ArrowRight,
  Lightbulb,
  Smile,
  Meh,
  Frown,
  Archive,
  ArchiveRestore,
  RotateCcw,
} from 'lucide-react';
import { MemoryItem, MemoryCategory, MemorySentiment } from '../types';

export interface DedupSuggestion {
  duplicateIds: string[];
  mergedContent: string;
  category: MemoryCategory;
  reason: string;
  confidence: number;
  pinned: boolean;
  sentiment?: MemorySentiment;
  tags?: string[];
}

interface MemoryInspectorProps {
  memories: MemoryItem[];
  onAddMemory: () => void;
  onEditMemory: (memory: MemoryItem) => void;
  onDeleteMemory: (id: string) => void;
  onDeleteMultipleMemories?: (ids: string[]) => void;
  onBulkAddTags?: (ids: string[], tag: string) => void;
  onToggleArchiveMemory?: (id: string) => void;
  onBulkArchiveMemories?: (ids: string[], archive: boolean) => void;
  onAutoArchiveRarelyAccessed?: (threshold?: number) => void;
  onMergeMemories?: (
    duplicateIds: string[],
    mergedEntry: {
      content: string;
      category: MemoryCategory;
      pinned?: boolean;
      confidence?: number;
      sentiment?: MemorySentiment;
      tags?: string[];
    }
  ) => void;
  onTogglePinMemory: (id: string) => void;
  selectedMemoryForHighlight?: MemoryItem | null;
}

export const MemoryInspector: React.FC<MemoryInspectorProps> = ({
  memories,
  onAddMemory,
  onEditMemory,
  onDeleteMemory,
  onDeleteMultipleMemories,
  onBulkAddTags,
  onToggleArchiveMemory,
  onBulkArchiveMemories,
  onAutoArchiveRarelyAccessed,
  onMergeMemories,
  onTogglePinMemory,
  selectedMemoryForHighlight,
}) => {
  const [storageTab, setStorageTab] = useState<'active' | 'archived'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'pinned' | 'newest' | 'confidence' | 'sentiment'>('pinned');

  // Bulk selection states
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isBulkTagModalOpen, setIsBulkTagModalOpen] = useState(false);
  const [bulkTagInput, setBulkTagInput] = useState('');

  // AI Deduplication states
  const [isDeduping, setIsDeduping] = useState(false);
  const [isDedupModalOpen, setIsDedupModalOpen] = useState(false);
  const [dedupSuggestions, setDedupSuggestions] = useState<DedupSuggestion[]>([]);
  const [editableMergedContents, setEditableMergedContents] = useState<Record<number, string>>({});
  const [dedupNotice, setDedupNotice] = useState<string | null>(null);

  const categories: { id: string; label: string; count?: number }[] = [
    { id: 'all', label: 'All Categories' },
    { id: 'identity', label: 'Identity' },
    { id: 'preference', label: 'Preferences' },
    { id: 'project', label: 'Project' },
    { id: 'constraint', label: 'Constraints' },
    { id: 'workflow', label: 'Workflows' },
    { id: 'knowledge', label: 'Knowledge' },
  ];

  const sentiments: { id: string; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Sentiments', icon: null },
    { id: 'positive', label: 'Positive', icon: <Smile className="w-3 h-3 text-emerald-600" /> },
    { id: 'neutral', label: 'Neutral', icon: <Meh className="w-3 h-3 text-neutral-500" /> },
    { id: 'negative', label: 'Negative', icon: <Frown className="w-3 h-3 text-rose-600" /> },
  ];

  // Palette of chip colors for descriptive tags
  const getTagColor = (tag: string) => {
    const palette = [
      'bg-sky-50 text-sky-700 border-sky-200/80 hover:bg-sky-100/80',
      'bg-indigo-50 text-indigo-700 border-indigo-200/80 hover:bg-indigo-100/80',
      'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/80',
      'bg-purple-50 text-purple-700 border-purple-200/80 hover:bg-purple-100/80',
      'bg-amber-50 text-amber-800 border-amber-200/80 hover:bg-amber-100/80',
      'bg-teal-50 text-teal-700 border-teal-200/80 hover:bg-teal-100/80',
      'bg-rose-50 text-rose-700 border-rose-200/80 hover:bg-rose-100/80',
      'bg-violet-50 text-violet-700 border-violet-200/80 hover:bg-violet-100/80',
      'bg-cyan-50 text-cyan-700 border-cyan-200/80 hover:bg-cyan-100/80',
    ];
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    return palette[Math.abs(hash) % palette.length];
  };

  // Active vs Archived Pool split
  const activeMemories = useMemo(() => memories.filter((m) => !m.archived), [memories]);
  const archivedMemories = useMemo(() => memories.filter((m) => !!m.archived), [memories]);

  // Rarely accessed memories in active workspace (accessCount <= 2, not pinned)
  const rarelyAccessedActiveMemories = useMemo(
    () => activeMemories.filter((m) => !m.pinned && (m.accessCount ?? 0) <= 2),
    [activeMemories]
  );

  // Pool according to storageTab
  const currentPoolMemories = useMemo(
    () => (storageTab === 'archived' ? archivedMemories : activeMemories),
    [storageTab, archivedMemories, activeMemories]
  );

  // Collect all unique tags across current pool for quick filter pill bar
  const allUniqueTags = useMemo(() => {
    const tagsSet = new Set<string>();
    currentPoolMemories.forEach((m) => {
      if (m.tags && Array.isArray(m.tags)) {
        m.tags.forEach((t) => tagsSet.add(t));
      }
    });
    return Array.from(tagsSet).slice(0, 12);
  }, [currentPoolMemories]);

  // Global filtering logic by keyword, category, sentiment, and tag on current pool
  const filteredMemories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return currentPoolMemories
      .filter((m) => {
        // Tag filter match
        if (selectedTag && (!m.tags || !m.tags.includes(selectedTag))) {
          return false;
        }

        // Category dropdown match
        const matchesCategory =
          selectedCategory === 'all' || m.category.toLowerCase() === selectedCategory.toLowerCase();
        if (!matchesCategory) return false;

        // Sentiment match
        const memSentiment = m.sentiment || 'neutral';
        const matchesSentiment =
          selectedSentiment === 'all' || memSentiment.toLowerCase() === selectedSentiment.toLowerCase();
        if (!matchesSentiment) return false;

        // Keyword search matching content, category tag, origin session, or descriptive tags
        if (!query) return true;

        const matchesContent = m.content.toLowerCase().includes(query);
        const matchesCat = m.category.toLowerCase().includes(query);
        const matchesSession = m.sessionTitle.toLowerCase().includes(query);
        const matchesSent = memSentiment.includes(query);
        const matchesTags = m.tags && m.tags.some((t) => t.toLowerCase().includes(query));

        return matchesContent || matchesCat || matchesSession || matchesSent || matchesTags;
      })
      .sort((a, b) => {
        if (sortBy === 'pinned') {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return b.confidence - a.confidence;
        }
        if (sortBy === 'confidence') {
          return b.confidence - a.confidence;
        }
        if (sortBy === 'sentiment') {
          const score = (s?: string) => (s === 'positive' ? 3 : s === 'neutral' ? 2 : 1);
          return score(b.sentiment) - score(a.sentiment);
        }
        return b.id.localeCompare(a.id);
      });
  }, [currentPoolMemories, searchQuery, selectedCategory, selectedSentiment, selectedTag, sortBy]);

  // Selected memory objects for confirmation/preview dialogs
  const selectedMemories = useMemo(() => {
    return currentPoolMemories.filter((m) => selectedIds.includes(m.id));
  }, [currentPoolMemories, selectedIds]);

  const getCategoryColor = (cat: MemoryCategory) => {
    switch (cat) {
      case 'identity':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'preference':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'project':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'constraint':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'workflow':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      default:
        return 'text-neutral-700 bg-neutral-100 border-neutral-200';
    }
  };

  const renderSentimentIcon = (sentiment?: MemorySentiment) => {
    switch (sentiment) {
      case 'positive':
        return <Smile className="w-2.5 h-2.5 text-emerald-600 shrink-0" />;
      case 'negative':
        return <Frown className="w-2.5 h-2.5 text-rose-600 shrink-0" />;
      case 'neutral':
      default:
        return <Meh className="w-2.5 h-2.5 text-neutral-500 shrink-0" />;
    }
  };

  const getSentimentBadgeStyle = (sentiment?: MemorySentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100/70';
      case 'negative':
        return 'text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100/70';
      case 'neutral':
      default:
        return 'text-neutral-600 bg-neutral-100 border-neutral-200 hover:bg-neutral-200/70';
    }
  };

  // Helper to highlight matching keyword in text
  const highlightMatches = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-amber-200 text-neutral-900 rounded-xs px-0.5 font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedSentiment('all');
    setSelectedTag(null);
  };

  // Bulk selection handlers
  const handleToggleBulkMode = () => {
    if (isBulkMode) {
      setIsBulkMode(false);
      setSelectedIds([]);
    } else {
      setIsBulkMode(true);
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    if (selectedIds.length === filteredMemories.length && filteredMemories.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMemories.map((m) => m.id));
    }
  };

  const handleConfirmDelete = () => {
    if (selectedIds.length === 0) return;

    if (onDeleteMultipleMemories) {
      onDeleteMultipleMemories(selectedIds);
    } else {
      selectedIds.forEach((id) => onDeleteMemory(id));
    }

    setSelectedIds([]);
    setIsConfirmDialogOpen(false);
    setIsBulkMode(false);
  };

  const handleConfirmBulkAddTag = (customTag?: string) => {
    const tag = (customTag || bulkTagInput).trim().replace(/^#/, '');
    if (!tag || selectedIds.length === 0) return;

    if (onBulkAddTags) {
      onBulkAddTags(selectedIds, tag);
    }

    setDedupNotice(
      `Applied tag "#${tag}" to ${selectedIds.length} ${
        selectedIds.length === 1 ? 'memory' : 'memories'
      }.`
    );
    setTimeout(() => setDedupNotice(null), 4000);

    setIsBulkTagModalOpen(false);
    setBulkTagInput('');
  };

  // AI Deduplication Handler
  const handleRunDedup = async () => {
    if (memories.length < 2) return;

    setIsDeduping(true);
    setDedupNotice(null);

    try {
      const response = await fetch('/api/dedup-memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memories }),
      });

      const data = await response.json();
      const suggestions: DedupSuggestion[] = data.suggestions || [];

      setDedupSuggestions(suggestions);

      const editableMap: Record<number, string> = {};
      suggestions.forEach((s, idx) => {
        editableMap[idx] = s.mergedContent;
      });
      setEditableMergedContents(editableMap);

      setIsDedupModalOpen(true);
    } catch (err) {
      console.error('Deduplication request failed:', err);
      setDedupNotice('Failed to run deduplication analysis. Please try again.');
      setTimeout(() => setDedupNotice(null), 4000);
    } finally {
      setIsDeduping(false);
    }
  };

  const handleApplySingleMerge = (index: number) => {
    const suggestion = dedupSuggestions[index];
    if (!suggestion || !onMergeMemories) return;

    const finalContent = editableMergedContents[index] || suggestion.mergedContent;

    onMergeMemories(suggestion.duplicateIds, {
      content: finalContent,
      category: suggestion.category,
      pinned: suggestion.pinned,
      confidence: suggestion.confidence,
      sentiment: suggestion.sentiment || 'positive',
      tags: suggestion.tags || ['Consolidated', 'Fact'],
    });

    setDedupSuggestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleApplyAllMerges = () => {
    if (!onMergeMemories) return;

    dedupSuggestions.forEach((suggestion, index) => {
      const finalContent = editableMergedContents[index] || suggestion.mergedContent;
      onMergeMemories(suggestion.duplicateIds, {
        content: finalContent,
        category: suggestion.category,
        pinned: suggestion.pinned,
        confidence: suggestion.confidence,
        sentiment: suggestion.sentiment || 'positive',
        tags: suggestion.tags || ['Consolidated', 'Fact'],
      });
    });

    setDedupSuggestions([]);
    setIsDedupModalOpen(false);
  };

  const handleDismissSuggestion = (index: number) => {
    setDedupSuggestions((prev) => prev.filter((_, i) => i !== index));
  };

  const isFilterActive =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedSentiment !== 'all' ||
    selectedTag !== null;

  const isAllFilteredSelected =
    filteredMemories.length > 0 &&
    filteredMemories.every((m) => selectedIds.includes(m.id));

  // Sentiment Counts for current active/archived pool
  const positiveCount = currentPoolMemories.filter((m) => m.sentiment === 'positive').length;
  const neutralCount = currentPoolMemories.filter((m) => !m.sentiment || m.sentiment === 'neutral').length;
  const negativeCount = currentPoolMemories.filter((m) => m.sentiment === 'negative').length;

  return (
    <div className="flex flex-col h-full bg-white select-none relative">
      {/* Top Header */}
      <div className="p-3.5 border-b border-neutral-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold text-neutral-900">Mem0 Vector Store</span>
          <span className="text-[10px] text-neutral-400 font-mono">({memories.length})</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* AI Dedup Button */}
          <button
            onClick={handleRunDedup}
            disabled={isDeduping || memories.length < 2}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900 shadow-2xs disabled:opacity-40 disabled:hover:bg-white cursor-pointer"
            title="Identify semantically redundant memory items and suggest merging them"
          >
            {isDeduping ? (
              <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            )}
            <span>{isDeduping ? 'Analyzing...' : 'Dedup'}</span>
          </button>

          {/* Bulk Selection Mode Toggle */}
          <button
            onClick={handleToggleBulkMode}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border cursor-pointer ${
              isBulkMode
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold'
                : 'border-neutral-200 bg-white text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
            title={isBulkMode ? 'Exit bulk selection mode' : 'Select multiple memories to act on'}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>{isBulkMode ? 'Cancel' : 'Select'}</span>
          </button>

          <button
            onClick={onAddMemory}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white text-[11px] font-semibold transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Fact</span>
          </button>
        </div>
      </div>

      {/* Storage List View Switcher (Active Workspace vs Archived Storage) */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50/90 px-3 pt-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setStorageTab('active');
              setSelectedIds([]);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              storageTab === 'active'
                ? 'border-indigo-600 text-indigo-950 bg-white rounded-t-md shadow-2xs'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-emerald-600" />
            <span>Active Workspace</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-neutral-200/80 text-neutral-700">
              {activeMemories.length}
            </span>
          </button>

          <button
            onClick={() => {
              setStorageTab('archived');
              setSelectedIds([]);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ml-1 ${
              storageTab === 'archived'
                ? 'border-amber-600 text-amber-950 bg-white rounded-t-md shadow-2xs'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Archive className="w-3.5 h-3.5 text-amber-600" />
            <span>Archived Storage</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold">
              {archivedMemories.length}
            </span>
          </button>
        </div>

        {/* Auto-archive cold memories recommendation */}
        {storageTab === 'active' && rarelyAccessedActiveMemories.length > 0 && (
          <div className="pb-1.5">
            <button
              onClick={() => {
                if (onAutoArchiveRarelyAccessed) {
                  onAutoArchiveRarelyAccessed(2);
                  setDedupNotice(
                    `Moved ${rarelyAccessedActiveMemories.length} rarely accessed cold memories to archived storage.`
                  );
                  setTimeout(() => setDedupNotice(null), 4000);
                }
              }}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors shadow-2xs cursor-pointer"
              title="Move non-pinned memories accessed ≤ 2 times to cold storage archive to declutter active workspace"
            >
              <Archive className="w-3 h-3 text-amber-600" />
              <span>Auto-Archive Cold ({rarelyAccessedActiveMemories.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* Dedup Notice Notification */}
      {dedupNotice && (
        <div className="bg-amber-50 border-b border-amber-200 px-3.5 py-2 text-[11px] text-amber-800 flex items-center justify-between">
          <span>{dedupNotice}</span>
          <button onClick={() => setDedupNotice(null)} className="font-bold hover:text-amber-950 cursor-pointer">✕</button>
        </div>
      )}

      {/* Bulk Selection Action Bar (appears when bulk mode is active) */}
      {isBulkMode && (
        <div className="px-3.5 py-2.5 bg-indigo-50/90 border-b border-indigo-200 flex items-center justify-between text-xs animate-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAllFiltered}
              className="flex items-center gap-1.5 font-semibold text-indigo-950 hover:text-indigo-800 cursor-pointer"
            >
              {isAllFilteredSelected ? (
                <CheckSquare className="w-4 h-4 text-indigo-600" />
              ) : (
                <Square className="w-4 h-4 text-indigo-400" />
              )}
              <span className="text-[11px]">
                {isAllFilteredSelected ? 'Deselect All' : 'Select All'}
              </span>
            </button>

            <span className="text-neutral-300">|</span>

            <span className="text-[11px] text-indigo-800 font-medium">
              <strong className="text-indigo-950 font-bold">{selectedIds.length}</strong> of{' '}
              {filteredMemories.length} selected
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {selectedIds.length > 0 && (
              <button
                onClick={() => setSelectedIds([])}
                className="text-[10px] text-neutral-500 hover:text-neutral-800 font-medium px-1.5 py-0.5 cursor-pointer"
              >
                Clear
              </button>
            )}

            {storageTab === 'active' ? (
              <>
                {/* Bulk Add Tags Button */}
                <button
                  onClick={() => {
                    setBulkTagInput('');
                    setIsBulkTagModalOpen(true);
                  }}
                  disabled={selectedIds.length === 0}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white text-[11px] font-semibold transition-colors shadow-2xs cursor-pointer"
                  title="Apply a new descriptive tag to all selected memory items simultaneously"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Add Tag ({selectedIds.length})</span>
                </button>

                {/* Bulk Archive Button */}
                <button
                  onClick={() => {
                    if (onBulkArchiveMemories && selectedIds.length > 0) {
                      onBulkArchiveMemories(selectedIds, true);
                      setDedupNotice(`Moved ${selectedIds.length} memories to archived storage.`);
                      setTimeout(() => setDedupNotice(null), 4000);
                      setSelectedIds([]);
                    }
                  }}
                  disabled={selectedIds.length === 0}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:hover:bg-amber-600 text-white text-[11px] font-semibold transition-colors shadow-2xs cursor-pointer"
                  title="Move selected memories to archived storage to declutter active workspace"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Archive ({selectedIds.length})</span>
                </button>
              </>
            ) : (
              /* Bulk Restore Button */
              <button
                onClick={() => {
                  if (onBulkArchiveMemories && selectedIds.length > 0) {
                    onBulkArchiveMemories(selectedIds, false);
                    setDedupNotice(`Restored ${selectedIds.length} memories to active workspace.`);
                    setTimeout(() => setDedupNotice(null), 4000);
                    setSelectedIds([]);
                  }
                }}
                disabled={selectedIds.length === 0}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white text-[11px] font-semibold transition-colors shadow-2xs cursor-pointer"
                title="Restore selected memories back to active workspace"
              >
                <ArchiveRestore className="w-3.5 h-3.5" />
                <span>Restore ({selectedIds.length})</span>
              </button>
            )}

            <button
              onClick={() => setIsConfirmDialogOpen(true)}
              disabled={selectedIds.length === 0}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:hover:bg-rose-600 text-white text-[11px] font-semibold transition-colors shadow-2xs cursor-pointer"
              title="Delete all selected memory items"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Overview Stats with Sentiment Breakdown */}
      <div className="grid grid-cols-4 gap-1.5 p-2.5 bg-neutral-50/70 border-b border-neutral-100 text-center text-xs">
        <div
          onClick={() => {
            setSelectedSentiment('all');
            setSelectedCategory('all');
            setSelectedTag(null);
          }}
          className="p-1.5 rounded-md bg-white border border-neutral-200/60 shadow-2xs cursor-pointer hover:border-neutral-300 transition-colors"
          title={`Total ${storageTab === 'active' ? 'active' : 'archived'} memories (Click to reset filters)`}
        >
          <div className="text-xs font-bold text-neutral-900">{currentPoolMemories.length}</div>
          <div className="text-[9px] text-neutral-400 uppercase font-medium">
            {storageTab === 'active' ? 'Active Pool' : 'Archived'}
          </div>
        </div>

        <div
          onClick={() => setSelectedSentiment(selectedSentiment === 'positive' ? 'all' : 'positive')}
          className={`p-1.5 rounded-md border shadow-2xs cursor-pointer transition-colors ${
            selectedSentiment === 'positive'
              ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-200'
              : 'bg-white border-neutral-200/60 hover:border-emerald-200'
          }`}
          title="Filter by Positive Sentiment"
        >
          <div className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-0.5">
            <Smile className="w-3 h-3 text-emerald-500" />
            <span>{positiveCount}</span>
          </div>
          <div className="text-[9px] text-neutral-400 uppercase font-medium">Positive</div>
        </div>

        <div
          onClick={() => setSelectedSentiment(selectedSentiment === 'neutral' ? 'all' : 'neutral')}
          className={`p-1.5 rounded-md border shadow-2xs cursor-pointer transition-colors ${
            selectedSentiment === 'neutral'
              ? 'bg-neutral-100 border-neutral-300 ring-1 ring-neutral-200'
              : 'bg-white border-neutral-200/60 hover:border-neutral-300'
          }`}
          title="Filter by Neutral Sentiment"
        >
          <div className="text-xs font-bold text-neutral-700 flex items-center justify-center gap-0.5">
            <Meh className="w-3 h-3 text-neutral-500" />
            <span>{neutralCount}</span>
          </div>
          <div className="text-[9px] text-neutral-400 uppercase font-medium">Neutral</div>
        </div>

        <div
          onClick={() => setSelectedSentiment(selectedSentiment === 'negative' ? 'all' : 'negative')}
          className={`p-1.5 rounded-md border shadow-2xs cursor-pointer transition-colors ${
            selectedSentiment === 'negative'
              ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-200'
              : 'bg-white border-neutral-200/60 hover:border-rose-200'
          }`}
          title="Filter by Negative Sentiment (Constraints/Restrictions)"
        >
          <div className="text-xs font-bold text-rose-600 flex items-center justify-center gap-0.5">
            <Frown className="w-3 h-3 text-rose-500" />
            <span>{negativeCount}</span>
          </div>
          <div className="text-[9px] text-neutral-400 uppercase font-medium">Negative</div>
        </div>
      </div>

      {/* Global Search Bar Section */}
      <div className="p-3 pb-2 space-y-2 border-b border-neutral-100 bg-neutral-50/30">
        {/* Global Search Input with Category & Sentiment Selectors */}
        <div className="relative flex items-center gap-1.5 bg-white border border-neutral-200 rounded-lg p-1.5 shadow-2xs focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400 transition-all">
          <Search className="w-3.5 h-3.5 text-neutral-400 ml-1 shrink-0" />
          
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Global search by keyword, tag, category..."
            className="flex-1 bg-transparent text-neutral-800 placeholder-neutral-400 outline-none text-xs min-w-0"
          />

          {/* Quick Clear Button */}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700"
              title="Clear search query"
            >
              <X className="w-3 h-3" />
            </button>
          )}

          {/* Integrated Category Dropdown */}
          <div className="relative border-l border-neutral-200 pl-1.5 pr-0.5">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-[11px] font-medium text-neutral-700 outline-none cursor-pointer pr-1"
              title="Filter by Category"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Results Summary & Sort Controls */}
        <div className="flex items-center justify-between text-[11px] px-0.5">
          <div className="flex items-center gap-1.5 text-neutral-500">
            <span>
              Showing <strong className="text-neutral-900 font-semibold">{filteredMemories.length}</strong> of{' '}
              {memories.length}
            </span>
            {isFilterActive && (
              <button
                onClick={handleClearFilters}
                className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium hover:underline ml-1"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 text-[10px] text-neutral-400">
            <ArrowUpDown className="w-3 h-3" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-neutral-600 font-medium outline-none cursor-pointer text-[10px]"
            >
              <option value="pinned">Pinned First</option>
              <option value="confidence">Confidence</option>
              <option value="sentiment">Sentiment</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        {/* Sentiment Quick Filters */}
        <div className="flex items-center gap-1 text-xs pt-0.5">
          <span className="text-[10px] text-neutral-400 uppercase font-bold shrink-0">Sentiment:</span>
          {sentiments.map((s) => {
            const isSelected = selectedSentiment === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedSentiment(s.id)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors flex items-center gap-1 ${
                  isSelected
                    ? 'bg-neutral-900 text-white font-semibold shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-900 bg-white hover:bg-neutral-100 border border-neutral-200/60'
                }`}
              >
                {s.icon}
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Category Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5 text-xs">
          {categories.map((c) => {
            const count =
              c.id === 'all'
                ? memories.length
                : memories.filter((m) => m.category === c.id).length;
            const isSelected = selectedCategory === c.id;

            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                  isSelected
                    ? 'bg-neutral-900 text-white font-semibold shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-900 bg-white hover:bg-neutral-100 border border-neutral-200/60'
                }`}
              >
                <span>{c.label}</span>
                <span
                  className={`text-[9px] font-mono px-1 rounded-full ${
                    isSelected ? 'bg-neutral-700 text-neutral-200' : 'bg-neutral-100 text-neutral-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Popular Tags Filter Chips */}
        {allUniqueTags.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1 text-xs">
            <span className="text-[10px] text-neutral-400 uppercase font-bold shrink-0 flex items-center gap-0.5">
              <Tag className="w-2.5 h-2.5" />
              <span>Tags:</span>
            </span>
            {allUniqueTags.map((t) => {
              const isSelected = selectedTag === t;
              return (
                <button
                  key={t}
                  onClick={() => setSelectedTag(isSelected ? null : t)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-2xs'
                      : `${getTagColor(t)}`
                  }`}
                >
                  #{t}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Tag Filter Banner */}
      {selectedTag && (
        <div className="flex items-center justify-between px-3.5 py-1.5 bg-indigo-50/80 border-b border-indigo-100 text-xs text-indigo-900 animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 font-medium">
            <Tag className="w-3 h-3 text-indigo-600" />
            <span>Filtering by tag:</span>
            <span className="font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded text-[10px]">
              #{selectedTag}
            </span>
          </div>
          <button
            onClick={() => setSelectedTag(null)}
            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-900 hover:underline"
          >
            Clear Tag Filter
          </button>
        </div>
      )}

      {/* Memory Shards List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {/* Cold Storage Information Banner (shown in Archived tab) */}
        {storageTab === 'archived' && (
          <div className="mb-2 p-2.5 bg-amber-50/90 border border-amber-200/90 rounded-lg text-xs text-amber-900 flex items-start gap-2 shadow-2xs">
            <Archive className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-bold text-[11px] flex items-center justify-between">
                <span>Cold Vector Storage</span>
                <span className="text-[10px] font-normal text-amber-700">
                  {archivedMemories.length} {archivedMemories.length === 1 ? 'archived item' : 'archived items'}
                </span>
              </div>
              <p className="text-[10px] text-amber-800 leading-relaxed mt-0.5">
                Rarely accessed or retired facts are preserved here to declutter your active workspace. They can be restored back to active recall at any time.
              </p>
            </div>
          </div>
        )}

        {filteredMemories.length === 0 ? (
          <div className="p-8 text-center text-neutral-400 text-xs space-y-2">
            {storageTab === 'archived' ? (
              <>
                <Archive className="w-8 h-8 text-neutral-300 mx-auto" />
                <p className="font-semibold text-neutral-700">Archived storage is empty</p>
                <p className="text-[11px] text-neutral-500">
                  No memories are currently archived. Rarely accessed items can be moved here to keep your active workspace decluttered.
                </p>
              </>
            ) : (
              <>
                <Search className="w-8 h-8 text-neutral-300 mx-auto" />
                <p className="font-semibold text-neutral-700">No matching memories found</p>
                <p className="text-[11px] text-neutral-500">
                  No memory items match your current search, tag, category, or sentiment filter.
                </p>
                {isFilterActive && (
                  <button
                    onClick={handleClearFilters}
                    className="mt-2 px-3 py-1.5 rounded-md bg-neutral-900 text-white text-xs font-medium hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    Reset Search & Filters
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          filteredMemories.map((mem) => {
            const isHighlighted = selectedMemoryForHighlight?.id === mem.id;
            const isSelected = selectedIds.includes(mem.id);
            const sentiment = mem.sentiment || 'neutral';

            return (
              <div
                key={mem.id}
                onClick={() => {
                  if (isBulkMode) {
                    handleToggleSelectOne(mem.id);
                  }
                }}
                className={`group p-3 rounded-lg border text-xs transition-all relative ${
                  isBulkMode ? 'cursor-pointer' : ''
                } ${
                  isSelected
                    ? 'border-indigo-400 bg-indigo-50/60 ring-2 ring-indigo-400 shadow-xs'
                    : isHighlighted
                    ? 'border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-200 shadow-xs'
                    : mem.archived
                    ? 'border-amber-200/80 bg-amber-50/30 hover:border-amber-300 hover:shadow-2xs'
                    : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:shadow-2xs'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {/* Bulk Selection Checkbox */}
                  {isBulkMode && (
                    <div className="pt-0.5 shrink-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleToggleSelectOne(mem.id);
                        }}
                        className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    {/* Memory Top Metadata */}
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Category Tag */}
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCategory(mem.category);
                          }}
                          className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border cursor-pointer hover:opacity-80 transition-opacity ${getCategoryColor(
                            mem.category
                          )}`}
                          title={`Filter by category: ${mem.category}`}
                        >
                          {mem.category}
                        </span>

                        {/* Sentiment Indicator Badge */}
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSentiment(selectedSentiment === sentiment ? 'all' : sentiment);
                          }}
                          className={`inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded border cursor-pointer transition-colors ${getSentimentBadgeStyle(
                            sentiment
                          )}`}
                          title={`Sentiment: ${sentiment} (Click to filter)`}
                        >
                          {renderSentimentIcon(sentiment)}
                          <span className="capitalize">{sentiment}</span>
                        </span>

                        {/* Pinned Indicator */}
                        {mem.pinned && !mem.archived && (
                          <span className="flex items-center gap-0.5 text-[9px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-semibold border border-indigo-200">
                            <Pin className="w-2.5 h-2.5" />
                            <span>Pinned</span>
                          </span>
                        )}

                        {/* Archived Badge */}
                        {mem.archived && (
                          <span className="flex items-center gap-0.5 text-[9px] text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded font-semibold border border-amber-300">
                            <Archive className="w-2.5 h-2.5 text-amber-700" />
                            <span>Archived</span>
                          </span>
                        )}
                      </div>

                      {/* Actions (visible when not in bulk mode) */}
                      {!isBulkMode && (
                        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          {mem.archived ? (
                            /* Unarchive / Restore button */
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onToggleArchiveMemory) {
                                  onToggleArchiveMemory(mem.id);
                                  setDedupNotice(`Restored memory to active workspace.`);
                                  setTimeout(() => setDedupNotice(null), 3500);
                                }
                              }}
                              className="p-1 rounded hover:bg-emerald-100 text-emerald-600 hover:text-emerald-800 transition-colors cursor-pointer"
                              title="Restore to active workspace"
                            >
                              <ArchiveRestore className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onTogglePinMemory(mem.id);
                                }}
                                className={`p-1 rounded hover:bg-neutral-100 transition-colors cursor-pointer ${
                                  mem.pinned ? 'text-indigo-600' : 'text-neutral-400'
                                }`}
                                title={mem.pinned ? 'Unpin from core memory' : 'Pin to core memory priority'}
                              >
                                <Pin className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditMemory(mem);
                                }}
                                className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                                title="Edit memory shard"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              {/* Archive Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onToggleArchiveMemory) {
                                    onToggleArchiveMemory(mem.id);
                                    setDedupNotice(`Moved memory to archived storage.`);
                                    setTimeout(() => setDedupNotice(null), 3500);
                                  }
                                }}
                                className="p-1 rounded hover:bg-amber-100 text-neutral-400 hover:text-amber-700 transition-colors cursor-pointer"
                                title="Move to Archived Storage (declutter active workspace)"
                              >
                                <Archive className="w-3 h-3" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteMemory(mem.id);
                            }}
                            className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete memory shard"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Memory Content with Keyword Highlighting */}
                    <p className="text-neutral-900 font-medium leading-relaxed mb-2">
                      {highlightMatches(mem.content, searchQuery)}
                    </p>

                    {/* Descriptive Tags as Colored Chips */}
                    {mem.tags && mem.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 mb-2">
                        {mem.tags.map((tag, tIdx) => {
                          const isTagSelected = selectedTag === tag;
                          return (
                            <span
                              key={tIdx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTag(isTagSelected ? null : tag);
                              }}
                              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium border cursor-pointer transition-all ${
                                isTagSelected
                                  ? 'ring-2 ring-indigo-400 font-bold shadow-2xs'
                                  : ''
                              } ${getTagColor(tag)}`}
                              title={`Tag: #${tag} (Click to filter)`}
                            >
                              <Tag className="w-2.5 h-2.5 opacity-60" />
                              <span>{highlightMatches(tag, searchQuery)}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Origin Session, Access Hits & Confidence Footnote */}
                    <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1.5 border-t border-neutral-100 font-normal">
                      <div
                        className="flex items-center gap-1 truncate max-w-[170px]"
                        title={mem.sessionTitle}
                      >
                        <History className="w-3 h-3 text-neutral-400 shrink-0" />
                        <span className="truncate">{highlightMatches(mem.sessionTitle, searchQuery)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {mem.archived ? (
                          <span className="flex items-center gap-0.5 text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-medium border border-amber-200">
                            <Archive className="w-2.5 h-2.5 text-amber-600" />
                            <span>Cold Storage</span>
                          </span>
                        ) : (
                          <span className="text-neutral-400 font-mono" title="Access count">
                            {mem.accessCount || 0} hits
                          </span>
                        )}

                        <span className="font-mono text-neutral-500">
                          {(mem.confidence * 100).toFixed(0)}% conf
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Dialog for Bulk Deletion */}
      {isConfirmDialogOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Confirm Bulk Deletion</span>
              </div>
              <button
                onClick={() => setIsConfirmDialogOpen(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-3 text-xs">
              <p className="text-neutral-800 leading-relaxed font-medium">
                Are you sure you want to permanently delete{' '}
                <strong className="text-rose-600 font-bold">
                  {selectedIds.length} {selectedIds.length === 1 ? 'memory' : 'memories'}
                </strong>{' '}
                from your Mem0 vector store?
              </p>

              {/* Preview of items to delete */}
              <div className="max-h-40 overflow-y-auto bg-neutral-50 p-2.5 rounded-lg border border-neutral-200/80 space-y-1.5">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                  Selected Items ({selectedMemories.length}):
                </span>
                {selectedMemories.map((m) => (
                  <div key={m.id} className="flex items-start gap-1.5 text-[11px] text-neutral-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1 shrink-0" />
                    <span className="truncate leading-tight">
                      [{m.category.toUpperCase()}] {m.content}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-[10px] text-neutral-500 leading-normal bg-amber-50 border border-amber-200/70 p-2 rounded-md text-amber-900">
                ⚠️ <strong>Note:</strong> Future conversations and agents will no longer recall these facts across sessions.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsConfirmDialogOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete {selectedIds.length} {selectedIds.length === 1 ? 'Item' : 'Items'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Add Tags Modal */}
      {isBulkTagModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-neutral-900">
                    Bulk Add Topic Tag
                  </h3>
                  <p className="text-[10px] text-neutral-500">
                    Apply a topic tag to {selectedIds.length} selected memory {selectedIds.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBulkTagModalOpen(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleConfirmBulkAddTag();
              }}
              className="p-4 space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Tag Name
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-2.5 text-neutral-400 font-bold text-xs select-none">
                    #
                  </span>
                  <input
                    type="text"
                    autoFocus
                    value={bulkTagInput}
                    onChange={(e) => setBulkTagInput(e.target.value)}
                    placeholder="e.g. Architecture, Production, Core Stack..."
                    className="w-full pl-6 pr-3 py-2 rounded-lg border border-neutral-200 outline-none text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 font-medium"
                  />
                </div>
              </div>

              {/* Suggestions from existing tags */}
              {allUniqueTags.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Or select an existing tag:
                  </span>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                    {allUniqueTags.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setBulkTagInput(t)}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-all ${
                          bulkTagInput.toLowerCase() === t.toLowerCase()
                            ? 'bg-indigo-600 text-white border-indigo-600 font-bold ring-1 ring-indigo-300'
                            : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                        }`}
                      >
                        #{t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected memories preview */}
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                  Target Memories ({selectedMemories.length}):
                </span>
                <div className="max-h-32 overflow-y-auto bg-neutral-50 p-2.5 rounded-lg border border-neutral-200/80 space-y-1.5">
                  {selectedMemories.map((m) => (
                    <div key={m.id} className="flex items-start gap-1.5 text-[11px] text-neutral-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 shrink-0" />
                      <div className="truncate flex-1">
                        <span className="font-semibold text-neutral-900 mr-1">
                          [{m.category.toUpperCase()}]
                        </span>
                        <span>{m.content}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsBulkTagModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!bulkTagInput.trim()}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Apply Tag to {selectedIds.length} Items</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Memory Deduplication & Merge Dialog */}
      {isDedupModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-indigo-100 text-indigo-700">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-neutral-900">
                    AI Memory Deduplication & Merge
                  </h3>
                  <p className="text-[10px] text-neutral-500">
                    Identifies semantic overlaps and consolidates them into clean comprehensive entries
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsDedupModalOpen(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {dedupSuggestions.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
                  <h4 className="font-bold text-xs text-neutral-800">
                    No Semantic Redundancies Detected!
                  </h4>
                  <p className="text-[11px] text-neutral-500 max-w-sm mx-auto leading-relaxed">
                    Your Mem0 vector store is already streamlined. All {memories.length} stored facts are distinct, non-overlapping propositions.
                  </p>
                  <button
                    onClick={() => setIsDedupModalOpen(false)}
                    className="mt-3 px-4 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs text-neutral-600 bg-indigo-50/70 p-2.5 rounded-lg border border-indigo-100">
                    <div className="flex items-center gap-1.5 text-indigo-900 font-semibold text-[11px]">
                      <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
                      <span>
                        Found {dedupSuggestions.length} {dedupSuggestions.length === 1 ? 'merge suggestion' : 'merge suggestions'} across your memories
                      </span>
                    </div>

                    <button
                      onClick={handleApplyAllMerges}
                      className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold transition-colors shadow-2xs"
                    >
                      Merge All ({dedupSuggestions.length})
                    </button>
                  </div>

                  {/* Suggestion Cards */}
                  <div className="space-y-3">
                    {dedupSuggestions.map((suggestion, idx) => {
                      const duplicateMemories = memories.filter((m) =>
                        suggestion.duplicateIds.includes(m.id)
                      );
                      const suggestionSentiment = suggestion.sentiment || 'positive';

                      return (
                        <div
                          key={idx}
                          className="border border-neutral-200 rounded-xl p-3.5 bg-white space-y-3 shadow-2xs hover:border-neutral-300 transition-all"
                        >
                          {/* Suggestion Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                Merge {suggestion.duplicateIds.length} Items
                              </span>
                              <span
                                className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${getCategoryColor(
                                  suggestion.category
                                )}`}
                              >
                                {suggestion.category}
                              </span>

                              {/* Sentiment badge in suggestion */}
                              <span
                                className={`inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded border ${getSentimentBadgeStyle(
                                  suggestionSentiment
                                )}`}
                              >
                                {renderSentimentIcon(suggestionSentiment)}
                                <span className="capitalize">{suggestionSentiment}</span>
                              </span>
                            </div>

                            <span className="text-[10px] font-mono text-neutral-400">
                              {(suggestion.confidence * 100).toFixed(0)}% AI confidence
                            </span>
                          </div>

                          {/* Reason */}
                          <p className="text-[11px] text-neutral-600 italic bg-neutral-50 p-2 rounded-md border border-neutral-100">
                            💡 <strong>Why:</strong> {suggestion.reason}
                          </p>

                          {/* Original Redundant Items */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                              Original Redundant Facts:
                            </span>
                            <div className="space-y-1 bg-neutral-50/70 p-2 rounded-lg border border-neutral-200/60 max-h-32 overflow-y-auto">
                              {duplicateMemories.map((m) => (
                                <div
                                  key={m.id}
                                  className="text-[11px] text-neutral-700 flex items-start gap-1.5"
                                >
                                  <span className="text-neutral-400 shrink-0">•</span>
                                  <div className="flex-1 truncate">
                                    <span className="font-medium text-neutral-800">"{m.content}"</span>
                                    <span className="text-[9px] text-neutral-400 ml-1.5">
                                      ({m.sessionTitle})
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Arrow Divider */}
                          <div className="flex items-center justify-center">
                            <div className="h-px bg-neutral-200 flex-1" />
                            <div className="mx-2 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold flex items-center gap-1">
                              <GitMerge className="w-3 h-3" />
                              <span>Proposed Consolidated Memory</span>
                            </div>
                            <div className="h-px bg-neutral-200 flex-1" />
                          </div>

                          {/* Proposed Merged Content (Editable) */}
                          <div>
                            <textarea
                              value={editableMergedContents[idx] ?? suggestion.mergedContent}
                              onChange={(e) =>
                                setEditableMergedContents((prev) => ({
                                  ...prev,
                                  [idx]: e.target.value,
                                }))
                              }
                              rows={2}
                              className="w-full text-xs text-neutral-900 font-medium p-2.5 rounded-lg border border-indigo-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300 outline-none bg-indigo-50/30 leading-relaxed"
                              placeholder="Consolidated comprehensive memory content..."
                            />
                            
                            {/* Suggested Tags Chips */}
                            {suggestion.tags && suggestion.tags.length > 0 && (
                              <div className="flex items-center gap-1 flex-wrap mt-1.5">
                                <span className="text-[10px] text-neutral-400 font-medium">Tags:</span>
                                {suggestion.tags.map((st, sIdx) => (
                                  <span
                                    key={sIdx}
                                    className={`px-1.5 py-0.5 rounded text-[10px] border ${getTagColor(st)}`}
                                  >
                                    #{st}
                                  </span>
                                ))}
                              </div>
                            )}

                            <p className="text-[10px] text-neutral-400 mt-1">
                              You can fine-tune the merged statement before applying.
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                            <button
                              type="button"
                              onClick={() => handleDismissSuggestion(idx)}
                              className="px-2.5 py-1 text-[11px] text-neutral-500 hover:text-neutral-800 font-medium"
                            >
                              Dismiss
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApplySingleMerge(idx)}
                              className="flex items-center gap-1 px-3 py-1 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white text-[11px] font-semibold transition-colors shadow-2xs"
                            >
                              <GitMerge className="w-3 h-3" />
                              <span>Merge & Replace</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-neutral-100 bg-neutral-50/50 flex items-center justify-between text-xs shrink-0">
              <span className="text-[10px] text-neutral-400">
                Mem0 + OpenMemory Deduplication Protocol
              </span>
              <button
                type="button"
                onClick={() => setIsDedupModalOpen(false)}
                className="px-3 py-1 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
