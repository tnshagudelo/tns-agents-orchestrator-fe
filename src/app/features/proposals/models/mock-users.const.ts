import { ProposalRoleType } from '../../../shared/models';

export interface MockUser {
  id: string;
  name: string;
  email: string;
  proposalRole: ProposalRoleType;
  roleLabel: string;
  icon: string;
}

export const MOCK_USERS: MockUser[] = [
  { id: 'usr-001', name: 'Nan Ag',            email: 'nan@tns.com',    proposalRole: 'builder',  roleLabel: 'Constructor', icon: 'architecture' },
  { id: 'usr-002', name: 'Pepito Alambrito',  email: 'pepito@tns.com', proposalRole: 'reviewer', roleLabel: 'Revisor',     icon: 'rate_review' },
  { id: 'usr-003', name: 'Mika Maria',        email: 'mika@tns.com',   proposalRole: 'approver', roleLabel: 'Aprobadora',  icon: 'verified' },
];

/** Obtiene el mock user por proposalRole */
export function getMockUserByRole(role: ProposalRoleType): MockUser {
  return MOCK_USERS.find(u => u.proposalRole === role)!;
}
