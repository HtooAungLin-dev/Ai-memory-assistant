export type MemoryCategory = 'identity' | 'preference' | 'project' | 'knowledge' | 'constraint' | 'workflow' | 'decision' | 'definition' | 'rule' | 'lesson';
export type MemorySentiment = 'positive' | 'negative' | 'neutral';
export type ContextScope = 'global' | 'task-scoped' | 'project';
export type VerificationStatus = 'verified' | 'unverified' | 'caveat' | 'drifted';

export interface ContextVerification {
  status: VerificationStatus;
  lastChecked?: string;
  sourceType?: 'user_curated' | 'ai_extracted' | 'data_reconciled' | 'codebase_evidence';
  evidence?: string;
  caveatNote?: string;
}

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
  // ClariLayer Context Layer extensions
  scope?: ContextScope;
  userCurated?: boolean; // User explicitly chose to remember/verify this
  decisionRationale?: string; // Why this decision was made
  verification?: ContextVerification;
  alternativesConsidered?: string[];
  applicableTools?: string[]; // e.g. ['Claude Code', 'Cursor', 'Python Agent', 'SQL']
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
