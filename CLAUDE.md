# CLAUDE.md — tns-agents-orchestrator-fe
# Reglas globales en: ../CLAUDE.md

## Stack
- Angular 21.2.x standalone (sin NgModules) | TypeScript ~5.9 | RxJS ~7.8
- Angular Material 21.2 | ngx-markdown 21.1 | mermaid 11.13
- Vitest 4.0 | Prettier 3.8
- i18n: TranslationService + TranslatePipe (`assets/i18n/es.json`, `en.json`)

## Convenciones
- Componentes: `standalone: true` siempre
- Archivos: kebab-case con sufijo (`client-list.component.ts`)
- Clases: PascalCase. Selectores: `app-` + kebab-case
- Estado: Angular Signals (`signal()` + `asReadonly()`)
- Estilos: SCSS, 2 espacios
- Features: `features/{name}/` con pages/, components/, services/, models/
- Lazy loading: `{feature}.routes.ts`
- Traducciones: `{{ 'key' | translate }}` en templates

## Restricciones
- NO llamadas HTTP fuera de services que extiendan `BaseApiService`
- NO `any` en TypeScript — strict mode
- NO logica de negocio en componentes — solo en services
- NO imports entre features — solo de `shared/` y `core/`
- SSE usa `fetch()` nativo, no HttpClient (ADR-005)
- Tipos DEBEN coincidir con `../tns-agents-docs/contracts/shared-types.md`

## Agregar un feature
1. Verifica contrato en `../tns-agents-docs/contracts/api-contracts.md`
2. Crea/verifica tipos en `../tns-agents-docs/contracts/shared-types.md`
3. Service en `features/{feature}/services/` extendiendo `BaseApiService`
4. Componentes en `pages/` (ruteados) y `components/` (reutilizables)
5. Rutas en `{feature}.routes.ts` con lazy loading
6. Registra en `app.routes.ts`
7. Actualiza el spec

## Comandos
```
npm start          # ng serve localhost:4200
npm test           # vitest
npm run build      # build produccion
```
