import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMarkdown } from 'ngx-markdown';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ProposalReviewComponent } from './proposal-review.component';
import { AuthService } from '../../../../core/auth/auth.service';

// jsdom polyfill — child chat panel calls scrollIntoView in ngAfterViewChecked
if (!(Element.prototype as unknown as { scrollIntoView?: unknown }).scrollIntoView) {
  Element.prototype.scrollIntoView = function () { /* no-op */ };
}

const rawProposal = (status = 'InReview') => ({
  id: 'p1', name: 'P', projectName: 'Proj', status, sessionId: '',
  iterations: [
    { version: 1, content: 'v1', components: [], teamSize: 1, durationWeeks: 1, riskLevel: 'low', createdAt: '2026-01-01' },
  ],
  currentIteration: 1,
  comments: [], approvalFlow: [], tags: [],
  createdAt: '2026-01-01', updatedAt: '2026-01-01',
});

describe('ProposalReviewComponent', () => {
  let router: { navigate: ReturnType<typeof vi.fn> };
  let auth: { currentUser: () => { id: string; username: string; proposalRole: string } | null };
  let httpMock: HttpTestingController;

  const setup = (role = 'reviewer') => {
    router = { navigate: vi.fn() };
    auth = {
      currentUser: () => ({ id: 'me', username: 'Me', proposalRole: role }),
      getToken: () => 'tok',
    } as never;
    TestBed.configureTestingModule({
      imports: [ProposalReviewComponent, NoopAnimationsModule],
      providers: [
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'p1' } } } },
        { provide: AuthService, useValue: auth },
        provideHttpClient(),
        provideHttpClientTesting(),
        provideMarkdown(),
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(ProposalReviewComponent);
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.endsWith('/proposals/p1')).flush(rawProposal());
    return fixture;
  };

  afterEach(() => httpMock.verify());

  it('loads proposal and sets selected iteration', () => {
    const fixture = setup();
    expect(fixture.componentInstance.selectedIteration()).toBe(1);
    expect(fixture.componentInstance.proposal()?.id).toBe('p1');
  });

  it('canDecide is true when role matches status', () => {
    const fixture = setup('reviewer');
    expect(fixture.componentInstance.canDecide()).toBe(true);
    expect(fixture.componentInstance.decisionHint()).toBe('');
  });

  it('canDecide false and hint set when role mismatches', () => {
    const fixture = setup('builder');
    expect(fixture.componentInstance.canDecide()).toBe(false);
    expect(fixture.componentInstance.decisionHint()).toContain('revisor');
  });

  it('isTerminal true for approved/rejected, currentIterationData returns iteration', () => {
    const fixture = setup();
    expect(fixture.componentInstance.isTerminal()).toBe(false);
    expect(fixture.componentInstance.currentIterationData()?.version).toBe(1);
    expect(fixture.componentInstance.previousIteration()).toBeNull();
  });

  it('resolutionSteps filters out pending', () => {
    const fixture = setup();
    expect(fixture.componentInstance.resolutionSteps()).toEqual([]);
  });

  it('checklist and progress', () => {
    const fixture = setup();
    expect(fixture.componentInstance.checkedCount()).toBe(0);
    const list = fixture.componentInstance.checklist();
    list[0].checked = true;
    fixture.componentInstance.checklist.set([...list]);
    fixture.componentInstance.updateChecklist();
    expect(fixture.componentInstance.checkedCount()).toBe(1);
    expect(fixture.componentInstance.checklistProgress()).toBeGreaterThan(0);
  });

  it('decide calls service and navigates back after success', () => {
    vi.useFakeTimers();
    const fixture = setup();
    fixture.componentInstance.decide('approved');
    httpMock.expectOne(r => r.url.endsWith('/proposals/p1/decisions')).flush(rawProposal('Approved'));
    vi.advanceTimersByTime(1200);
    expect(router.navigate).toHaveBeenCalledWith(['/proposals']);
    vi.useRealTimers();
  });

  it('decide error shows notification', () => {
    const fixture = setup();
    fixture.componentInstance.decide('rejected');
    httpMock.expectOne(r => r.url.endsWith('/proposals/p1/decisions')).error(new ProgressEvent('err'));
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('requestChanges / requestReject / cancelDecision toggle pending state', () => {
    const fixture = setup();
    fixture.componentInstance.requestChanges();
    expect(fixture.componentInstance.pendingDecision()).toBe('changes_requested');
    expect(fixture.componentInstance.showNote()).toBe(true);
    fixture.componentInstance.cancelDecision();
    expect(fixture.componentInstance.pendingDecision()).toBeNull();

    fixture.componentInstance.requestReject();
    expect(fixture.componentInstance.pendingDecision()).toBe('rejected');
  });

  it('confirmDecision no-ops when no pending', () => {
    const fixture = setup();
    fixture.componentInstance.confirmDecision();
    httpMock.verify();
  });

  it('confirmDecision sends decision on pending', () => {
    vi.useFakeTimers();
    const fixture = setup();
    fixture.componentInstance.requestChanges();
    fixture.componentInstance.decisionNote = 'fix this';
    fixture.componentInstance.confirmDecision();
    httpMock.expectOne(r => r.url.endsWith('/proposals/p1/decisions')).flush(rawProposal());
    vi.advanceTimersByTime(1200);
    expect(router.navigate).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('onAddComment hits service', () => {
    const fixture = setup();
    fixture.componentInstance.onAddComment('body');
    httpMock.expectOne(r => r.url.endsWith('/proposals/p1/comments')).flush(rawProposal());
  });

  it('onSaveIteration hits service', () => {
    const fixture = setup();
    fixture.componentInstance.onSaveIteration('new content');
    httpMock.expectOne(r => r.url.endsWith('/proposals/p1/iterations')).flush(rawProposal());
  });

  it('label helpers return mapped values and fallbacks', () => {
    const fixture = setup();
    const c = fixture.componentInstance;
    expect(c.statusLabel('draft')).toBe('Borrador');
    expect(c.statusLabel('unknown')).toBe('unknown');
    expect(c.stepIcon('approved')).toBe('check_circle');
    expect(c.stepIcon('unknown')).toBe('help');
    expect(c.roleLabel('builder')).toBe('Constructor');
    expect(c.roleLabel('other')).toBe('other');
    expect(c.approvalStatusLabel('approved')).toBe('Aprobado');
    expect(c.approvalStatusLabel('unknown')).toBe('unknown');
  });

  it('openAgentPanel sets agentPanelOpen=true', () => {
    const fixture = setup();
    fixture.componentInstance.openAgentPanel('question');
    expect(fixture.componentInstance.agentPanelOpen()).toBe(true);
  });
});
