import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ProposalCardComponent, ProposalCardAction } from './proposal-card.component';
import { Proposal } from '../../models/proposal.model';

const baseProposal = (overrides: Partial<Proposal> = {}): Proposal => ({
  id: 'p1',
  name: 'P',
  projectName: 'Proj',
  status: 'draft',
  sessionId: 's',
  iterations: [],
  currentIteration: 0,
  comments: [],
  approvalFlow: [],
  tags: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

function setup(proposal: Proposal) {
  const fixture = TestBed.createComponent(ProposalCardComponent);
  fixture.componentRef.setInput('proposal', proposal);
  fixture.detectChanges();
  return fixture;
}

describe('ProposalCardComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ProposalCardComponent, NoopAnimationsModule] });
  });

  it('maps status to icon and label', () => {
    for (const [status, icon, label] of [
      ['draft', 'edit_note', 'Borrador'],
      ['in_review', 'rate_review', 'En revisión'],
      ['pending_approval', 'pending_actions', 'Aprobación'],
      ['approved', 'check_circle', 'Aprobado'],
      ['rejected', 'cancel', 'Rechazado'],
    ] as const) {
      const fixture = setup(baseProposal({ status }));
      expect(fixture.componentInstance.statusIcon()).toBe(icon);
      expect(fixture.componentInstance.statusLabel()).toBe(label);
    }
  });

  it('computes approvedSteps and approvalProgress', () => {
    const fixture = setup(baseProposal({
      approvalFlow: [
        { role: 'reviewer', userId: 'u1', userName: 'R', status: 'approved' },
        { role: 'approver', userId: 'u2', userName: 'A', status: 'pending' },
      ],
    }));
    expect(fixture.componentInstance.approvedSteps()).toBe(1);
    expect(fixture.componentInstance.approvalProgress()).toBe(50);
  });

  it('returns 0 progress when no approval steps', () => {
    const fixture = setup(baseProposal());
    expect(fixture.componentInstance.approvalProgress()).toBe(0);
  });

  it('actionIcon/actionLabel react to status', () => {
    expect(setup(baseProposal({ status: 'draft' })).componentInstance.actionLabel()).toBe('Editar');
    expect(setup(baseProposal({ status: 'in_review' })).componentInstance.actionLabel()).toBe('Revisar');
    expect(setup(baseProposal({ status: 'approved' })).componentInstance.actionLabel()).toBe('Ver');
    expect(setup(baseProposal({ status: 'draft' })).componentInstance.actionIcon()).toBe('open_in_new');
    expect(setup(baseProposal({ status: 'pending_approval' })).componentInstance.actionIcon()).toBe('rate_review');
    expect(setup(baseProposal({ status: 'approved' })).componentInstance.actionIcon()).toBe('visibility');
  });

  it('onAction emits appropriate action kind', () => {
    const events: ProposalCardAction[] = [];
    for (const status of ['draft', 'in_review', 'approved'] as const) {
      const fixture = setup(baseProposal({ status }));
      fixture.componentInstance.action.subscribe((a: ProposalCardAction) => events.push(a));
      fixture.componentInstance.onAction();
    }
    expect(events.map(e => e.action)).toEqual(['open', 'review', 'view']);
  });
});
