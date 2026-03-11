import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { BaseApiService } from '../../../core/services/base-api.service';
import { Agent, AgentCreateRequest, AgentUpdateRequest, PagedResponse } from '../../../shared/models';

@Injectable({ providedIn: 'root' })
export class AgentService extends BaseApiService {
  private readonly _agents = signal<Agent[]>([]);
  private readonly _selectedAgent = signal<Agent | null>(null);
  private readonly _isLoading = signal(false);

  readonly agents = this._agents.asReadonly();
  readonly selectedAgent = this._selectedAgent.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly activeAgents = computed(() =>
    this._agents().filter(a => a.status === 'running')
  );

  constructor(http: HttpClient) {
    super(http);
  }

  loadAgents(page = 1, pageSize = 20): Observable<PagedResponse<Agent>> {
    this._isLoading.set(true);
    return this.getList<Agent>('/agents', page, pageSize).pipe(
      tap(response => {
        this._agents.set(response.items);
        this._isLoading.set(false);
      })
    );
  }

  loadAgent(id: string): Observable<Agent> {
    return this.get<Agent>(`/agents/${id}`).pipe(
      tap(agent => this._selectedAgent.set(agent))
    );
  }

  createAgent(request: AgentCreateRequest): Observable<Agent> {
    return this.post<Agent>('/agents', request).pipe(
      tap(agent => this._agents.update(agents => [...agents, agent]))
    );
  }

  updateAgent(request: AgentUpdateRequest): Observable<Agent> {
    return this.put<Agent>(`/agents/${request.id}`, request).pipe(
      tap(updated =>
        this._agents.update(agents =>
          agents.map(a => (a.id === updated.id ? updated : a))
        )
      )
    );
  }

  deleteAgent(id: string): Observable<void> {
    return this.delete<void>(`/agents/${id}`).pipe(
      tap(() => this._agents.update(agents => agents.filter(a => a.id !== id)))
    );
  }

  startAgent(id: string): Observable<Agent> {
    return this.post<Agent>(`/agents/${id}/start`, {}).pipe(
      tap(updated =>
        this._agents.update(agents =>
          agents.map(a => (a.id === updated.id ? updated : a))
        )
      )
    );
  }

  stopAgent(id: string): Observable<Agent> {
    return this.post<Agent>(`/agents/${id}/stop`, {}).pipe(
      tap(updated =>
        this._agents.update(agents =>
          agents.map(a => (a.id === updated.id ? updated : a))
        )
      )
    );
  }

  selectAgent(agent: Agent | null): void {
    this._selectedAgent.set(agent);
  }
}
