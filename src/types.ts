export type MemoryCategory = 'identity' | 'preference' | 'project' | 'knowledge' | 'constraint' | 'workflow';
export type MemorySentiment = 'positive' | 'negative' | 'neutral';

export interface MemoryItem {
  id: string;
  content: string;
  category: MemoryCategory;
  confidence: number;
  timestamp: string;
  sessionId: string;
  sessionTitle: string;
  pinned?: boolean;
  accessCount?: number;
  lastRecalledAt?: string;
  sentiment?: MemorySentiment;
  tags?: string[];
  archived?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'agent';
  content: string;
  timestamp: string;
  recalledMemories?: string[];
  newlyExtractedMemories?: MemoryItem[];
  agentName?: string;
}

export interface Session {
  id: string;
  title: string;
  createdAt: string;
  messageCount: number;
  description?: string;
}

export interface AgentWorkflow {
  id: string;
  name: string;
  role: string;
  tech: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  description: string;
  task: string;
  lastRun?: string;
}

export interface AgentExecutionLog {
  id: string;
  agent: string;
  action: string;
  detail: string;
  status: 'running' | 'completed' | 'failed';
  timestamp: string;
}

export interface MultiAgentRunResult {
  taskId: string;
  task: string;
  status: 'completed' | 'running' | 'failed';
  logs: AgentExecutionLog[];
  synthesis: string;
  timestamp: string;
}
