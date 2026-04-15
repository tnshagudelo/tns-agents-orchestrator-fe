import { Injectable, signal, DestroyRef, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, interval, switchMap, takeUntil, tap, filter } from 'rxjs';
import { BaseApiService } from '../../../core/services/base-api.service';
import { BackgroundJobStatus_Response } from '../models/account-planning.model';

@Injectable({ providedIn: 'root' })
export class JobPollingService extends BaseApiService {
  private readonly _currentJob = signal<BackgroundJobStatus_Response | null>(null);
  private readonly _isPolling = signal(false);
  private readonly stop$ = new Subject<void>();

  readonly currentJob = this._currentJob.asReadonly();
  readonly isPolling = this._isPolling.asReadonly();

  constructor(http: HttpClient) {
    super(http);
  }

  /** Inicia polling cada intervalMs (default 2s) hasta que el job termine o se detenga manualmente */
  startPolling(jobId: string, intervalMs = 2000): void {
    this.stopPolling();
    this._isPolling.set(true);

    interval(intervalMs).pipe(
      takeUntil(this.stop$),
      switchMap(() => this.get<BackgroundJobStatus_Response>(`/api/jobs/${jobId}/status`)),
      tap(job => {
        this._currentJob.set(job);
        if (job.status === 'Completed' || job.status === 'Failed' || job.status === 'Cancelled') {
          this.stopPolling();
        }
      })
    ).subscribe();
  }

  /** Consulta una sola vez el estado de un job (sin polling) */
  getStatus(jobId: string): Observable<BackgroundJobStatus_Response> {
    return this.get<BackgroundJobStatus_Response>(`/api/jobs/${jobId}/status`);
  }

  /** Busca el job más reciente de una entidad (ej: PlanningSession) y reanuda polling si está activo */
  resumeIfActive(referenceId: string): void {
    this.get<BackgroundJobStatus_Response[]>(`/api/jobs/by-reference/${referenceId}`).subscribe(jobs => {
      const active = jobs.find(j => j.status === 'Running' || j.status === 'Queued');
      if (active) {
        this.startPolling(active.id);
      }
    });
  }

  stopPolling(): void {
    this.stop$.next();
    this._isPolling.set(false);
  }

  reset(): void {
    this.stopPolling();
    this._currentJob.set(null);
  }
}
