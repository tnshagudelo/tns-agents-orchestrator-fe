import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AgentDetailComponent } from './agent-detail.component';

describe('AgentDetailComponent', () => {
  let router: { navigate: ReturnType<typeof vi.fn> };
  let httpMock: HttpTestingController;

  const setupWithId = (id: string | null) => {
    router = { navigate: vi.fn() };
    TestBed.configureTestingModule({
      imports: [AgentDetailComponent, NoopAnimationsModule],
      providers: [
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => id } } } },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
  };

  it('loads agent on init when id present', () => {
    setupWithId('1');
    const fixture = TestBed.createComponent(AgentDetailComponent);
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.endsWith('/agents/1')).flush({ id: '1', name: 'a', status: 'running' });
    httpMock.verify();
  });

  it('does not load when no id', () => {
    setupWithId(null);
    const fixture = TestBed.createComponent(AgentDetailComponent);
    fixture.detectChanges();
    httpMock.verify();
    expect(true).toBe(true);
  });

  it('back navigates to /agents', () => {
    setupWithId('1');
    const fixture = TestBed.createComponent(AgentDetailComponent);
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.endsWith('/agents/1')).flush({ id: '1', name: 'a', status: 'running' });
    fixture.componentInstance.back();
    expect(router.navigate).toHaveBeenCalledWith(['/agents']);
  });

  it('edit/start/stop methods use route id', () => {
    setupWithId('1');
    const fixture = TestBed.createComponent(AgentDetailComponent);
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.endsWith('/agents/1')).flush({ id: '1', name: 'a', status: 'running' });
    fixture.componentInstance.edit();
    expect(router.navigate).toHaveBeenCalledWith(['/agents', '1', 'edit']);
    fixture.componentInstance.start();
    httpMock.expectOne(r => r.url.endsWith('/agents/1/start')).flush({ id: '1', name: 'a', status: 'running' });
    fixture.componentInstance.stop();
    httpMock.expectOne(r => r.url.endsWith('/agents/1/stop')).flush({ id: '1', name: 'a', status: 'stopped' });
  });
});
