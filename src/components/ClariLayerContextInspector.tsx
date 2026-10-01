import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  GitBranch,
  BookOpen,
  Tag,
  ArrowRight,
  HelpCircle,
  Clock,
  Sparkles,
  Info,
  Database,
  ExternalLink,
  Code,
  FileCheck,
} from 'lucide-react';
import { MemoryItem, VerificationStatus, ContextScope } from '../types';
import { Button, Badge, Card, CardHeader, CardTitle, CardContent } from './ui/shadcn';

interface ClariLayerContextInspectorProps {
  memories: MemoryItem[];
  onAddContext: () => void;
  onEditMemory: (memory: MemoryItem) => void;
  onReconcileAll?: () => void;
  isReconciling?: boolean;
}

export const ClariLayerContextInspector: React.FC<ClariLayerContextInspectorProps> = ({
  memories,
  onAddContext,
  onEditMemory,
  onReconcileAll,
  isReconciling = false,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'decisions' | 'definitions' | 'rules' | 'lessons' | 'caveats'>('all');
  const [selectedScope, setSelectedScope] = useState<'all' | ContextScope>('all');
  const [reconcileFilter, setReconcileFilter] = useState<'all' | VerificationStatus>('all');

  // Filter items
  const filteredItems = memories.filter((m) => {
    // Category match
    if (activeFilter === 'decisions' && m.category !== 'decision') return false;
    if (activeFilter === 'definitions' && m.category !== 'definition') return false;
    if (activeFilter === 'rules' && m.category !== 'rule') return false;
    if (activeFilter === 'lessons' && m.category !== 'lesson') return false;
    if (activeFilter === 'caveats' && m.verification?.status !== 'caveat' && m.verification?.status !== 'drifted') return false;

    // Scope match
    if (selectedScope !== 'all' && (m.scope || 'global') !== selectedScope) return false;

    // Status match
    if (reconcileFilter !== 'all' && (m.verification?.status || 'unverified') !== reconcileFilter) return false;

    return true;
  });

  // Metric counts
  const verifiedCount = memories.filter((m) => m.verification?.status === 'verified').length;
  const caveatCount = memories.filter((m) => m.verification?.status === 'caveat').length;
  const driftedCount = memories.filter((m) => m.verification?.status === 'drifted').length;
  const curatedCount = memories.filter((m) => m.userCurated !== false).length;

  const getStatusBadge = (status?: VerificationStatus) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>Verified Grounded</span>
          </span>
        );
      case 'caveat':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Caveat Discrepancy</span>
          </span>
        );
      case 'drifted':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-300">
            <Clock className="w-3 h-3 text-rose-600" />
            <span>Drifted / Superseded</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full border border-neutral-200">
            <HelpCircle className="w-3 h-3 text-neutral-400" />
            <span>Pending Audit</span>
          </span>
        );
    }
  };

  const getScopeBadge = (scope?: ContextScope) => {
    switch (scope) {
      case 'global':
        return (
          <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
            Global Invariant
          </span>
        );
      case 'project':
        return (
          <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
            Project Scoped
          </span>
        );
      case 'task-scoped':
        return (
          <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
            Task Scratchpad
          </span>
        );
      default:
        return (
          <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200">
            Global
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-white select-none relative overflow-hidden">
      {/* ClariLayer Header Banner */}
      <div className="p-3.5 border-b border-neutral-200/80 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-400/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>Personal Context Layer</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-400/20 text-emerald-300 text-[9px] font-mono border border-emerald-400/30">
                  Audit Grounded
                </span>
              </span>
            </div>
            <p className="text-[10px] text-neutral-300 font-normal">
              Durable preferences, past decisions, data definitions, and live reconciliation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onReconcileAll && (
            <Button
              onClick={onReconcileAll}
              disabled={isReconciling}
              variant="outline"
              size="sm"
              className="bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-100 hover:text-white"
              title="Audit and reconcile saved definitions against live evidence"
            >
              <RefreshCw className={`w-3 h-3 text-indigo-400 ${isReconciling ? 'animate-spin' : ''}`} />
              <span>{isReconciling ? 'Auditing...' : 'Reconcile Live'}</span>
            </Button>
          )}

          <Button
            onClick={onAddContext}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            <span>+ Curate</span>
          </Button>
        </div>
      </div>

      {/* Trust & Audit Statistics Dashboard */}
      <div className="grid grid-cols-4 gap-2 p-2.5 bg-neutral-50/90 border-b border-neutral-200/80 text-xs shrink-0">
        <div className="p-2 rounded-lg bg-white border border-neutral-200/80 shadow-2xs">
          <div className="text-[10px] text-neutral-500 font-medium">User Curated</div>
          <div className="text-sm font-bold text-neutral-900 mt-0.5 flex items-center justify-between">
            <span>{curatedCount}</span>
            <FileCheck className="w-3.5 h-3.5 text-blue-500" />
          </div>
        </div>

        <div className="p-2 rounded-lg bg-white border border-neutral-200/80 shadow-2xs">
          <div className="text-[10px] text-neutral-500 font-medium">Verified Grounded</div>
          <div className="text-sm font-bold text-emerald-700 mt-0.5 flex items-center justify-between">
            <span>{verifiedCount}</span>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
          </div>
        </div>

        <div className="p-2 rounded-lg bg-white border border-neutral-200/80 shadow-2xs">
          <div className="text-[10px] text-neutral-500 font-medium">Caveats / Alerts</div>
          <div className="text-sm font-bold text-amber-700 mt-0.5 flex items-center justify-between">
            <span>{caveatCount}</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          </div>
        </div>

        <div className="p-2 rounded-lg bg-white border border-neutral-200/80 shadow-2xs">
          <div className="text-[10px] text-neutral-500 font-medium">Drifted Shards</div>
          <div className="text-sm font-bold text-rose-700 mt-0.5 flex items-center justify-between">
            <span>{driftedCount}</span>
            <Clock className="w-3.5 h-3.5 text-rose-500" />
          </div>
        </div>
      </div>

      {/* ClariLayer Category Tabs */}
      <div className="flex items-center gap-1 px-3 pt-2.5 pb-1 border-b border-neutral-200/80 bg-white overflow-x-auto no-scrollbar shrink-0 text-xs">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap ${
            activeFilter === 'all'
              ? 'bg-neutral-900 text-white shadow-2xs'
              : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          All Context ({memories.length})
        </button>

        <button
          onClick={() => setActiveFilter('decisions')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap flex items-center gap-1 ${
            activeFilter === 'decisions'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <GitBranch className="w-3 h-3" />
          <span>Decisions ({memories.filter((m) => m.category === 'decision').length})</span>
        </button>

        <button
          onClick={() => setActiveFilter('definitions')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap flex items-center gap-1 ${
            activeFilter === 'definitions'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <BookOpen className="w-3 h-3" />
          <span>Definitions ({memories.filter((m) => m.category === 'definition').length})</span>
        </button>

        <button
          onClick={() => setActiveFilter('rules')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap flex items-center gap-1 ${
            activeFilter === 'rules'
              ? 'bg-rose-600 text-white shadow-2xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <span>Rules ({memories.filter((m) => m.category === 'rule').length})</span>
        </button>

        <button
          onClick={() => setActiveFilter('lessons')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap flex items-center gap-1 ${
            activeFilter === 'lessons'
              ? 'bg-amber-600 text-white shadow-2xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <span>Lessons ({memories.filter((m) => m.category === 'lesson').length})</span>
        </button>

        {caveatCount > 0 && (
          <button
            onClick={() => setActiveFilter('caveats')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap flex items-center gap-1 ${
              activeFilter === 'caveats'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Caveats ({caveatCount})</span>
          </button>
        )}
      </div>

      {/* Scope & Tool Alignment Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-50/70 border-b border-neutral-100 text-[10px] text-neutral-500 shrink-0">
        <div className="flex items-center gap-2">
          <span>Scope:</span>
          {(['all', 'global', 'project', 'task-scoped'] as const).map((sc) => (
            <button
              key={sc}
              onClick={() => setSelectedScope(sc)}
              className={`px-1.5 py-0.5 rounded capitalize ${
                selectedScope === sc
                  ? 'bg-neutral-200 font-bold text-neutral-900'
                  : 'hover:text-neutral-800'
              }`}
            >
              {sc}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 text-neutral-400">
          <span>AI Agents Bound:</span>
          <span className="font-mono text-neutral-700 bg-neutral-200/70 px-1 rounded">
            Cursor · Claude Code · MCP
          </span>
        </div>
      </div>

      {/* Context Shards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-neutral-400 text-xs space-y-2">
            <ShieldCheck className="w-8 h-8 text-neutral-300 mx-auto" />
            <p className="font-semibold text-neutral-700">No context items in this view</p>
            <p className="text-[11px] text-neutral-500 max-w-xs mx-auto">
              Curate a new decision, metric definition, or rule to make your personal context durable across all agent coding sessions.
            </p>
            <button
              onClick={onAddContext}
              className="mt-2 px-3 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 cursor-pointer"
            >
              + Add Context Item
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isCaveat = item.verification?.status === 'caveat';
            const isDrifted = item.verification?.status === 'drifted';

            return (
              <div
                key={item.id}
                onClick={() => onEditMemory(item)}
                className={`p-3.5 rounded-xl border text-xs transition-all cursor-pointer hover:shadow-xs group ${
                  isCaveat
                    ? 'border-amber-300 bg-amber-50/40 hover:bg-amber-50/70'
                    : isDrifted
                    ? 'border-rose-200 bg-rose-50/30 hover:bg-rose-50/60'
                    : 'border-neutral-200/80 bg-white hover:border-neutral-300'
                }`}
              >
                {/* Top Item Metadata */}
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {getStatusBadge(item.verification?.status)}
                    {getScopeBadge(item.scope)}

                    <span className="text-[9px] uppercase font-bold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                      {item.category}
                    </span>

                    {item.userCurated && (
                      <span className="text-[9px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                        User Selected
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-neutral-400 font-mono">
                    {item.lastRecalledAt || item.timestamp}
                  </span>
                </div>

                {/* Primary Content Statement */}
                <p className="text-neutral-900 font-semibold leading-relaxed mb-2 text-xs">
                  {item.content}
                </p>

                {/* Decision Rationale or Caveat Alert */}
                {item.decisionRationale && (
                  <div className="mb-2 p-2 rounded-lg bg-neutral-50 border border-neutral-200/70 text-[11px] text-neutral-700">
                    <span className="font-bold text-neutral-900 block mb-0.5">Rationale:</span>
                    <span>{item.decisionRationale}</span>
                  </div>
                )}

                {/* Caveat Warning Box */}
                {item.verification?.caveatNote && (
                  <div className="mb-2 p-2 rounded-lg bg-amber-100/70 border border-amber-300 text-[11px] text-amber-900 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Caveat Detected:</span> {item.verification.caveatNote}
                    </div>
                  </div>
                )}

                {/* Evidence / Audit Trail */}
                {item.verification?.evidence && (
                  <div className="mb-2 text-[10px] text-neutral-500 flex items-center gap-1 bg-neutral-50/80 px-2 py-1 rounded">
                    <Info className="w-3 h-3 text-neutral-400 shrink-0" />
                    <span className="truncate">Evidence: {item.verification.evidence}</span>
                  </div>
                )}

                {/* Bottom Tags & Bound Agents */}
                <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-[10px] text-neutral-400">
                  <div className="flex items-center gap-1 flex-wrap">
                    {item.tags?.slice(0, 3).map((t, idx) => (
                      <span key={idx} className="bg-neutral-100 text-neutral-600 px-1.5 py-0.2 rounded font-mono">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 text-neutral-500 font-mono">
                    <span>Applicable:</span>
                    <span className="text-indigo-600 font-semibold">
                      {(item.applicableTools || ['Claude Code', 'Cursor']).join(' · ')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ClariLayer Interoperability Footer */}
      <div className="p-3 border-t border-neutral-200 bg-neutral-50/90 flex items-center justify-between text-[11px] text-neutral-600 shrink-0">
        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-indigo-600" />
          <span className="font-semibold text-neutral-800">ClariLayer Parity</span>
          <span className="text-neutral-400">· Selected, Attributable, Correctable</span>
        </div>

        <a
          href="https://clarilayer.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-0.5 hover:underline"
        >
          <span>clarilayer.com</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
    </div>
  );
};
