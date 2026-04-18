import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { BaseApiService } from '../../../core/services/base-api.service';

export interface AllowedDomain {
  id: string;
  domain: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  createdByUserId: string;
}

export interface CreateAllowedDomainRequest {
  domain: string;
  description?: string;
}

export interface UpdateAllowedDomainRequest {
  domain: string;
  description?: string;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class AllowedDomainService extends BaseApiService {
  private readonly _domains = signal<AllowedDomain[]>([]);
  readonly domains = this._domains.asReadonly();

  constructor(http: HttpClient) {
    super(http);
  }

  loadDomains(): Observable<AllowedDomain[]> {
    return this.get<AllowedDomain[]>('/api/config/allowed-domains').pipe(
      tap(domains => this._domains.set(domains))
    );
  }

  createDomain(request: CreateAllowedDomainRequest): Observable<AllowedDomain> {
    return this.post<AllowedDomain>('/api/config/allowed-domains', request).pipe(
      tap(domain => this._domains.update(list => [...list, domain]))
    );
  }

  updateDomain(id: string, request: UpdateAllowedDomainRequest): Observable<AllowedDomain> {
    return this.put<AllowedDomain>(`/api/config/allowed-domains/${id}`, request).pipe(
      tap(updated =>
        this._domains.update(list =>
          list.map(d => (d.id === updated.id ? updated : d))
        )
      )
    );
  }

  deleteDomain(id: string): Observable<void> {
    return this.delete<void>(`/api/config/allowed-domains/${id}`).pipe(
      tap(() => this._domains.update(list => list.filter(d => d.id !== id)))
    );
  }
}
