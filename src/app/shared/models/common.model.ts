export type LogLevel = 'debug' | 'info' | 'warning' | 'error';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  agentId?: string;
  pipelineId?: string;
  metadata?: Record<string, unknown>;
}

export interface MetricSnapshot {
  timestamp: Date;
  activeAgents: number;
  runningPipelines: number;
  errorCount: number;
  successRate: number;
  avgResponseTimeMs: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PagedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}
