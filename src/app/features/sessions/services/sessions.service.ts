import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { BaseApiService } from '../../../core/services/base-api.service';
import { AgentSession, PagedResponse } from '../../../shared/models';

@Injectable({ providedIn: 'root' })
export class SessionsService extends BaseApiService {
  private readonly _sessions = signal<AgentSession[]>([]);
  private readonly _total = signal(0);
  private readonly _isLoading = signal(false);

  readonly sessions = this._sessions.asReadonly();
  readonly total = this._total.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  constructor(http: HttpClient) {
    super(http);
  }

  loadSessions(page = 1, pageSize = 20, agentId?: string): Observable<PagedResponse<AgentSession>> {
    this._isLoading.set(true);
    const params: Record<string, string | number> = { page, pageSize };
    if (agentId) params['agentId'] = agentId;

    return this.get<PagedResponse<AgentSession>>('/sessions', params).pipe(
      tap(response => {
        this._sessions.set(response.items);
        this._total.set(response.total);
        this._isLoading.set(false);
      })
    );
  }

  clearSessions(): void {
    this._sessions.set([]);
    this._total.set(0);
  }
}
