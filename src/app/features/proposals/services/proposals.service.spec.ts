import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { ProposalsService } from './proposals.service';
import { AuthService } from '../../../core/auth/auth.service';
import { environment } from '../../../../environments/environment';

const rawProposal = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 'p1',
  name: 'Prop',
  projectName: 'Proj',
  status: 'Draft',
  sessionId: 'sess',
  iterations: [
    {
      version: 1,
      content: 'v1',
      components: ['c'],
      teamSize: 3,
      durationWeeks: 4,
      riskLevel: 'Medium',
      createdAt: '2026-01-01T00:00:00Z',
    },
  ],
  comments: [],
  approvalFlow: [
    { role: 'Reviewer', userId: 'u1', userName: 'Rev', status: 'Pending' },
    { role: 'Approver', userId: 'u2', userName: 'App', status: 'Approved', decidedAt: '2026-01-02T00:00:00Z', note: 'ok' },
  ],
  tags: ['t'],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-02T00:00:00Z',
  ...overrides,
});

const authMock = {
  currentUser: () => ({ id: 'me', username: 'Me' }),
};

describe('ProposalsService', () => {
  let svc: ProposalsService;
  let httpMock: HttpTestingController;
  const url = (p: string) => `${environment.apiUrl}${p}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProposalsService,
        { provide: AuthService, useValue: authMock },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    svc = TestBed.inject(ProposalsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loadAll normalizes status, iterations, approval flow, and dates', async () => {
    const p = firstValueFrom(svc.loadAll());
    expect(svc.isLoading()).toBe(true);
    httpMock.expectOne(url('/proposals')).flush([rawProposal()]);
    const list = await p;
    expect(list[0].status).toBe('draft');
    expect(list[0].iterations[0].riskLevel).toBe('medium');
    expect(list[0].approvalFlow[0].role).toBe('reviewer');
    expect(list[0].approvalFlow[1].decidedAt).toBeInstanceOf(Date);
    expect(list[0].createdAt).toBeInstanceOf(Date);
    expect(svc.isLoading()).toBe(false);
  });

  it('loadAll tolerates null payload', async () => {
    const p = firstValueFrom(svc.loadAll());
    httpMock.expectOne(url('/proposals')).flush(null);
    expect(await p).toEqual([]);
  });

  it('normalizes various status variants and falls back to draft', async () => {
    const p = firstValueFrom(svc.loadAll());
    httpMock.expectOne(url('/proposals')).flush([
      rawProposal({ id: '1', status: 'InReview' }),
      rawProposal({ id: '2', status: 'PENDING_APPROVAL' }),
      rawProposal({ id: '3', status: 'Approved' }),
      rawProposal({ id: '4', status: 'Rejected' }),
      rawProposal({ id: '5', status: 'unknown' }),
    ]);
    const list = await p;
    expect(list.map(x => x.status)).toEqual([
      'in_review',
      'pending_approval',
      'approved',
      'rejected',
      'draft',
    ]);
  });

  it('getById selects and normalizes', async () => {
    const p = firstValueFrom(svc.getById('p1'));
    httpMock.expectOne(url('/proposals/p1')).flush(rawProposal());
    await p;
    expect(svc.selectedProposal()?.id).toBe('p1');
    expect(svc.isLoading()).toBe(false);
  });

  it('create attaches current user and prepends to list', async () => {
    const p = firstValueFrom(svc.create({ name: 'N', projectName: 'P', reviewerUserId: 'r', reviewerUserName: 'R', approverUserId: 'a', approverUserName: 'A', tags: [] }));
    const req = httpMock.expectOne(url('/proposals'));
    expect(req.request.body.createdByUserId).toBe('me');
    expect(req.request.body.createdByUserName).toBe('Me');
    req.flush(rawProposal({ id: 'new' }));
    await p;
    expect(svc.proposals()[0].id).toBe('new');
  });

  it('updateStatus applies optimistic update and reverts on error', async () => {
    const load = firstValueFrom(svc.loadAll());
    httpMock.expectOne(url('/proposals')).flush([rawProposal()]);
    await load;

    const p = firstValueFrom(svc.updateStatus('p1', 'approved')).catch(e => e);
    // Optimistic reflect:
    expect(svc.proposals()[0].status).toBe('approved');
    const req = httpMock.expectOne(url('/proposals/p1'));
    expect(req.request.body).toEqual({ status: 3 });
    req.error(new ProgressEvent('err'));
    await p;
    // Reverted:
    expect(svc.proposals()[0].status).toBe('draft');
  });

  it('updateStatus success syncs server state', async () => {
    const load = firstValueFrom(svc.loadAll());
    httpMock.expectOne(url('/proposals')).flush([rawProposal()]);
    await load;

    const p = firstValueFrom(svc.updateStatus('p1', 'approved'));
    httpMock.expectOne(url('/proposals/p1')).flush(rawProposal({ status: 'Approved' }));
    await p;
    expect(svc.proposals()[0].status).toBe('approved');
  });

  it('deleteProposal removes from list', async () => {
    const load = firstValueFrom(svc.loadAll());
    httpMock.expectOne(url('/proposals')).flush([rawProposal()]);
    await load;

    const p = firstValueFrom(svc.deleteProposal('p1'));
    httpMock.expectOne(url('/proposals/p1')).flush(null);
    await p;
    expect(svc.proposals()).toHaveLength(0);
  });

  it('submitForReview posts userId and syncs result', async () => {
    const p = firstValueFrom(svc.submitForReview('p1'));
    const req = httpMock.expectOne(url('/proposals/p1/submit'));
    expect(req.request.body).toEqual({ userId: 'me' });
    req.flush(rawProposal({ status: 'InReview' }));
    const result = await p;
    expect(result.status).toBe('in_review');
  });

  it('decide maps approved/rejected/changes_requested to backend decisions', async () => {
    for (const [status, expected] of [
      ['approved', 'Approve'],
      ['rejected', 'Reject'],
      ['changes_requested', 'RequestChanges'],
    ] as const) {
      const p = firstValueFrom(svc.decide('p1', 'reviewer', status));
      const req = httpMock.expectOne(url('/proposals/p1/decisions'));
      expect(req.request.body.decision).toBe(expected);
      req.flush(rawProposal());
      await p;
    }
  });

  it('addComment applies optimistic state and reverts on error', async () => {
    const loadSel = firstValueFrom(svc.getById('p1'));
    httpMock.expectOne(url('/proposals/p1')).flush(rawProposal());
    await loadSel;

    const p = firstValueFrom(svc.addComment('p1', {
      authorId: 'u1', authorName: 'Alice', authorRole: 'reviewer', body: 'hi', iterationVersion: 1,
    })).catch(e => e);

    expect(svc.selectedProposal()?.comments).toHaveLength(1);
    const req = httpMock.expectOne(url('/proposals/p1/comments'));
    expect(req.request.body.authorRole).toBe(1);
    req.error(new ProgressEvent('err'));
    await p;
    expect(svc.selectedProposal()?.comments).toHaveLength(0);
  });

  it('addComment success syncs when backend returns full proposal', async () => {
    const loadSel = firstValueFrom(svc.getById('p1'));
    httpMock.expectOne(url('/proposals/p1')).flush(rawProposal());
    await loadSel;

    const p = firstValueFrom(svc.addComment('p1', {
      authorId: 'u1', authorName: 'Alice', authorRole: 'builder', body: 'hi', iterationVersion: 1,
    }));
    httpMock.expectOne(url('/proposals/p1/comments')).flush(rawProposal({
      comments: [{ id: 'real', authorId: 'u1', authorName: 'Alice', authorRole: 'builder', body: 'hi', iterationVersion: 1, createdAt: '2026-01-01T00:00:00Z' }],
    }));
    await p;
    expect(svc.selectedProposal()?.comments[0].id).toBe('real');
  });

  it('updateIteration adds optimistic iteration and reverts on error', async () => {
    const loadSel = firstValueFrom(svc.getById('p1'));
    httpMock.expectOne(url('/proposals/p1')).flush(rawProposal());
    await loadSel;

    const p = firstValueFrom(svc.updateIteration('p1', {
      content: 'v2', components: [], teamSize: 1, durationWeeks: 1, riskLevel: 'low',
    })).catch(e => e);

    expect(svc.selectedProposal()?.iterations).toHaveLength(2);
    expect(svc.selectedProposal()?.currentIteration).toBe(2);
    httpMock.expectOne(url('/proposals/p1/iterations')).error(new ProgressEvent('err'));
    await p;
    expect(svc.selectedProposal()?.iterations).toHaveLength(1);
  });
});
