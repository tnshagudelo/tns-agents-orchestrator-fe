export type ProposalStatus = 'draft' | 'in_review' | 'pending_approval' | 'approved' | 'rejected';

export interface RagReference {
  fileName: string;
  excerpt: string;
  relevance: number;   // 0.0 a 1.0
  category: string;
}
export type ProposalRole = 'builder' | 'reviewer' | 'approver';

export interface ProposalMetrics {
  components: string[];
  teamSize: number;
  durationWeeks: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ProposalIteration {
  version: number;
  content: string;
  components: string[];
  teamSize: number;
  durationWeeks: number;
  riskLevel: 'low' | 'medium' | 'high';
  createdAt: Date;
}

export interface ProposalComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: ProposalRole;
  body: string;
  iterationVersion: number;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface ProposalApprovalStep {
  role: ProposalRole;
  userId: string;
  userName: string;
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  decidedAt?: Date;
  note?: string;
}

export interface CreateProposalRequest {
  name: string;
  projectName: string;
  createdByUserId: string;
  createdByUserName: string;
  reviewerUserId: string;
  reviewerUserName: string;
  approverUserId: string;
  approverUserName: string;
  tags: string[];
}

export interface Proposal {
  id: string;
  name: string;
  projectName: string;
  status: ProposalStatus;
  sessionId: string;
  iterations: ProposalIteration[];
  currentIteration: number;
  comments: ProposalComment[];
  approvalFlow: ProposalApprovalStep[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
