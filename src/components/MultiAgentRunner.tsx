import React, { useState } from 'react';
import {
  Bot,
  Play,
  CheckCircle2,
  RefreshCw,
  Cpu,
  Layers,
  ArrowRight,
  Sparkles,
  Terminal,
  Activity,
  Check,
} from 'lucide-react';
import { AgentWorkflow, MemoryItem, AgentExecutionLog } from '../types';

interface MultiAgentRunnerProps {
  agents: AgentWorkflow[];
  memories: MemoryItem[];
  onTriggerMultiAgentRun: (taskDirective: string) => Promise<void>;
  isRunning: boolean;
  latestRunResult: {
    task: string;
    logs: AgentExecutionLog[];
    synthesis: string;
  } | null;
}

export const MultiAgentRunner: React.FC<MultiAgentRunnerProps> = ({
  agents,
  memories,
  onTriggerMultiAgentRun,
  isRunning,
  latestRunResult,
}) => {
  const [taskDirective, setTaskDirective] = useState(
    'Synthesize cross-session architecture constraints and verify multi-agent workflow continuity.'
  );

  const presetTasks = [
    'Synthesize cross-session architecture constraints and verify multi-agent workflow continuity.',
    'Harmonize user profile identity with recent React 19 + TypeScript stack requirements.',
    'Verify no contradictions exist between Session 1 goals and Session 2 constraints.',
  ];

  const handleRun = () => {
    if (!taskDirective.trim() || isRunning) return;
    onTriggerMultiAgentRun(taskDirective.trim());
  };

  return (
    <div className="flex flex-col h-full bg-white select-none overflow-y-auto p-4 space-y-5">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold text-neutral-900">CrewAI & LangChain Workflows</h3>
        </div>
        <p className="text-[11px] text-neutral-500 leading-relaxed">
          Specialized agents collaborate to ingest, query, and synchronize long-term memory across sessions.
        </p>
      </div>

      {/* Agents Cards Grid */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
          Active Coordinated Agents ({agents.length})
        </span>

        {agents.map((agent) => (
          <div
            key={agent.id}
            className="p-3 rounded-lg border border-neutral-200/80 bg-neutral-50/50 hover:bg-neutral-50 transition-colors text-xs"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="font-bold text-neutral-800">{agent.name}</span>
              </div>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                  agent.status === 'running'
                    ? 'bg-amber-100 text-amber-800 animate-pulse'
                    : agent.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-neutral-200 text-neutral-600'
                }`}
              >
                {agent.status}
              </span>
            </div>

            <p className="text-[11px] text-neutral-600 mb-1.5 leading-snug">
              {agent.description}
            </p>

            <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
              <span>{agent.tech}</span>
              <span>Role: {agent.role.split(' ')[0]}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Workflow Execution Trigger */}
      <div className="p-3.5 rounded-xl border border-neutral-200 bg-white shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-800">Execute Multi-Agent Task</span>
          <span className="text-[10px] text-neutral-400">CrewAI Orchestration</span>
        </div>

        <textarea
          value={taskDirective}
          onChange={(e) => setTaskDirective(e.target.value)}
          rows={2}
          placeholder="Enter goal for the agent crew..."
          className="w-full text-xs p-2 rounded-lg border border-neutral-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
        />

        {/* Preset Task Buttons */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-neutral-400 uppercase">Presets:</span>
          {presetTasks.map((t, idx) => (
            <button
              key={idx}
              onClick={() => setTaskDirective(t)}
              className="w-full text-left p-1 rounded text-[10px] text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 truncate block transition-colors"
            >
              • {t}
            </button>
          ))}
        </div>

        <button
          onClick={handleRun}
          disabled={isRunning || !taskDirective.trim()}
          className="w-full py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Agents Coordinating ({memories.length} memories)...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Multi-Agent Memory Workflow</span>
            </>
          )}
        </button>
      </div>

      {/* Live Agent Output & Logs */}
      {latestRunResult && (
        <div className="p-3.5 rounded-xl border border-indigo-200/80 bg-indigo-50/40 space-y-2.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-indigo-950">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Multi-Agent Synthesis Result</span>
            </div>
            <span className="text-[10px] text-indigo-600 font-mono">Completed</span>
          </div>

          <p className="text-xs text-neutral-800 leading-relaxed bg-white p-2.5 rounded-lg border border-indigo-100 shadow-2xs whitespace-pre-wrap">
            {latestRunResult.synthesis}
          </p>

          {/* Execution Trace */}
          <div className="pt-2 border-t border-indigo-100/70">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">
              Agent Execution Trace:
            </span>
            <div className="space-y-1 font-mono text-[10px]">
              {latestRunResult.logs.map((log, i) => (
                <div key={i} className="flex items-start gap-1.5 text-neutral-600">
                  <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-neutral-800">[{log.agent}]</span> {log.action}: {log.detail}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
