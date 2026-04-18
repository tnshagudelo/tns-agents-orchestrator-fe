import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { BaseApiService } from '../../../core/services/base-api.service';

// ── Models ──────────────────────────────────────────────────────────────────

export interface SecurityGroup {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  modules: string[];
}

export interface AppUserInfo {
  id: string;
  gitHubId: string;
  username: string;
  email: string | null;
  avatarUrl: string | null;
  groupId: string | null;
  groupName: string | null;
  status: 'pending' | 'active' | 'rejected' | 'inactive';
  createdAt: string;
  approvedByUserId: string | null;
  approvedAt: string | null;
  modules: string[];
}

export interface ModuleInfo {
  key: string;
  label: string;
  icon: string;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  modules: string[];
}

export interface UpdateGroupRequest {
  name: string;
  description?: string;
  isActive: boolean;
  modules: string[];
}

// ── Service ─────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class SecurityService extends BaseApiService {
  private readonly _groups = signal<SecurityGroup[]>([]);
  private readonly _users = signal<AppUserInfo[]>([]);
  private readonly _modules = signal<ModuleInfo[]>([]);
  private readonly _pendingCount = signal(0);

  readonly groups = this._groups.asReadonly();
  readonly users = this._users.asReadonly();
  readonly modules = this._modules.asReadonly();
  readonly pendingCount = this._pendingCount.asReadonly();

  constructor(http: HttpClient) {
    super(http);
  }

  // ── Groups ──────────────────────────────────────────────
  loadGroups(): Observable<SecurityGroup[]> {
    return this.get<SecurityGroup[]>('/api/security/groups').pipe(
      tap(groups => this._groups.set(groups))
    );
  }

  createGroup(request: CreateGroupRequest): Observable<SecurityGroup> {
    return this.post<SecurityGroup>('/api/security/groups', request).pipe(
      tap(group => this._groups.update(list => [...list, group]))
    );
  }

  updateGroup(id: string, request: UpdateGroupRequest): Observable<SecurityGroup> {
    return this.put<SecurityGroup>(`/api/security/groups/${id}`, request).pipe(
      tap(updated =>
        this._groups.update(list =>
          list.map(g => (g.id === updated.id ? updated : g))
        )
      )
    );
  }

  deleteGroup(id: string): Observable<void> {
    return this.delete<void>(`/api/security/groups/${id}`).pipe(
      tap(() => this._groups.update(list => list.filter(g => g.id !== id)))
    );
  }

  // ── Users ───────────────────────────────────────────────
  loadUsers(): Observable<AppUserInfo[]> {
    return this.get<AppUserInfo[]>('/api/security/users').pipe(
      tap(users => {
        this._users.set(users);
        this._pendingCount.set(users.filter(u => u.status === 'pending').length);
      })
    );
  }

  approveUser(id: string, groupId: string): Observable<AppUserInfo> {
    return this.post<AppUserInfo>(`/api/security/users/${id}/approve`, { groupId }).pipe(
      tap(updated => {
        this._users.update(list => list.map(u => (u.id === updated.id ? updated : u)));
        this._pendingCount.set(this._users().filter(u => u.status === 'pending').length);
      })
    );
  }

  rejectUser(id: string): Observable<AppUserInfo> {
    return this.post<AppUserInfo>(`/api/security/users/${id}/reject`, {}).pipe(
      tap(updated => {
        this._users.update(list => list.map(u => (u.id === updated.id ? updated : u)));
        this._pendingCount.set(this._users().filter(u => u.status === 'pending').length);
      })
    );
  }

  deactivateUser(id: string): Observable<AppUserInfo> {
    return this.post<AppUserInfo>(`/api/security/users/${id}/deactivate`, {}).pipe(
      tap(updated => {
        this._users.update(list => list.map(u => (u.id === updated.id ? updated : u)));
      })
    );
  }

  activateUser(id: string): Observable<AppUserInfo> {
    return this.post<AppUserInfo>(`/api/security/users/${id}/activate`, {}).pipe(
      tap(updated => {
        this._users.update(list => list.map(u => (u.id === updated.id ? updated : u)));
      })
    );
  }

  removeUser(id: string): Observable<void> {
    return this.delete<void>(`/api/security/users/${id}`).pipe(
      tap(() => {
        this._users.update(list => list.filter(u => u.id !== id));
      })
    );
  }

  changeUserGroup(id: string, groupId: string): Observable<AppUserInfo> {
    return this.put<AppUserInfo>(`/api/security/users/${id}/group`, { groupId }).pipe(
      tap(updated =>
        this._users.update(list => list.map(u => (u.id === updated.id ? updated : u)))
      )
    );
  }

  // ── Modules ─────────────────────────────────────────────
  loadModules(): Observable<ModuleInfo[]> {
    return this.get<ModuleInfo[]>('/api/security/modules').pipe(
      tap(modules => this._modules.set(modules))
    );
  }
}
