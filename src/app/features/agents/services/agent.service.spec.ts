import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { AgentService } from './agent.service';
import { environment } from '../../../../environments/environment';

const agent = (id: string, status: 'running' | 'stopped' = 'stopped') => ({
  id,
  name: `a-${id}`,
  status,
});

describe('AgentService', () => {
  let svc: AgentService;
  let httpMock: HttpTestingController;
  const url = (p: string) => `${environment.apiUrl}${p}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AgentService, provideHttpClient(), provideHttpClientTesting()],
    });
    svc = TestBed.inject(AgentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loadAgents populates state and toggles loading', async () => {
    const p = firstValueFrom(svc.loadAgents());
    expect(svc.isLoading()).toBe(true);
    httpMock.expectOne(r => r.url === url('/agents')).flush({ items: [agent('1')], total: 1 });
    await p;
    expect(svc.agents()).toHaveLength(1);
    expect(svc.isLoading()).toBe(false);
  });

  it('loadAgent sets selectedAgent', async () => {
    const p = firstValueFrom(svc.loadAgent('1'));
    httpMock.expectOne(url('/agents/1')).flush(agent('1'));
    await p;
    expect(svc.selectedAgent()?.id).toBe('1');
  });

  it('createAgent appends to list', async () => {
    const p = firstValueFrom(svc.createAgent({ name: 'new' } as never));
    httpMock.expectOne(url('/agents')).flush(agent('new'));
    await p;
    expect(svc.agents().some(a => a.id === 'new')).toBe(true);
  });

  it('updateAgent replaces in list', async () => {
    const prime = firstValueFrom(svc.createAgent({ name: 'x' } as never));
    httpMock.expectOne(url('/agents')).flush(agent('1'));
    await prime;
    const p = firstValueFrom(svc.updateAgent({ id: '1', name: 'renamed' } as never));
    httpMock.expectOne(url('/agents/1')).flush({ ...agent('1'), name: 'renamed' });
    await p;
    expect(svc.agents()[0].name).toBe('renamed');
  });

  it('deleteAgent removes from list', async () => {
    const prime = firstValueFrom(svc.createAgent({ name: 'x' } as never));
    httpMock.expectOne(url('/agents')).flush(agent('1'));
    await prime;
    const p = firstValueFrom(svc.deleteAgent('1'));
    httpMock.expectOne(url('/agents/1')).flush(null);
    await p;
    expect(svc.agents()).toHaveLength(0);
  });

  it('startAgent/stopAgent update status in list', async () => {
    const prime = firstValueFrom(svc.createAgent({ name: 'x' } as never));
    httpMock.expectOne(url('/agents')).flush(agent('1'));
    await prime;

    const start = firstValueFrom(svc.startAgent('1'));
    httpMock.expectOne(url('/agents/1/start')).flush(agent('1', 'running'));
    await start;
    expect(svc.agents()[0].status).toBe('running');
    expect(svc.activeAgents()).toHaveLength(1);

    const stop = firstValueFrom(svc.stopAgent('1'));
    httpMock.expectOne(url('/agents/1/stop')).flush(agent('1', 'stopped'));
    await stop;
    expect(svc.activeAgents()).toHaveLength(0);
  });

  it('selectAgent updates selected signal', () => {
    svc.selectAgent(agent('9') as never);
    expect(svc.selectedAgent()?.id).toBe('9');
    svc.selectAgent(null);
    expect(svc.selectedAgent()).toBeNull();
  });
});
