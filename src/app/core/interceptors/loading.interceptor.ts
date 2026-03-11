import { Injectable, signal } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private _activeRequests = 0;
  readonly isLoading = signal(false);

  increment(): void {
    this._activeRequests++;
    this.isLoading.set(true);
  }

  decrement(): void {
    this._activeRequests = Math.max(0, this._activeRequests - 1);
    if (this._activeRequests === 0) {
      this.isLoading.set(false);
    }
  }
}

export const loadingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const loadingService = inject(LoadingService);
  loadingService.increment();
  return next(req).pipe(finalize(() => loadingService.decrement()));
};
