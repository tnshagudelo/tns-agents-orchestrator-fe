import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { BaseApiService } from '../../../core/services/base-api.service';
import { LogEntry, MetricSnapshot, PagedResponse } from '../../../shared/models';

@Injectable({ providedIn: 'root' })
export class MonitoringService extends BaseApiService {
  private readonly _logs = signal<LogEntry[]>([]);
  private readonly _metrics = signal<MetricSnapshot | null>(null);
  private readonly _isLoading = signal(false);

  readonly logs = this._logs.asReadonly();
  readonly metrics = this._metrics.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  constructor(http: HttpClient) {
    super(http);
  }

  loadLogs(page = 1, pageSize = 50): Observable<PagedResponse<LogEntry>> {
    this._isLoading.set(true);
    return this.getList<LogEntry>('/logs', page, pageSize).pipe(
      tap(response => {
        this._logs.set(response.items);
        this._isLoading.set(false);
      })
    );
  }

  loadMetrics(): Observable<MetricSnapshot> {
    return this.get<MetricSnapshot>('/metrics/latest').pipe(
      tap(snapshot => this._metrics.set(snapshot))
    );
  }

  appendLog(entry: LogEntry): void {
    this._logs.update(logs => [entry, ...logs].slice(0, 500));
  }

  clearLogs(): void {
    this._logs.set([]);
  }
}
