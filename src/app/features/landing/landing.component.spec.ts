import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { LandingComponent } from './landing.component';
import { AuthService } from '../../core/auth/auth.service';

describe('LandingComponent', () => {
  let router: Router;
  let auth: { isAuthenticated: ReturnType<typeof vi.fn>; loginWithGitHub: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    auth = {
      isAuthenticated: vi.fn().mockReturnValue(false),
      loginWithGitHub: vi.fn(),
    };
    TestBed.configureTestingModule({
      imports: [LandingComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
      ],
    });
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('sets currentYear to current year', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    expect(fixture.componentInstance.currentYear).toBe(new Date().getFullYear());
  });

  it('redirects to /home if already authenticated on init', () => {
    auth.isAuthenticated.mockReturnValue(true);
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('does not redirect if not authenticated', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('loginWithGitHub calls authService.loginWithGitHub', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();
    fixture.componentInstance.loginWithGitHub();
    expect(auth.loginWithGitHub).toHaveBeenCalled();
  });
});
