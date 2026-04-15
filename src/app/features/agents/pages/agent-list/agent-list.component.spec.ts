import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AgentListComponent } from './agent-list.component';
import { AgentService } from '../../services/agent.service';
import { NotificationService } from '../../../../core/services/notification.service';

const agent = (id: string, status = 'stopped', name = `a-${id}`, description = 'd') =>
  ({ id, status, name, description });

describe('AgentListComponent', () => {
  let router: { navigate: ReturnType<typeof vi.fn> };
  let httpMock: HttpTestingController;
  let agentSvc: AgentService;

  beforeEach(() => {
    router = { navigate: vi.fn() };
    TestBed.configureTestingModule({
      imports: [AgentListComponent, NoopAnimationsModule],
      providers: [
        AgentService,
        NotificationService,
        { provide: Router, useValue: router },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    agentSvc = TestBed.inject(AgentService);
  });

  afterEach(() => httpMock.verify());

  it('loads agents on init', () => {
    const fixture = TestBed.createComponent(AgentListComponent);
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.endsWith('/agents')).flush({ items: [agent('1')], total: 1 });
    expect(agentSvc.agents()).toHaveLength(1);
  });

  it('filteredAgents applies search and status filter', () => {
    const fixture = TestBed.createComponent(AgentListComponent);
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.endsWith('/agents')).flush({
      items: [agent('1', 'running', 'Alpha'), agent('2', 'stopped', 'Beta')],
      total: 2,
    });
    const cmp = fixture.componentInstance;
    cmp.searchTerm = 'alpha';
    expect(cmp.filteredAgents).toHaveLength(1);
    cmp.searchTerm = '';
    cmp.statusFilter = 'running';
    expect(cmp.filteredAgents).toHaveLength(1);
    cmp.statusFilter = '';
    expect(cmp.filteredAgents).toHaveLength(2);
  });

  it('createAgent/viewAgent/editAgent navigate', () => {
    const fixture = TestBed.createComponent(AgentListComponent);
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.endsWith('/agents')).flush({ items: [], total: 0 });
    const cmp = fixture.componentInstance;
    cmp.createAgent();
    expect(router.navigate).toHaveBeenCalledWith(['/agents/create']);
    cmp.viewAgent(agent('1') as never);
    expect(router.navigate).toHaveBeenCalledWith(['/agents', '1']);
    cmp.editAgent(agent('1') as never);
    expect(router.navigate).toHaveBeenCalledWith(['/agents', '1', 'edit']);
  });

  it('startAgent/stopAgent/deleteAgent call service', () => {
    const fixture = TestBed.createComponent(AgentListComponent);
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.endsWith('/agents')).flush({ items: [], total: 0 });
    const cmp = fixture.componentInstance;
    cmp.startAgent('1');
    httpMock.expectOne(r => r.url.endsWith('/agents/1/start')).flush(agent('1', 'running'));
    cmp.stopAgent('1');
    httpMock.expectOne(r => r.url.endsWith('/agents/1/stop')).flush(agent('1'));
    cmp.deleteAgent('1');
    httpMock.expectOne(r => r.url.endsWith('/agents/1')).flush(null);
  });
});
