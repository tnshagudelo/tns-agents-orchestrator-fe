import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { MarkdownModule, MarkedRenderer, MARKED_OPTIONS } from 'ngx-markdown';

function markedOptionsFactory() {
  const renderer = new MarkedRenderer();

  // Pasa el contenido de bloques mermaid sin escapar HTML — fix para --> vs --&gt;
  const defaultCode = renderer.code.bind(renderer);
  renderer.code = (token) => {
    if (token.lang === 'mermaid') {
      return `<div class="mermaid">${token.text}</div>`;
    }
    return defaultCode(token);
  };

  return { renderer };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimationsAsync(),
    importProvidersFrom(
      MarkdownModule.forRoot({
        markedOptions: {
          provide: MARKED_OPTIONS,
          useFactory: markedOptionsFactory,
        },
      }),
    ),
  ],
};

