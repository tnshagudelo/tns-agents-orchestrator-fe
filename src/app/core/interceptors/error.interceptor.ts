import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthCallback = req.url.includes('/api/auth/github/callback');

      if (error.status === 401 && !isAuthCallback) {
        authService.logout();
        router.navigate(['/']);
      }
      if (error.status === 403 && !isAuthCallback) {
        router.navigate(['/forbidden']);
      }
      return throwError(() => error);
    })
  );
};
