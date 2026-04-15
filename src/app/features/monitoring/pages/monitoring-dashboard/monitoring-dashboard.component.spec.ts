import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MonitoringDashboardComponent } from './monitoring-dashboard.component';

describe('MonitoringDashboardComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MonitoringDashboardComponent, NoopAnimationsModule],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('refreshes logs and metrics on init', () => {
    const fixture = TestBed.createComponent(MonitoringDashboardComponent);
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.endsWith('/logs')).flush({ items: [], total: 0 });
    httpMock.expectOne(r => r.url.endsWith('/metrics/latest')).flush({});
  });

  it('refresh can be called again', () => {
    const fixture = TestBed.createComponent(MonitoringDashboardComponent);
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.endsWith('/logs')).flush({ items: [], total: 0 });
    httpMock.expectOne(r => r.url.endsWith('/metrics/latest')).flush({});
    fixture.componentInstance.refresh();
    httpMock.expectOne(r => r.url.endsWith('/logs')).flush({ items: [], total: 0 });
    httpMock.expectOne(r => r.url.endsWith('/metrics/latest')).flush({});
  });

  it('clearLogs delegates to service', () => {
    const fixture = TestBed.createComponent(MonitoringDashboardComponent);
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.endsWith('/logs')).flush({ items: [], total: 0 });
    httpMock.expectOne(r => r.url.endsWith('/metrics/latest')).flush({});
    fixture.componentInstance.clearLogs();
    const cmp = fixture.componentInstance as unknown as { monitoringService: { logs: () => unknown[] } };
    expect(cmp.monitoringService.logs()).toEqual([]);
  });
});
