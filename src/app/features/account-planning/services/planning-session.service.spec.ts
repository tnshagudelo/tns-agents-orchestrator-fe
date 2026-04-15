import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { PlanningSessionService } from './planning-session.service';
import { environment } from '../../../../environments/environment';

const raw = (id = 's1') => ({
  id,
  clientId: 'c1',
  status: 'Queued',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-02T00:00:00Z',
});

describe('PlanningSessionService', () => {
  let svc: PlanningSessionService;
  let httpMock: HttpTestingController;
  const url = (p: string) => `${environment.apiUrl}${p}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PlanningSessionService, provideHttpClient(), provideHttpClientTesting()],
    });
    svc = TestBed.inject(PlanningSessionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loadByClient normalizes dates and stores', async () => {
    const p = firstValueFrom(svc.loadByClient('c1'));
    expect(svc.isLoading()).toBe(true);
    httpMock.expectOne(url('/api/planning-sessions/by-client/c1')).flush([raw()]);
    const list = await p;
    expect(list[0].createdAt).toBeInstanceOf(Date);
    expect(svc.sessions()).toHaveLength(1);
    expect(svc.isLoading()).toBe(false);
  });

  it('loadByClient tolerates null payload', async () => {
    const p = firstValueFrom(svc.loadByClient('c1'));
    httpMock.expectOne(url('/api/planning-sessions/by-client/c1')).flush(null);
    expect(await p).toEqual([]);
  });

  it('loadMy populates sessions', async () => {
    const p = firstValueFrom(svc.loadMy());
    httpMock.expectOne(url('/api/planning-sessions/my')).flush([raw('s2')]);
    await p;
    expect(svc.sessions()).toHaveLength(1);
  });

  it('getById sets currentSession', async () => {
    const p = firstValueFrom(svc.getById('s1'));
    httpMock.expectOne(url('/api/planning-sessions/s1')).flush(raw());
    await p;
    expect(svc.currentSession()?.id).toBe('s1');
  });

  it('create posts and prepends + selects', async () => {
    const p = firstValueFrom(svc.create('c1', 'es'));
    const req = httpMock.expectOne(url('/api/planning-sessions'));
    expect(req.request.body).toEqual({ clientId: 'c1', language: 'es' });
    req.flush(raw());
    await p;
    expect(svc.sessions()[0].id).toBe('s1');
    expect(svc.currentSession()?.id).toBe('s1');
  });

  it('startQuickSearch posts intent', async () => {
    const p = firstValueFrom(svc.startQuickSearch('s1', 'intent'));
    httpMock.expectOne(url('/api/planning-sessions/s1/start-quick-search')).flush(raw());
    await p;
    expect(svc.currentSession()?.id).toBe('s1');
  });

  it('completeQuickSearch posts summary', async () => {
    const p = firstValueFrom(svc.completeQuickSearch('s1', 'summary'));
    httpMock.expectOne(url('/api/planning-sessions/s1/complete-quick-search')).flush(raw());
    await p;
  });

  it('rejectQuickSearch posts empty body', async () => {
    const p = firstValueFrom(svc.rejectQuickSearch('s1'));
    httpMock.expectOne(url('/api/planning-sessions/s1/reject-quick-search')).flush(raw());
    await p;
  });

  it('submitLinkedIn posts linkedInData', async () => {
    const p = firstValueFrom(svc.submitLinkedIn('s1', 'data'));
    httpMock.expectOne(url('/api/planning-sessions/s1/linkedin')).flush(raw());
    await p;
  });

  it('approve posts', async () => {
    const p = firstValueFrom(svc.approve('s1'));
    httpMock.expectOne(url('/api/planning-sessions/s1/approve')).flush(raw());
    await p;
  });

  it('confirmClient returns session+jobId', async () => {
    const p = firstValueFrom(svc.confirmClient('s1'));
    httpMock.expectOne(url('/api/planning-sessions/s1/confirm'))
      .flush({ session: raw(), jobId: 'j1' });
    const r = await p;
    expect(r.jobId).toBe('j1');
    expect(r.session.createdAt).toBeInstanceOf(Date);
  });

  it('setFocus returns session+jobId', async () => {
    const p = firstValueFrom(svc.setFocus('s1', { focus: 'x' } as never));
    httpMock.expectOne(url('/api/planning-sessions/s1/focus'))
      .flush({ session: raw(), jobId: 'j2' });
    const r = await p;
    expect(r.jobId).toBe('j2');
  });

  it('regenerate returns session+jobId', async () => {
    const p = firstValueFrom(svc.regenerate('s1', { reason: 'r' } as never));
    httpMock.expectOne(url('/api/planning-sessions/s1/regenerate'))
      .flush({ session: raw(), jobId: 'j3' });
    const r = await p;
    expect(r.jobId).toBe('j3');
  });

  it('retry returns session+jobId', async () => {
    const p = firstValueFrom(svc.retry('s1'));
    httpMock.expectOne(url('/api/planning-sessions/s1/retry'))
      .flush({ session: raw(), jobId: 'j4' });
    const r = await p;
    expect(r.jobId).toBe('j4');
  });

  it('getResults normalizes dates', async () => {
    const p = firstValueFrom(svc.getResults('s1'));
    httpMock.expectOne(url('/api/planning-sessions/s1/results')).flush([
      { id: 'r1', sourceDate: '2026-01-01T00:00:00Z', createdAt: '2026-01-02T00:00:00Z' },
      { id: 'r2', createdAt: '2026-01-03T00:00:00Z' },
    ]);
    const r = await p;
    expect(r[0].sourceDate).toBeInstanceOf(Date);
    expect(r[0].createdAt).toBeInstanceOf(Date);
    expect(r[1].sourceDate).toBeUndefined();
  });

  it('getResults tolerates null payload', async () => {
    const p = firstValueFrom(svc.getResults('s1'));
    httpMock.expectOne(url('/api/planning-sessions/s1/results')).flush(null);
    expect(await p).toEqual([]);
  });
});
