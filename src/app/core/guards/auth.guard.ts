import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  const target = state.url;
  const extras = target && target !== '/' ? { queryParams: { returnUrl: target } } : {};
  router.navigate(['/'], extras);
  return false;
};
