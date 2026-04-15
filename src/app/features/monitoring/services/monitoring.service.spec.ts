import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { MonitoringService } from './monitoring.service';
import { environment } from '../../../../environments/environment';

describe('MonitoringService', () => {
  let svc: MonitoringService;
  let httpMock: HttpTestingController;
  const url = (p: string) => `${environment.apiUrl}${p}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MonitoringService, provideHttpClient(), provideHttpClientTesting()],
    });
    svc = TestBed.inject(MonitoringService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loadLogs populates state', async () => {
    const p = firstValueFrom(svc.loadLogs());
    expect(svc.isLoading()).toBe(true);
    httpMock.expectOne(r => r.url === url('/logs'))
      .flush({ items: [{ id: 'l1' }], total: 1 });
    await p;
    expect(svc.logs()).toHaveLength(1);
    expect(svc.isLoading()).toBe(false);
  });

  it('loadMetrics stores latest snapshot', async () => {
    const p = firstValueFrom(svc.loadMetrics());
    httpMock.expectOne(url('/metrics/latest')).flush({ cpu: 0.5 });
    await p;
    expect(svc.metrics()).toEqual({ cpu: 0.5 });
  });

  it('appendLog prepends up to 500 entries', () => {
    for (let i = 0; i < 510; i++) {
      svc.appendLog({ id: `l${i}` } as never);
    }
    expect(svc.logs()).toHaveLength(500);
    expect(svc.logs()[0].id).toBe('l509');
  });

  it('clearLogs empties the list', () => {
    svc.appendLog({ id: 'x' } as never);
    svc.clearLogs();
    expect(svc.logs()).toEqual([]);
  });
});
