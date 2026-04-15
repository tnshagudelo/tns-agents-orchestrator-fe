import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { JobPollingService } from './job-polling.service';
import { environment } from '../../../../environments/environment';

describe('JobPollingService', () => {
  let svc: JobPollingService;
  let httpMock: HttpTestingController;
  const url = (p: string) => `${environment.apiUrl}${p}`;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [JobPollingService, provideHttpClient(), provideHttpClientTesting()],
    });
    svc = TestBed.inject(JobPollingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    vi.useRealTimers();
    httpMock.verify();
  });

  it('getStatus returns single status observable', async () => {
    const p = firstValueFrom(svc.getStatus('j1'));
    httpMock.expectOne(url('/api/jobs/j1/status')).flush({ id: 'j1', status: 'Running' });
    const r = await p;
    expect(r.status).toBe('Running');
  });

  it('startPolling polls at interval and stops on Completed', () => {
    svc.startPolling('j1', 1000);
    expect(svc.isPolling()).toBe(true);

    vi.advanceTimersByTime(1000);
    httpMock.expectOne(url('/api/jobs/j1/status')).flush({ id: 'j1', status: 'Running' });
    expect(svc.currentJob()?.status).toBe('Running');
    expect(svc.isPolling()).toBe(true);

    vi.advanceTimersByTime(1000);
    httpMock.expectOne(url('/api/jobs/j1/status')).flush({ id: 'j1', status: 'Completed' });
    expect(svc.currentJob()?.status).toBe('Completed');
    expect(svc.isPolling()).toBe(false);
  });

  it('startPolling stops on Failed', () => {
    svc.startPolling('j1', 1000);
    vi.advanceTimersByTime(1000);
    httpMock.expectOne(url('/api/jobs/j1/status')).flush({ id: 'j1', status: 'Failed' });
    expect(svc.isPolling()).toBe(false);
  });

  it('startPolling stops on Cancelled', () => {
    svc.startPolling('j1', 1000);
    vi.advanceTimersByTime(1000);
    httpMock.expectOne(url('/api/jobs/j1/status')).flush({ id: 'j1', status: 'Cancelled' });
    expect(svc.isPolling()).toBe(false);
  });

  it('stopPolling clears flag and cancels further requests', () => {
    svc.startPolling('j1', 1000);
    svc.stopPolling();
    expect(svc.isPolling()).toBe(false);
    vi.advanceTimersByTime(5000);
    httpMock.expectNone(url('/api/jobs/j1/status'));
  });

  it('reset clears currentJob', () => {
    svc.startPolling('j1', 1000);
    vi.advanceTimersByTime(1000);
    httpMock.expectOne(url('/api/jobs/j1/status')).flush({ id: 'j1', status: 'Running' });
    svc.reset();
    expect(svc.currentJob()).toBeNull();
    expect(svc.isPolling()).toBe(false);
  });

  it('resumeIfActive starts polling only when active job found', () => {
    svc.resumeIfActive('ref-1');
    httpMock.expectOne(url('/api/jobs/by-reference/ref-1'))
      .flush([{ id: 'ja', status: 'Running' }]);
    expect(svc.isPolling()).toBe(true);
  });

  it('resumeIfActive does nothing when no active job', () => {
    svc.resumeIfActive('ref-2');
    httpMock.expectOne(url('/api/jobs/by-reference/ref-2'))
      .flush([{ id: 'jx', status: 'Completed' }]);
    expect(svc.isPolling()).toBe(false);
  });
});
