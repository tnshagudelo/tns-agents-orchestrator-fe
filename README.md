# tns-agents-orchestrator-fe

Frontend para orquestación de agentes de IA — construido con **Angular 21**, **Angular Material** y arquitectura modular robusta.

---

## Arquitectura

```
src/
├── app/
│   ├── core/                          # Servicios singleton (auth, interceptores, guardias)
│   │   ├── auth/
│   │   │   └── auth.service.ts        # Gestión de sesión con Angular Signals
│   │   ├── guards/
│   │   │   └── auth.guard.ts          # Guardia de rutas privadas
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts    # Inyección de token JWT
│   │   │   ├── error.interceptor.ts   # Manejo global de errores HTTP
│   │   │   └── loading.interceptor.ts # Indicador global de carga
│   │   └── services/
│   │       ├── base-api.service.ts    # Servicio HTTP base genérico
│   │       └── notification.service.ts# Servicio de notificaciones toast
│   ├── shared/                        # Componentes, modelos y utilidades reutilizables
│   │   ├── components/
│   │   │   ├── status-badge/          # Badge de estado de agentes/pipelines
│   │   │   ├── loading-spinner/       # Spinner global de carga
│   │   │   └── notification-toast/    # Toast de notificaciones
│   │   └── models/
│   │       ├── agent.model.ts         # Tipos e interfaces de agentes
│   │       ├── auth.model.ts          # Tipos de autenticación
│   │       ├── common.model.ts        # Tipos comunes (logs, métricas, paginación)
│   │       └── pipeline.model.ts      # Tipos de pipelines/orquestación
│   ├── features/                      # Módulos de funcionalidad (lazy-loaded)
│   │   ├── auth/                      # Login y autenticación
│   │   ├── dashboard/                 # Tablero principal con KPIs
│   │   ├── agents/                    # Gestión de agentes (lista, detalle, creación)
│   │   ├── orchestration/             # Tablero de pipelines de orquestación
│   │   ├── monitoring/                # Dashboard de monitoreo y logs en tiempo real
│   │   └── settings/                  # Configuración de API y preferencias
│   └── layout/                        # Shell de la aplicación
│       ├── header/                    # Barra superior con notificaciones y usuario
│       ├── sidebar/                   # Menú lateral colapsable
│       └── main-layout/               # Layout principal con router-outlet
└── environments/
    ├── environment.ts                 # Configuración de desarrollo
    └── environment.prod.ts            # Configuración de producción
```

---

## Características principales

- ✅ **Angular 21** con componentes standalone
- ✅ **Angular Material** para UI moderna
- ✅ **Angular Signals** para gestión de estado reactivo
- ✅ **Lazy loading** en todos los módulos de funcionalidad
- ✅ **Autenticación JWT** con interceptor automático
- ✅ **Guardia de rutas** para secciones privadas
- ✅ **Manejo global de errores** HTTP
- ✅ **Notificaciones toast** centralizadas
- ✅ **Sidebar colapsable** con navegación por íconos
- ✅ **Dashboard** con KPIs de agentes y pipelines
- ✅ **Gestión de agentes**: lista, detalle, creación con formulario reactivo
- ✅ **Orquestación**: tablero de pipelines con estado y acciones
- ✅ **Monitoreo**: métricas en tiempo real y visor de logs
- ✅ **Configuración**: ajustes de API y preferencias

---

## Tecnologías

| Tecnología         | Versión   | Propósito                    |
|--------------------|-----------|------------------------------|
| Angular            | ^21.2.0   | Framework principal          |
| Angular Material   | ^21.x     | Componentes UI               |
| Angular CDK        | ^21.x     | Primitivas de componentes    |
| TypeScript         | ~5.8.x    | Tipado estático              |
| SCSS               | —         | Estilos con anidamiento      |
| Vitest             | ^4.x      | Testing                      |

---

## Inicio rápido

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm start          # http://localhost:4200

# Compilar para producción
npm run build

# Ejecutar tests
npm test
```

---

## Configuración de entorno

Edita `src/environments/environment.ts` para apuntar a tu backend:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',   // URL base de la API REST
  wsUrl: 'ws://localhost:3000/ws',        // URL del WebSocket para monitoreo
  appVersion: '1.0.0',
};
```

---

## Extensión del template

Para agregar un nuevo módulo de funcionalidad:

1. Crear directorio en `src/app/features/<nombre>/`
2. Agregar `<nombre>.routes.ts` con lazy-loaded routes
3. Crear servicio extendiendo `BaseApiService`
4. Registrar ruta en `app.routes.ts`
