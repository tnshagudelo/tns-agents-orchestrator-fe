# CLAUDE.md — tns-agents-orchestrator-fe
# Ver reglas globales en: ../CLAUDE.md
# Ver contratos en: ../docs/spec_api_contracts.md y ../docs/spec_shared_types.md

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

## Restricciones importantes
- NO llamadas HTTP fuera de services que extiendan `BaseApiService` (en `core/services/`)
- NO `any` en TypeScript — strict mode habilitado
- NO lógica de negocio en componentes — solo en services
- NO imports entre features — solo de `shared/` y `core/`
- SSE usa `fetch()` nativo (no HttpClient) — URL hardcoded a `https://localhost:7292`
- Los tipos de respuesta del backend DEBEN coincidir con `../docs/spec_shared_types.md`

## Para agregar un nuevo feature
1. Verifica el contrato en `../docs/spec_api_contracts.md`
2. Crea/verifica el tipo en `../docs/spec_shared_types.md`
3. Crea service en `features/{feature}/services/` extendiendo `BaseApiService`
4. Crea componentes en `features/{feature}/pages/` (ruteados) y `components/` (reutilizables)
5. Crea `features/{feature}/{feature}.routes.ts` con lazy loading
6. Registra en `app.routes.ts` con `loadChildren`
7. Actualiza `../docs/spec_frontend.md` con la ruta nueva

## Comandos de este repo
```
npm start                    # ng serve en localhost:4200
npm test                     # vitest
npm run build                # ng build producción
npm run watch                # ng build --watch development
ng generate component features/{feat}/pages/{name} --standalone
ng generate service features/{feat}/services/{name}
```
