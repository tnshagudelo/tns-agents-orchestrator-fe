import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { SessionsDashboardComponent } from './sessions-dashboard.component';

describe('SessionsDashboardComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SessionsDashboardComponent, NoopAnimationsModule],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('refreshes on init with default params', () => {
    const fixture = TestBed.createComponent(SessionsDashboardComponent);
    fixture.detectChanges();
    const req = httpMock.expectOne(r => r.url.endsWith('/sessions'));
    expect(req.request.params.get('page')).toBe('1');
    req.flush({ items: [{ id: 's1', status: 'active' }, { id: 's2', status: 'completed' }, { id: 's3', status: 'error' }], total: 3 });
    expect(fixture.componentInstance.activeSessions()).toBe(1);
    expect(fixture.componentInstance.completedSessions()).toBe(1);
    expect(fixture.componentInstance.errorSessions()).toBe(1);
  });

  it('applyFilter resets page and refreshes', () => {
    const fixture = TestBed.createComponent(SessionsDashboardComponent);
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.endsWith('/sessions')).flush({ items: [], total: 0 });
    fixture.componentInstance.agentFilter = 'abc';
    fixture.componentInstance.applyFilter();
    const req = httpMock.expectOne(r => r.url.endsWith('/sessions'));
    expect(req.request.params.get('agentId')).toBe('abc');
    req.flush({ items: [], total: 0 });
  });

  it('clearFilter empties filter and refreshes', () => {
    const fixture = TestBed.createComponent(SessionsDashboardComponent);
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.endsWith('/sessions')).flush({ items: [], total: 0 });
    fixture.componentInstance.agentFilter = 'x';
    fixture.componentInstance.clearFilter();
    expect(fixture.componentInstance.agentFilter).toBe('');
    httpMock.expectOne(r => r.url.endsWith('/sessions')).flush({ items: [], total: 0 });
  });

  it('onPage updates page and refreshes', () => {
    const fixture = TestBed.createComponent(SessionsDashboardComponent);
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.endsWith('/sessions')).flush({ items: [], total: 0 });
    fixture.componentInstance.onPage({ pageIndex: 2, pageSize: 50, length: 100 } as never);
    expect(fixture.componentInstance.currentPage).toBe(3);
    expect(fixture.componentInstance.pageSize).toBe(50);
    httpMock.expectOne(r => r.url.endsWith('/sessions')).flush({ items: [], total: 0 });
  });
});
