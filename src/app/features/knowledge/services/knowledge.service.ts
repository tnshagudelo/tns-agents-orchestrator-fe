import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { BaseApiService } from '../../../core/services/base-api.service';
import {
  ApiResponse,
  CollectionStatus,
  IngestionResult,
  SearchResult,
  SearchResultItem,
} from '../models/knowledge.model';

@Injectable({ providedIn: 'root' })
export class KnowledgeService extends BaseApiService {
  // ── Estado ────────────────────────────────────────────────────────────────
  collectionStatus = signal<CollectionStatus | null>(null);
  isLoadingStatus  = signal(false);
  isIngesting      = signal(false);
  lastIngestionResult = signal<IngestionResult | null>(null);
  searchResults    = signal<SearchResultItem[]>([]);
  isSearching      = signal(false);

  // ── Computed ──────────────────────────────────────────────────────────────
  readonly vectorCount      = computed(() => this.collectionStatus()?.vectorCount ?? 0);
  readonly collectionExists = computed(() => this.collectionStatus()?.exists ?? false);

  constructor(http: HttpClient) {
    super(http);
  }

  // ── Subir archivos (multipart/form-data) ──────────────────────────────────
  // NO agregar Content-Type manualmente — el browser lo gestiona con el boundary
  ingestFiles(files: File[], category = 'general'): Observable<ApiResponse<IngestionResult>> {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f, f.name));
    formData.append('category', category);
    return this.http.post<ApiResponse<IngestionResult>>(
      `${this.baseUrl}/api/knowledge/ingest`,
      formData,
    );
  }

  getStatus(): Observable<ApiResponse<CollectionStatus>> {
    return this.get<ApiResponse<CollectionStatus>>('/api/knowledge/status');
  }

  search(query: string, topK = 5): Observable<ApiResponse<SearchResult>> {
    this.isSearching.set(true);
    return this.get<ApiResponse<SearchResult>>('/api/knowledge/search', { q: query, topK }).pipe(
      tap(r => {
        if (r.success && r.data) this.searchResults.set(r.data.items);
      }),
      finalize(() => this.isSearching.set(false)),
    );
  }

  deleteCollection(): Observable<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>('/api/knowledge/collection');
  }

  loadStatus(): void {
    this.isLoadingStatus.set(true);
    this.getStatus().subscribe({
      next:  r  => { if (r.success && r.data) this.collectionStatus.set(r.data); },
      error: () => {},
      complete: () => this.isLoadingStatus.set(false),
    });
  }
}
