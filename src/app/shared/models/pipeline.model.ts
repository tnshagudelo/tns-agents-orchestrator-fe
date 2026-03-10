export type PipelineStatus = 'draft' | 'active' | 'paused' | 'completed' | 'failed';
export type NodeType = 'agent' | 'condition' | 'trigger' | 'output' | 'input';

export interface PipelineNode {
  id: string;
  type: NodeType;
  label: string;
  agentId?: string;
  position: { x: number; y: number };
  config: Record<string, unknown>;
}

export interface PipelineEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  condition?: string;
}

export interface Pipeline {
  id: string;
  name: string;
  description: string;
  status: PipelineStatus;
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PipelineRun {
  id: string;
  pipelineId: string;
  status: PipelineStatus;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  currentNodeId?: string;
}
