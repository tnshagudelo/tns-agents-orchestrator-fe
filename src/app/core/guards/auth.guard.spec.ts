import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../auth/auth.service';

describe('authGuard', () => {
  let router: { navigate: ReturnType<typeof vi.fn> };
  let auth: { isAuthenticated: () => boolean };
  let authenticated: boolean;

  beforeEach(() => {
    authenticated = false;
    router = { navigate: vi.fn() };
    auth = { isAuthenticated: () => authenticated };
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: auth },
      ],
    });
  });

  it('allows navigation when authenticated', () => {
    authenticated = true;
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/home' } as RouterStateSnapshot),
    );
    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('redirects to /auth/login with returnUrl when unauthenticated', () => {
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/secret' } as RouterStateSnapshot),
    );
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login'], {
      queryParams: { returnUrl: '/secret' },
    });
  });

  it('redirects without returnUrl when url is root', () => {
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/' } as RouterStateSnapshot),
    );
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login'], {});
  });
});
