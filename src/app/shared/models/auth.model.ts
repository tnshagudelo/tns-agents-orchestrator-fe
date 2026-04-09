export type ProposalRoleType = 'builder' | 'reviewer' | 'approver';

export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  proposalRole: ProposalRoleType;
  token?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
