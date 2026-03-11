import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { BaseApiService } from '../../../core/services/base-api.service';
import { Pipeline, PipelineRun, PagedResponse } from '../../../shared/models';

@Injectable({ providedIn: 'root' })
export class OrchestrationService extends BaseApiService {
  private readonly _pipelines = signal<Pipeline[]>([]);
  private readonly _selectedPipeline = signal<Pipeline | null>(null);
  private readonly _activeRuns = signal<PipelineRun[]>([]);
  private readonly _isLoading = signal(false);

  readonly pipelines = this._pipelines.asReadonly();
  readonly selectedPipeline = this._selectedPipeline.asReadonly();
  readonly activeRuns = this._activeRuns.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  constructor(http: HttpClient) {
    super(http);
  }

  loadPipelines(page = 1, pageSize = 20): Observable<PagedResponse<Pipeline>> {
    this._isLoading.set(true);
    return this.getList<Pipeline>('/pipelines', page, pageSize).pipe(
      tap(response => {
        this._pipelines.set(response.items);
        this._isLoading.set(false);
      })
    );
  }

  loadPipeline(id: string): Observable<Pipeline> {
    return this.get<Pipeline>(`/pipelines/${id}`).pipe(
      tap(p => this._selectedPipeline.set(p))
    );
  }

  createPipeline(pipeline: Partial<Pipeline>): Observable<Pipeline> {
    return this.post<Pipeline>('/pipelines', pipeline).pipe(
      tap(p => this._pipelines.update(ps => [...ps, p]))
    );
  }

  savePipeline(pipeline: Pipeline): Observable<Pipeline> {
    return this.put<Pipeline>(`/pipelines/${pipeline.id}`, pipeline).pipe(
      tap(updated => {
        this._pipelines.update(ps => ps.map(p => (p.id === updated.id ? updated : p)));
        this._selectedPipeline.set(updated);
      })
    );
  }

  deletePipeline(id: string): Observable<void> {
    return this.delete<void>(`/pipelines/${id}`).pipe(
      tap(() => this._pipelines.update(ps => ps.filter(p => p.id !== id)))
    );
  }

  runPipeline(id: string): Observable<PipelineRun> {
    return this.post<PipelineRun>(`/pipelines/${id}/run`, {}).pipe(
      tap(run => this._activeRuns.update(runs => [...runs, run]))
    );
  }

  selectPipeline(pipeline: Pipeline | null): void {
    this._selectedPipeline.set(pipeline);
  }
}
