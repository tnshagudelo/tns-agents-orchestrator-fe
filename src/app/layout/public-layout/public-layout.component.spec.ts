import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PublicLayoutComponent } from './public-layout.component';
import { AuthService } from '../../core/auth/auth.service';

describe('PublicLayoutComponent', () => {
  let router: Router;
  let auth: { isAuthenticated: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    auth = { isAuthenticated: vi.fn().mockReturnValue(false) };
    TestBed.configureTestingModule({
      imports: [PublicLayoutComponent],
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
    const fixture = TestBed.createComponent(PublicLayoutComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('goToLogin navigates to /auth/login', () => {
    const fixture = TestBed.createComponent(PublicLayoutComponent);
    fixture.detectChanges();
    fixture.componentInstance.goToLogin();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('goToApp navigates to /home', () => {
    const fixture = TestBed.createComponent(PublicLayoutComponent);
    fixture.detectChanges();
    fixture.componentInstance.goToApp();
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });
});
