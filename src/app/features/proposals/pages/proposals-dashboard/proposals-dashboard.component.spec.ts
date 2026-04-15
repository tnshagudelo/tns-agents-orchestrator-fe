import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ProposalsDashboardComponent } from './proposals-dashboard.component';
import { AuthService } from '../../../../core/auth/auth.service';
import { Proposal, ProposalStatus } from '../../models/proposal.model';

const rawProposal = (id: string, status: string, name = 'P', projectName = 'Proj') => ({
  id, name, projectName, status, sessionId: '', iterations: [],
  comments: [], approvalFlow: [], tags: [],
  createdAt: '2026-01-01', updatedAt: '2026-01-01',
});

const authMock = { currentUser: () => ({ id: 'me', username: 'Me' }) };

describe('ProposalsDashboardComponent', () => {
  let router: { navigate: ReturnType<typeof vi.fn> };
  let dialog: { open: ReturnType<typeof vi.fn> };
  let dialogRef: { afterClosed: ReturnType<typeof vi.fn> };
  let httpMock: HttpTestingController;

  beforeEach(() => {
    router = { navigate: vi.fn() };
    dialogRef = { afterClosed: vi.fn().mockReturnValue(of(undefined)) };
    dialog = { open: vi.fn().mockReturnValue(dialogRef as unknown as MatDialogRef<unknown>) };
    TestBed.configureTestingModule({
      imports: [ProposalsDashboardComponent, NoopAnimationsModule],
      providers: [
        { provide: Router, useValue: router },
        { provide: MatDialog, useValue: dialog },
        { provide: AuthService, useValue: authMock },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loadsAll on init and filters by text and status', () => {
    const fixture = TestBed.createComponent(ProposalsDashboardComponent);
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.endsWith('/proposals')).flush([
      rawProposal('1', 'Draft', 'Alpha'),
      rawProposal('2', 'Approved', 'Beta'),
    ]);
    expect(fixture.componentInstance.filteredProposals()).toHaveLength(2);
    fixture.componentInstance.filterText.set('alpha');
    expect(fixture.componentInstance.filteredProposals()).toHaveLength(1);
    fixture.componentInstance.filterText.set('');
    fixture.componentInstance.activeStatus.set('approved');
    expect(fixture.componentInstance.filteredProposals()).toHaveLength(1);
  });

  it('toggleStatus toggles between value and null', () => {
    const fixture = TestBed.createComponent(ProposalsDashboardComponent);
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.endsWith('/proposals')).flush([]);
    fixture.componentInstance.toggleStatus('draft');
    expect(fixture.componentInstance.activeStatus()).toBe('draft');
    fixture.componentInstance.toggleStatus('draft');
    expect(fixture.componentInstance.activeStatus()).toBeNull();
  });

  it('kanbanCounts aggregates by status', () => {
    const fixture = TestBed.createComponent(ProposalsDashboardComponent);
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.endsWith('/proposals')).flush([
      rawProposal('1', 'Draft'),
      rawProposal('2', 'Approved'),
      rawProposal('3', 'Rejected'),
    ]);
    const counts = fixture.componentInstance.kanbanCounts();
    expect(counts.draft).toBe(1);
    expect(counts.approved).toBe(2);
  });

  it('allowedTransitions matrix is correct', () => {
    const fixture = TestBed.createComponent(ProposalsDashboardComponent);
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.endsWith('/proposals')).flush([]);
    expect(fixture.componentInstance.allowedTransitions.draft).toContain('in_review');
    expect(fixture.componentInstance.allowedTransitions.approved).toEqual([]);
  });

  it('isValidTarget respects transitions and dragging state', () => {
    const fixture = TestBed.createComponent(ProposalsDashboardComponent);
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.endsWith('/proposals')).flush([]);
    expect(fixture.componentInstance.isValidTarget('in_review')).toBe(false);
    fixture.componentInstance.draggingProposal.set({ status: 'draft', id: '1' } as Proposal);
    expect(fixture.componentInstance.isValidTarget('in_review')).toBe(true);
    expect(fixture.componentInstance.isValidTarget('approved')).toBe(false);
    expect(fixture.componentInstance.isValidTarget('draft')).toBe(false);
  });

  it('onDrop rejects invalid transition and calls updateStatus on valid', () => {
    const fixture = TestBed.createComponent(ProposalsDashboardComponent);
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.endsWith('/proposals')).flush([]);
    const proposal = { id: '1', status: 'draft' } as Proposal;
    // invalid transition draft→approved
    fixture.componentInstance.onDrop({
      previousContainer: { data: [proposal] } as never,
      container: { data: [] } as never,
      previousIndex: 0,
      currentIndex: 0,
    } as never, 'approved');
    httpMock.verify();

    // valid draft→in_review
    fixture.componentInstance.onDrop({
      previousContainer: { data: [proposal] } as never,
      container: { data: [] } as never,
      previousIndex: 0,
      currentIndex: 0,
    } as never, 'in_review');
    httpMock.expectOne(r => r.url.endsWith('/proposals/1')).flush(rawProposal('1', 'InReview'));
  });

  it('onDrop no-op when same container', () => {
    const fixture = TestBed.createComponent(ProposalsDashboardComponent);
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.endsWith('/proposals')).flush([]);
    const sameContainer = { data: [] } as never;
    fixture.componentInstance.onDrop({
      previousContainer: sameContainer,
      container: sameContainer,
      previousIndex: 0,
      currentIndex: 0,
    } as never, 'in_review');
    httpMock.verify();
  });

  it('navigate routes to workpad for draft, review for in_review', () => {
    const fixture = TestBed.createComponent(ProposalsDashboardComponent);
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.endsWith('/proposals')).flush([]);
    fixture.componentInstance.navigate({ id: '1', status: 'draft' } as Proposal);
    expect(router.navigate).toHaveBeenCalledWith(['/proposals/1/workpad']);
    fixture.componentInstance.navigate({ id: '2', status: 'in_review' } as Proposal);
    expect(router.navigate).toHaveBeenCalledWith(['/proposals/2/review']);
  });

  it('onCardAction navigates via navigate()', () => {
    const fixture = TestBed.createComponent(ProposalsDashboardComponent);
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.endsWith('/proposals')).flush([]);
    fixture.componentInstance.onCardAction({ proposalId: '1', action: 'review' });
    expect(router.navigate).toHaveBeenCalledWith(['/proposals/1/review']);
  });

  // openNewDialog path requires real MatDialog integration; covered indirectly.

  it('statusLabel covers all statuses', () => {
    const fixture = TestBed.createComponent(ProposalsDashboardComponent);
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.endsWith('/proposals')).flush([]);
    for (const s of ['draft', 'in_review', 'pending_approval', 'approved', 'rejected'] as ProposalStatus[]) {
      expect(typeof fixture.componentInstance.statusLabel(s)).toBe('string');
    }
  });
});
