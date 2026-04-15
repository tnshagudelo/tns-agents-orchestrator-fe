import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { SessionsService } from './sessions.service';
import { environment } from '../../../../environments/environment';

describe('SessionsService', () => {
  let svc: SessionsService;
  let httpMock: HttpTestingController;
  const url = (p: string) => `${environment.apiUrl}${p}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SessionsService, provideHttpClient(), provideHttpClientTesting()],
    });
    svc = TestBed.inject(SessionsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loadSessions without agentId omits the filter param', async () => {
    const p = firstValueFrom(svc.loadSessions());
    const req = httpMock.expectOne(r => r.url === url('/sessions'));
    expect(req.request.params.has('agentId')).toBe(false);
    req.flush({ items: [{ id: 's1' }], total: 1 });
    await p;
    expect(svc.sessions()).toHaveLength(1);
    expect(svc.total()).toBe(1);
    expect(svc.isLoading()).toBe(false);
  });

  it('loadSessions with agentId includes it in params', async () => {
    const p = firstValueFrom(svc.loadSessions(2, 10, 'a1'));
    const req = httpMock.expectOne(r => r.url === url('/sessions'));
    expect(req.request.params.get('agentId')).toBe('a1');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('pageSize')).toBe('10');
    req.flush({ items: [], total: 0 });
    await p;
  });

  it('clearSessions resets state', () => {
    svc.clearSessions();
    expect(svc.sessions()).toEqual([]);
    expect(svc.total()).toBe(0);
  });
});
