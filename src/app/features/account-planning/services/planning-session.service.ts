import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { BaseApiService } from '../../../core/services/base-api.service';
import {
  PlanningSession,
  PlanningSessionWithJob,
  SetFocusRequest,
  RegenerateRequest,
} from '../models/account-planning.model';

@Injectable({ providedIn: 'root' })
export class PlanningSessionService extends BaseApiService {
  private readonly _sessions = signal<PlanningSession[]>([]);
  private readonly _currentSession = signal<PlanningSession | null>(null);
  private readonly _isLoading = signal(false);

  readonly sessions = this._sessions.asReadonly();
  readonly currentSession = this._currentSession.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  constructor(http: HttpClient) {
    super(http);
  }

  loadByClient(clientId: string): Observable<PlanningSession[]> {
    this._isLoading.set(true);
    return this.get<PlanningSession[]>(`/api/planning-sessions/by-client/${clientId}`).pipe(
      map(items => (items ?? []).map(s => this.normalize(s))),
      tap(items => {
        this._sessions.set(items);
        this._isLoading.set(false);
      })
    );
  }

  loadMy(): Observable<PlanningSession[]> {
    this._isLoading.set(true);
    return this.get<PlanningSession[]>('/api/planning-sessions/my').pipe(
      map(items => (items ?? []).map(s => this.normalize(s))),
      tap(items => {
        this._sessions.set(items);
        this._isLoading.set(false);
      })
    );
  }

  getById(id: string): Observable<PlanningSession> {
    return this.get<PlanningSession>(`/api/planning-sessions/${id}`).pipe(
      map(s => this.normalize(s)),
      tap(s => this._currentSession.set(s))
    );
  }

  create(clientId: string, language?: string): Observable<PlanningSession> {
    return this.post<PlanningSession>('/api/planning-sessions', { clientId, language }).pipe(
      map(s => this.normalize(s)),
      tap(s => {
        this._sessions.update(list => [s, ...list]);
        this._currentSession.set(s);
      })
    );
  }

  confirmClient(sessionId: string): Observable<PlanningSessionWithJob> {
    return this.post<PlanningSessionWithJob>(`/api/planning-sessions/${sessionId}/confirm`, {}).pipe(
      map(r => ({ session: this.normalize(r.session), jobId: r.jobId })),
      tap(r => this._currentSession.set(r.session))
    );
  }

  submitLinkedIn(sessionId: string, linkedInData: string): Observable<PlanningSession> {
    return this.post<PlanningSession>(`/api/planning-sessions/${sessionId}/linkedin`, { linkedInData }).pipe(
      map(s => this.normalize(s)),
      tap(s => this._currentSession.set(s))
    );
  }

  setFocus(sessionId: string, focus: SetFocusRequest): Observable<PlanningSessionWithJob> {
    return this.post<PlanningSessionWithJob>(`/api/planning-sessions/${sessionId}/focus`, focus).pipe(
      map(r => ({ session: this.normalize(r.session), jobId: r.jobId })),
      tap(r => this._currentSession.set(r.session))
    );
  }

  approve(sessionId: string): Observable<PlanningSession> {
    return this.post<PlanningSession>(`/api/planning-sessions/${sessionId}/approve`, {}).pipe(
      map(s => this.normalize(s)),
      tap(s => this._currentSession.set(s))
    );
  }

  regenerate(sessionId: string, request: RegenerateRequest): Observable<PlanningSessionWithJob> {
    return this.post<PlanningSessionWithJob>(`/api/planning-sessions/${sessionId}/regenerate`, request).pipe(
      map(r => ({ session: this.normalize(r.session), jobId: r.jobId })),
      tap(r => this._currentSession.set(r.session))
    );
  }

  retry(sessionId: string): Observable<PlanningSessionWithJob> {
    return this.post<PlanningSessionWithJob>(`/api/planning-sessions/${sessionId}/retry`, {}).pipe(
      map(r => ({ session: this.normalize(r.session), jobId: r.jobId })),
      tap(r => this._currentSession.set(r.session))
    );
  }

  private normalize(raw: PlanningSession): PlanningSession {
    return {
      ...raw,
      createdAt: new Date(raw.createdAt),
      updatedAt: new Date(raw.updatedAt),
    };
  }
}
