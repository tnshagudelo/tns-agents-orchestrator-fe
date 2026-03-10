export type AgentStatus = 'idle' | 'running' | 'paused' | 'error' | 'completed';
export type AgentType = 'llm' | 'tool' | 'orchestrator' | 'retriever' | 'custom';

export interface Agent {
  id: string;
  name: string;
  description: string;
  type: AgentType;
  status: AgentStatus;
  model?: string;
  tools?: string[];
  config: AgentConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentConfig {
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  retryAttempts?: number;
  timeoutMs?: number;
  [key: string]: unknown;
}

export interface AgentCreateRequest {
  name: string;
  description: string;
  type: AgentType;
  model?: string;
  tools?: string[];
  config: AgentConfig;
}

export interface AgentUpdateRequest extends Partial<AgentCreateRequest> {
  id: string;
}
