import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { BaseApiService } from '../../../core/services/base-api.service';
import { Client, CreateClientRequest, UpdateClientRequest } from '../models/account-planning.model';

@Injectable({ providedIn: 'root' })
export class ClientService extends BaseApiService {
  private readonly _clients = signal<Client[]>([]);
  private readonly _isLoading = signal(false);

  readonly clients = this._clients.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  constructor(http: HttpClient) {
    super(http);
  }

  loadAll(): Observable<Client[]> {
    this._isLoading.set(true);
    return this.get<Client[]>('/api/clients').pipe(
      map(items => (items ?? []).map(c => ({ ...c, createdAt: new Date(c.createdAt), updatedAt: new Date(c.updatedAt) }))),
      tap(items => {
        this._clients.set(items);
        this._isLoading.set(false);
      })
    );
  }

  getById(id: string): Observable<Client> {
    return this.get<Client>(`/api/clients/${id}`).pipe(
      map(c => ({ ...c, createdAt: new Date(c.createdAt), updatedAt: new Date(c.updatedAt) }))
    );
  }

  create(data: CreateClientRequest): Observable<Client> {
    return this.post<Client>('/api/clients', data).pipe(
      map(c => ({ ...c, createdAt: new Date(c.createdAt), updatedAt: new Date(c.updatedAt) })),
      tap(c => this._clients.update(list => [c, ...list]))
    );
  }

  update(id: string, data: UpdateClientRequest): Observable<Client> {
    return this.put<Client>(`/api/clients/${id}`, data).pipe(
      map(c => ({ ...c, createdAt: new Date(c.createdAt), updatedAt: new Date(c.updatedAt) })),
      tap(c => this._clients.update(list => list.map(x => x.id === id ? c : x)))
    );
  }

  remove(id: string): Observable<void> {
    return this.delete<void>(`/api/clients/${id}`).pipe(
      tap(() => this._clients.update(list => list.filter(x => x.id !== id)))
    );
  }
}
