export type ProposalRoleType = 'builder' | 'reviewer' | 'approver';
export type AuthProvider = 'github' | 'entraid';

export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  proposalRole: ProposalRoleType;
  avatarUrl?: string;
  authProvider?: AuthProvider;
  token?: string;
  groupId?: string;
  groupName?: string;
  modules?: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface OAuthCallbackResponse {
  user: {
    id: string;
    gitHubId?: string;
    username: string;
    email: string;
    avatarUrl?: string;
    groupId?: string;
    groupName?: string;
    modules?: string[];
    status?: string;
  };
  token: string;
  githubAccessToken?: string;
}
