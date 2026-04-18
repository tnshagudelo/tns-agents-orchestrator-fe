import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { SecurityService, AppUserInfo } from './security.service';
import { environment } from '../../../../environments/environment';

const url = (p: string) => `${environment.apiUrl}${p}`;

const makeUser = (overrides: Partial<AppUserInfo> = {}): AppUserInfo => ({
  id: 'u1',
  gitHubId: '123',
  username: 'testuser',
  email: 'test@example.com',
  avatarUrl: null,
  groupId: 'g1',
  groupName: 'Admin',
  status: 'active',
  createdAt: '2026-01-01T00:00:00Z',
  approvedByUserId: null,
  approvedAt: null,
  modules: [],
  ...overrides,
});

describe('SecurityService', () => {
  let svc: SecurityService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SecurityService, provideHttpClient(), provideHttpClientTesting()],
    });
    svc = TestBed.inject(SecurityService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── loadUsers ───────────────────────────────────────────────

  it('loadUsers sets users signal and pending count', async () => {
    const users = [
      makeUser({ id: 'u1', status: 'active' }),
      makeUser({ id: 'u2', status: 'pending' }),
    ];
    const p = firstValueFrom(svc.loadUsers());
    httpMock.expectOne(url('/api/security/users')).flush(users);
    await p;
    expect(svc.users()).toHaveLength(2);
    expect(svc.pendingCount()).toBe(1);
  });

  // ── deactivateUser ────────────────────────────────────────────

  it('deactivateUser updates user status in signal', async () => {
    // Seed users
    const seed = firstValueFrom(svc.loadUsers());
    httpMock.expectOne(url('/api/security/users')).flush([makeUser({ id: 'u1', status: 'active' })]);
    await seed;

    const updated = makeUser({ id: 'u1', status: 'inactive' });
    const p = firstValueFrom(svc.deactivateUser('u1'));
    httpMock.expectOne(url('/api/security/users/u1/deactivate')).flush(updated);
    await p;

    expect(svc.users()[0].status).toBe('inactive');
  });

  // ── activateUser ──────────────────────────────────────────────

  it('activateUser updates user status in signal', async () => {
    const seed = firstValueFrom(svc.loadUsers());
    httpMock.expectOne(url('/api/security/users')).flush([makeUser({ id: 'u1', status: 'inactive' })]);
    await seed;

    const updated = makeUser({ id: 'u1', status: 'active' });
    const p = firstValueFrom(svc.activateUser('u1'));
    httpMock.expectOne(url('/api/security/users/u1/activate')).flush(updated);
    await p;

    expect(svc.users()[0].status).toBe('active');
  });

  // ── removeUser ────────────────────────────────────────────────

  it('removeUser removes user from signal', async () => {
    const seed = firstValueFrom(svc.loadUsers());
    httpMock.expectOne(url('/api/security/users')).flush([makeUser({ id: 'u1', status: 'rejected' })]);
    await seed;

    const p = firstValueFrom(svc.removeUser('u1'));
    httpMock.expectOne(url('/api/security/users/u1')).flush(null);
    await p;

    expect(svc.users()).toHaveLength(0);
  });

  // ── rejectUser ────────────────────────────────────────────────

  it('rejectUser updates status and recalculates pending count', async () => {
    const seed = firstValueFrom(svc.loadUsers());
    httpMock.expectOne(url('/api/security/users')).flush([makeUser({ id: 'u1', status: 'pending' })]);
    await seed;
    expect(svc.pendingCount()).toBe(1);

    const updated = makeUser({ id: 'u1', status: 'rejected' });
    const p = firstValueFrom(svc.rejectUser('u1'));
    httpMock.expectOne(url('/api/security/users/u1/reject')).flush(updated);
    await p;

    expect(svc.users()[0].status).toBe('rejected');
    expect(svc.pendingCount()).toBe(0);
  });

  // ── approveUser ───────────────────────────────────────────────

  it('approveUser updates status and recalculates pending count', async () => {
    const seed = firstValueFrom(svc.loadUsers());
    httpMock.expectOne(url('/api/security/users')).flush([makeUser({ id: 'u1', status: 'pending' })]);
    await seed;

    const updated = makeUser({ id: 'u1', status: 'active', groupId: 'g1' });
    const p = firstValueFrom(svc.approveUser('u1', 'g1'));
    httpMock.expectOne(url('/api/security/users/u1/approve')).flush(updated);
    await p;

    expect(svc.users()[0].status).toBe('active');
    expect(svc.pendingCount()).toBe(0);
  });
});
