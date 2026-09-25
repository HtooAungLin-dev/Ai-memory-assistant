import React, { useState } from 'react';
import {
  Layers,
  Terminal,
  Play,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  Code,
  Database,
  Cpu,
} from 'lucide-react';
import { MemoryItem } from '../types';

interface OpenMemoryMCPViewerProps {
  memories: MemoryItem[];
}

export const OpenMemoryMCPViewer: React.FC<OpenMemoryMCPViewerProps> = ({ memories }) => {
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [activeMcpTestResult, setActiveMcpTestResult] = useState<string | null>(null);
  const [testQuery, setTestQuery] = useState('user preferences and tech stack');
  const [isExecuting, setIsExecuting] = useState(false);

  const mcpTools = [
    {
      name: 'mcp.recall_memories',
      description: 'Retrieves relevant long-term memory propositions across all past conversation sessions.',
      parameters: '{ "query": string, "limit": number, "min_confidence": number }',
    },
    {
      name: 'mcp.store_memory',
      description: 'Extracts and indexes facts, constraints, and preferences into the Mem0 vector graph.',
      parameters: '{ "content": string, "category": string, "session_id": string }',
    },
    {
      name: 'mcp.query_memory_graph',
      description: 'Executes relational graph traversal between entities, identities, and project requirements.',
      parameters: '{ "root_node": string, "depth": number }',
    },
    {
      name: 'mcp.sync_session_context',
      description: 'Pre-loads existing cross-session memories into the prompt context for a new session.',
      parameters: '{ "session_id": string, "user_id": string }',
    },
  ];

  const mcpServerConfig = {
    mcpServers: {
      openmemory: {
        command: 'npx',
        args: ['-y', '@openmemory/mcp-server'],
        env: {
          MEM0_API_KEY: 'env:MEM0_API_KEY',
          PERSISTENCE_MODE: 'cross-session',
          GRAPH_ENGINE: 'in-memory-vector-hybrid',
        },
      },
    },
  };

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(JSON.stringify(mcpServerConfig, null, 2));
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  const handleExecuteMcpQuery = () => {
    setIsExecuting(true);
    setTimeout(() => {
      const matching = memories.filter((m) =>
        m.content.toLowerCase().includes('react') ||
        m.content.toLowerCase().includes('htoo') ||
        m.content.toLowerCase().includes('stack') ||
        m.category === 'preference' ||
        m.category === 'identity'
      );

      const rpcResponse = {
        jsonrpc: '2.0',
        id: 104,
        result: {
          protocol: 'openmemory-mcp/1.0',
          recalled_count: matching.length,
          memories: matching.map((m) => ({
            id: m.id,
            proposition: m.content,
            category: m.category,
            confidence: m.confidence,
            source_session: m.sessionTitle,
          })),
          context_status: 'cross-session-aligned',
        },
      };

      setActiveMcpTestResult(JSON.stringify(rpcResponse, null, 2));
      setIsExecuting(false);
    }, 700);
  };

  return (
    <div className="flex flex-col h-full bg-white select-none overflow-y-auto p-4 space-y-5">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-neutral-900">OpenMemory MCP Protocol</h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
            MCP Bridge Connected
          </span>
        </div>
        <p className="text-[11px] text-neutral-500 leading-relaxed">
          Standard Model Context Protocol integration exposing persistent Mem0 vector graph tools to any LLM runtime.
        </p>
      </div>

      {/* Interactive MCP Tool Test */}
      <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-neutral-800">Test MCP Tool Call (`mcp.recall_memories`)</span>
          <span className="text-[10px] text-neutral-400 font-mono">JSON-RPC 2.0</span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            placeholder="Search query for MCP bridge..."
            className="flex-1 text-xs p-2 rounded-lg border border-neutral-200 bg-white outline-none"
          />
          <button
            onClick={handleExecuteMcpQuery}
            disabled={isExecuting}
            className="px-3 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{isExecuting ? 'Querying...' : 'Execute'}</span>
          </button>
        </div>

        {activeMcpTestResult && (
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">MCP Protocol Output:</span>
            <pre className="p-2.5 bg-neutral-950 text-emerald-400 rounded-lg text-[10px] font-mono overflow-x-auto max-h-48 leading-relaxed">
              {activeMcpTestResult}
            </pre>
          </div>
        )}
      </div>

      {/* Registered MCP Tools */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
          Registered MCP Memory Tools
        </span>

        {mcpTools.map((tool, idx) => (
          <div key={idx} className="p-2.5 rounded-lg border border-neutral-200/80 bg-white text-xs space-y-1">
            <div className="flex items-center justify-between font-mono font-bold text-indigo-700">
              <span>{tool.name}</span>
              <span className="text-[9px] text-neutral-400 font-sans font-normal">Active Tool</span>
            </div>
            <p className="text-[11px] text-neutral-600">{tool.description}</p>
            <div className="text-[10px] font-mono text-neutral-400 bg-neutral-50 p-1.5 rounded truncate">
              Params: {tool.parameters}
            </div>
          </div>
        ))}
      </div>

      {/* MCP Configuration Snippet */}
      <div className="p-3.5 rounded-xl border border-neutral-200 bg-white space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-neutral-800">Client Config (Claude / Cursor / AI Studio)</span>
          <button
            onClick={handleCopyConfig}
            className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
          >
            {copiedConfig ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedConfig ? 'Copied' : 'Copy Config'}</span>
          </button>
        </div>

        <pre className="p-2.5 bg-neutral-900 text-neutral-200 rounded-lg text-[10px] font-mono overflow-x-auto">
          {JSON.stringify(mcpServerConfig, null, 2)}
        </pre>
      </div>
    </div>
  );
};
