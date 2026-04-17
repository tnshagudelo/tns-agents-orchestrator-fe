export type ProposalRoleType = 'builder' | 'reviewer' | 'approver';
export type AuthProvider = 'mock' | 'github' | 'entraid';

export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  proposalRole: ProposalRoleType;
  avatarUrl?: string;
  authProvider?: AuthProvider;
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

export interface OAuthCallbackResponse {
  user: {
    id: string;
    username: string;
    email: string;
    avatarUrl?: string;
  };
  token: string;
  githubAccessToken?: string;
}
