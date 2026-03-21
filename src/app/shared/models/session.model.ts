export type SessionStatus = 'active' | 'completed' | 'error' | 'timeout';

export interface AgentSession {
  id: string;
  agentId: string;
  agentName: string;
  userId?: string;
  status: SessionStatus;
  startedAt: Date;
  endedAt?: Date;
  durationMs?: number;
  messageCount: number;
  tokensUsed?: number;
  metadata?: Record<string, unknown>;
}
