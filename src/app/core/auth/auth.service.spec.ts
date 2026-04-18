import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

const url = (p: string) => `${environment.apiUrl}${p}`;

const oauthResponse = {
  token: 'jwt-123',
  githubAccessToken: 'gh-tok',
  user: {
    id: 'u1',
    username: 'alice',
    email: 'alice@test.io',
    avatarUrl: 'https://img.test/alice.png',
    groupId: 'g1',
    groupName: 'Admin',
    modules: ['home', 'security'],
  },
};

describe('AuthService', () => {
  let service: AuthService;
  let router: { navigate: ReturnType<typeof vi.fn> };
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    router = { navigate: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: router },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('starts unauthenticated', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(service.state().isLoading).toBe(false);
  });

  it('getToken returns null when nothing stored', () => {
    expect(service.getToken()).toBeNull();
  });

  it('getToken returns stored token', () => {
    localStorage.setItem('auth_token', 'tok-1');
    expect(service.getToken()).toBe('tok-1');
  });

  // ── handleOAuthCallback ───────────────────────────────────────

  it('handleOAuthCallback sets authenticated state on success', async () => {
    sessionStorage.setItem('oauth_state', 'xyz');

    const p = firstValueFrom(service.handleOAuthCallback('code-1', 'xyz'));
    httpMock.expectOne(url('/api/auth/github/callback')).flush(oauthResponse);
    const user = await p;

    expect(user.username).toBe('alice');
    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()?.id).toBe('u1');
    expect(localStorage.getItem('auth_token')).toBe('jwt-123');
    expect(localStorage.getItem('github_access_token')).toBe('gh-tok');
  });

  it('handleOAuthCallback stores user in localStorage', async () => {
    const p = firstValueFrom(service.handleOAuthCallback('code-1', 'xyz'));
    httpMock.expectOne(url('/api/auth/github/callback')).flush(oauthResponse);
    await p;

    const stored = JSON.parse(localStorage.getItem('auth_user')!);
    expect(stored.id).toBe('u1');
    expect(stored.modules).toContain('home');
  });

  it('handleOAuthCallback rejects on errorCode in response', async () => {
    const p = firstValueFrom(service.handleOAuthCallback('code-1', 'xyz'));
    httpMock.expectOne(url('/api/auth/github/callback')).flush({
      errorCode: 'PENDING_APPROVAL',
      message: 'Pendiente',
    });

    await expect(p).rejects.toMatchObject({
      error: { errorCode: 'PENDING_APPROVAL' },
    });
    expect(service.isAuthenticated()).toBe(false);
  });

  it('handleOAuthCallback rejects on HTTP error', async () => {
    const p = firstValueFrom(service.handleOAuthCallback('code-1', 'xyz'));
    httpMock.expectOne(url('/api/auth/github/callback')).flush(
      { errorCode: 'USER_REJECTED', message: 'Rechazado' },
      { status: 403, statusText: 'Forbidden' }
    );

    await expect(p).rejects.toBeDefined();
    expect(service.isAuthenticated()).toBe(false);
  });

  // ── switchProposalRole ────────────────────────────────────────

  it('switchProposalRole updates user role', async () => {
    const p = firstValueFrom(service.handleOAuthCallback('code-1', 'xyz'));
    httpMock.expectOne(url('/api/auth/github/callback')).flush(oauthResponse);
    await p;

    service.switchProposalRole('reviewer');
    expect(service.currentUser()?.proposalRole).toBe('reviewer');
    const stored = JSON.parse(localStorage.getItem('auth_user')!);
    expect(stored.proposalRole).toBe('reviewer');
  });

  it('switchProposalRole does nothing when not authenticated', () => {
    service.switchProposalRole('reviewer');
    expect(service.currentUser()).toBeNull();
  });

  // ── logout ────────────────────────────────────────────────────

  it('logout clears state, storage, and navigates to root', async () => {
    const p = firstValueFrom(service.handleOAuthCallback('code-1', 'xyz'));
    httpMock.expectOne(url('/api/auth/github/callback')).flush(oauthResponse);
    await p;

    service.logout();

    // Revocation POST (best-effort)
    httpMock.expectOne(url('/api/auth/logout')).flush(null);

    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
    expect(localStorage.getItem('github_access_token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('logout without github token does not POST revocation', () => {
    service.logout();
    httpMock.verify();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  // ── restoreSession ────────────────────────────────────────────

  it('restoreSession hydrates state from storage', () => {
    localStorage.setItem('auth_token', 'tok-1');
    localStorage.setItem('auth_user', JSON.stringify({ id: 'u1', username: 'alice' }));
    service.restoreSession();
    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()?.id).toBe('u1');
  });

  it('restoreSession does nothing when nothing stored', () => {
    service.restoreSession();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('restoreSession logs out on corrupted stored user', () => {
    localStorage.setItem('auth_token', 'tok-1');
    localStorage.setItem('auth_user', '{bad json');
    service.restoreSession();
    expect(service.isAuthenticated()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
