import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode, Database } from 'lucide-react';
import { MemoryItem, Session, AgentWorkflow } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: MemoryItem[];
  sessions: Session[];
  agents: AgentWorkflow[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  memories,
  sessions,
  agents,
}) => {
  const [format, setFormat] = useState<'json' | 'markdown' | 'mcp'>('json');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getExportData = () => {
    if (format === 'json') {
      return JSON.stringify(
        {
          project: 'MemStudio - AI Assistant With Memory',
          exportTimestamp: new Date().toISOString(),
          techStack: ['Mem0', 'OpenMemory MCP', 'LangChain', 'CrewAI', 'LLM APIs'],
          sessions,
          memories,
          agents,
        },
        null,
        2
      );
    } else if (format === 'markdown') {
      let md = `# MemStudio - AI Assistant Memory Export\n\n`;
      md += `**Exported at:** ${new Date().toLocaleString()}\n`;
      md += `**Tech:** Mem0 • OpenMemory MCP • LangChain • CrewAI\n\n`;
      md += `## 🧠 Persistent Long-Term Memories (${memories.length})\n\n`;
      memories.forEach((m, idx) => {
        md += `### ${idx + 1}. [${m.category.toUpperCase()}] ${m.content}\n`;
        md += `- **Confidence:** ${(m.confidence * 100).toFixed(0)}%\n`;
        md += `- **Origin:** ${m.sessionTitle}\n`;
        md += `- **Timestamp:** ${m.timestamp}\n\n`;
      });
      md += `## 💬 Sessions Tracked (${sessions.length})\n\n`;
      sessions.forEach((s) => {
        md += `- **${s.title}** (${s.createdAt}) - ${s.messageCount} messages\n`;
      });
      return md;
    } else {
      return JSON.stringify(
        {
          mcpServers: {
            openmemory: {
              command: 'npx',
              args: ['-y', '@openmemory/mcp-server'],
              env: {
                MEM0_API_KEY: 'env:MEM0_API_KEY',
                PERSISTENCE_MODE: 'cross-session',
                MEMORY_THRESHOLD: '0.85',
              },
            },
          },
        },
        null,
        2
      );
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getExportData());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const data = getExportData();
    const extension = format === 'markdown' ? 'md' : 'json';
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memstudio-memory-export.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-neutral-900">Export Memory Context</h3>
              <p className="text-[10px] text-neutral-500">Download memories & multi-agent configs</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex bg-neutral-100 p-0.5 rounded-xl text-xs font-medium">
            <button
              onClick={() => setFormat('json')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                format === 'json' ? 'bg-white text-neutral-900 shadow-2xs font-semibold' : 'text-neutral-500'
              }`}
            >
              JSON Snapshot
            </button>
            <button
              onClick={() => setFormat('markdown')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                format === 'markdown' ? 'bg-white text-neutral-900 shadow-2xs font-semibold' : 'text-neutral-500'
              }`}
            >
              Markdown Report
            </button>
            <button
              onClick={() => setFormat('mcp')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                format === 'mcp' ? 'bg-white text-neutral-900 shadow-2xs font-semibold' : 'text-neutral-500'
              }`}
            >
              OpenMemory MCP
            </button>
          </div>

          <div className="relative">
            <pre className="p-3 bg-neutral-950 text-neutral-200 rounded-xl text-[11px] font-mono h-64 overflow-y-auto leading-relaxed">
              {getExportData()}
            </pre>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-neutral-400">
              {memories.length} memories • {sessions.length} sessions
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-1.5 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
