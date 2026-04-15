import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { User } from '../../shared/models';

const mockUser: User = {
  id: 'u1',
  username: 'alice',
  email: 'alice@test.io',
  roles: ['user'],
  proposalRole: 'builder',
};

describe('AuthService', () => {
  let service: AuthService;
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    localStorage.clear();
    router = { navigate: vi.fn() };
    TestBed.configureTestingModule({
      providers: [AuthService, { provide: Router, useValue: router }],
    });
    service = TestBed.inject(AuthService);
  });

  it('starts unauthenticated', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(service.state().isLoading).toBe(false);
  });

  it('loginWithUser sets state, stores token/user, returns user with token', async () => {
    const result = await firstValueFrom(service.loginWithUser(mockUser));
    expect(result.token).toMatch(/^mock-jwt-u1-/);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()?.id).toBe('u1');
    expect(localStorage.getItem('auth_token')).toBe(result.token);
    expect(JSON.parse(localStorage.getItem('auth_user')!).id).toBe('u1');
  });

  it('getToken returns stored token or null', async () => {
    expect(service.getToken()).toBeNull();
    await firstValueFrom(service.loginWithUser(mockUser));
    expect(service.getToken()).toMatch(/^mock-jwt-/);
  });

  it('logout clears state, storage, and navigates to login', async () => {
    await firstValueFrom(service.loginWithUser(mockUser));
    service.logout();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('restoreSession hydrates state from storage', () => {
    localStorage.setItem('auth_token', 'tok-1');
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
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
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });
});
