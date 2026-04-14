# CLAUDE.md — tns-agents-orchestrator-fe
# Ver reglas globales en: ../CLAUDE.md
# Ver contratos en: ../tns-agents-docs/contracts/api-contracts.md y ../tns-agents-docs/contracts/shared-types.md
# Ver arquitectura en: ../tns-agents-docs/architecture/ARCHITECTURE.md
# Ver specs en: ../tns-agents-docs/specs/INDEX.md
# Ver ADRs en: ../tns-agents-docs/adrs/INDEX.md

## Stack específico
- Angular 21.2.x standalone (sin NgModules) | TypeScript ~5.9.2 | RxJS ~7.8.0
- Angular Material 21.2.1 | ngx-markdown 21.1.0 | mermaid 11.13.0
- Vitest 4.0.8 | Prettier 3.8.1 | npm 11.9.0

## Convenciones específicas del frontend
- Componentes: `standalone: true` siempre. Sin `@NgModule`.
- Archivos: kebab-case con sufijo (`proposal-workpad.component.ts`, `agent.service.ts`)
- Clases: PascalCase (`ProposalWorkpadComponent`, `AgentService`)
- Selectores: `app-` + kebab-case (`app-proposal-workpad`)
- Estado: Angular Signals (`private _x = signal()` + `readonly x = this._x.asReadonly()`)
- Estilos: SCSS, 2 espacios, single quotes
- Features: cada uno en `features/{name}/` con pages/, components/, services/, models/
- Lazy loading: cada feature exporta rutas en `{feature}.routes.ts`

## Auth — cómo funciona
- Login vía GitHub OAuth: `LoginComponent` redirige a `https://localhost:7018/api/auth/github/login`
- Callback: `AuthCallbackComponent` en `/auth/callback` captura `?token=JWT` y llama `AuthService.loginWithToken()`
- `AuthService` (`core/auth/auth.service.ts`): decodifica JWT, valida expiración via claim `exp`, auto-logout
- `AuthInterceptor` (`core/interceptors/auth.interceptor.ts`): adjunta `Authorization: Bearer <token>` en todas las requests HTTP
- Token y user info en localStorage bajo claves `auth_token` y `auth_user`
- `AuthGuard` (`core/guards/auth.guard.ts`): protege todas las rutas bajo el layout principal
- NO hay mock users — el login es exclusivamente vía GitHub OAuth

## Restricciones importantes
- NO llamadas HTTP fuera de services que extiendan `BaseApiService` (en `core/services/`)
- NO `any` en TypeScript — strict mode habilitado
- NO lógica de negocio en componentes — solo en services
- NO imports entre features — solo de `shared/` y `core/`
- SSE usa `fetch()` nativo, no HttpClient (ADR-005) — URL hardcoded a `https://localhost:7292`
- Los tipos de respuesta del backend DEBEN coincidir con `../tns-agents-docs/contracts/shared-types.md`

## Para agregar un nuevo feature
1. Verifica el contrato en `../tns-agents-docs/contracts/api-contracts.md`
2. Crea/verifica el tipo en `../tns-agents-docs/contracts/shared-types.md`
3. Crea service en `features/{feature}/services/` extendiendo `BaseApiService`
4. Crea componentes en `features/{feature}/pages/` (ruteados) y `components/` (reutilizables)
5. Crea `features/{feature}/{feature}.routes.ts` con lazy loading
6. Registra en `app.routes.ts` con `loadChildren`
7. Actualiza el spec correspondiente en `../tns-agents-docs/specs/`

## Comandos de este repo
```
npm start                    # ng serve en localhost:4200
npm test                     # vitest
npm run build                # ng build producción
npm run watch                # ng build --watch development
ng generate component features/{feat}/pages/{name} --standalone
ng generate service features/{feat}/services/{name}
```
