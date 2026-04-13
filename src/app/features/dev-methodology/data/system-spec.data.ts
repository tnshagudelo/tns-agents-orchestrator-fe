import { SpecFile, TechId } from '../models/framework.types';
import { getTechnology } from './technologies.data';

export interface SpecTip {
  icon: string;
  title: string;
  description: string;
}

export const SPEC_TIPS: SpecTip[] = [
  {
    icon: 'savings',
    title: 'Menos tokens, misma calidad',
    description: 'Con un index.md bien escrito, el agente lee solo las specs que necesita. Un proyecto con 10 specs de 50 líneas cada una consume 90% menos tokens que poner todo en un solo archivo de 500 líneas.',
  },
  {
    icon: 'sync',
    title: 'Actualiza specs cuando el proyecto cambia',
    description: 'Cada vez que agregas un módulo, cambias una regla de negocio o modificas la arquitectura, actualiza la spec afectada. Contexto desactualizado genera código incorrecto.',
  },
  {
    icon: 'rule',
    title: 'Una spec por dominio, no por archivo',
    description: 'Las specs describen dominios de negocio (auth, payments, notifications), no archivos individuales. Un dominio puede tener 20 archivos pero una sola spec de 30 líneas.',
  },
  {
    icon: 'visibility_off',
    title: 'El agente no necesita saber todo',
    description: 'Si le pides corregir un bug en "pagos", solo necesita la spec de pagos. Cargar specs de "notificaciones" y "reportes" es gasto de tokens sin beneficio.',
  },
  {
    icon: 'edit_note',
    title: 'Specs cortas y concretas',
    description: 'Cada spec debe tener entre 20-60 líneas. Si supera 80 líneas, probablemente mezcla dos dominios y debe dividirse.',
  },
];

export function getSpecFiles(techId: TechId): SpecFile[] {
  const tech = getTechnology(techId);
  if (!tech) return [];

  const isFrontend = ['angular', 'react', 'vue', 'nextjs'].includes(techId);
  const isBackend = ['nestjs', 'express', 'fastapi', 'django'].includes(techId);

  const common: SpecFile[] = [
    {
      name: 'auth.md',
      purpose: 'Autenticación y autorización: flujos de login, roles, permisos, manejo de tokens',
      example: `# Auth

## Propósito
Manejo de autenticación JWT y autorización basada en roles.

## Entidades
- User: id, email, passwordHash, role, createdAt
- Session: id, userId, token, expiresAt

## Reglas de negocio
1. Los tokens expiran en 24 horas
2. Refresh token tiene validez de 7 dias
3. Máximo 3 sesiones activas por usuario
4. Roles: admin, editor, viewer

## Restricciones
- No almacenar passwords en texto plano
- No exponer tokens en URLs
- No permitir escalación de privilegios`,
    },
  ];

  if (isFrontend) {
    common.push(
      {
        name: 'ui-patterns.md',
        purpose: 'Patrones de UI, componentes compartidos, sistema de diseño y manejo de estado',
        example: `# UI Patterns

## Propósito
Convenciones de interfaz y componentes reutilizables.

## Estado
- Estado local: signals / useState
- Estado global: service con signals / store
- No duplicar estado entre componentes

## Componentes compartidos
- StatusBadge: muestra estado con color semántico
- LoadingSpinner: overlay global durante peticiones HTTP
- NotificationToast: feedback al usuario (success, error, warning)

## Restricciones
- No usar estilos inline en el template
- No crear componentes de más de 300 líneas`,
      },
      {
        name: 'api-integration.md',
        purpose: 'Contratos de API, endpoints consumidos, manejo de errores HTTP',
        example: `# API Integration

## Propósito
Comunicación con el backend vía REST API.

## Base URL
- Dev: https://localhost:7018
- Prod: /api

## Autenticación
Bearer token en header Authorization

## Manejo de errores
- 401: redirigir a login
- 403: mostrar mensaje de permisos
- 500: toast de error genérico

## Restricciones
- No hacer fetch directo — usar el servicio base
- No hardcodear URLs`,
      },
    );
  }

  if (isBackend) {
    common.push(
      {
        name: 'database.md',
        purpose: 'Modelo de datos, migraciones, índices y restricciones de base de datos',
        example: `# Database

## Propósito
Esquema de base de datos y reglas de acceso a datos.

## Motor
PostgreSQL 16

## Migraciones
- Comando: ${tech.commands['migrate'] ?? 'npm run migrate'}
- Siempre crear migración antes de cambiar el esquema

## Restricciones
- No hacer queries raw sin justificación
- No eliminar columnas sin migración de datos
- Índices obligatorios en foreign keys`,
      },
      {
        name: 'api-endpoints.md',
        purpose: 'Definición de endpoints, validaciones de entrada/salida, códigos de respuesta',
        example: `# API Endpoints

## Propósito
Contratos de la API REST.

## Convenciones
- Versionado: /api/v1/
- Formato: JSON
- Paginación: ?page=1&pageSize=20

## Validación
- Request: validar con ${tech.id === 'nestjs' ? 'class-validator DTOs' : tech.id === 'fastapi' ? 'Pydantic models' : tech.id === 'django' ? 'DRF Serializers' : 'Zod schemas'}
- Response: siempre tipado, nunca any

## Restricciones
- No poner lógica de negocio en controllers
- No retornar entidades de BD directamente`,
      },
    );
  }

  return common;
}

export function getMultiRepoSpecFiles(): SpecFile[] {
  return [
    {
      name: 'ARCHITECTURE.md',
      purpose: 'Diagramas de estructura, pipeline de agentes, estados, flujo de polling y decisiones de diseño',
      example: `# ARCHITECTURE.md

## Visión general
[Descripción del sistema y cómo interactúan los repos]

## Diagramas (mermaid)
- Estructura del sistema
- Pipeline de procesamiento
- Máquina de estados
- Flujo de polling frontend → backend

## Decisiones de diseño
### D1 — [Nombre de la decisión]
- **Decisión:** [qué se decidió]
- **Justificación:** [por qué]
- **Alternativas descartadas:** [qué se consideró y por qué no]`,
    },
    {
      name: 'SYSTEM_SPEC_INDEX.md',
      purpose: 'Índice de todos los specs del proyecto con estado y orden de implementación',
      example: `# SYSTEM_SPEC_INDEX.md

| Spec | Módulo | Estado | Última actualización |
|------|--------|--------|---------------------|
| SPEC_01 | Dominio y entidades | Implementado | 2026-04-09 |
| SPEC_02 | Sistema de jobs | Implementado | 2026-04-09 |
| SPEC_03 | CRUD Clientes | Pendiente | — |`,
    },
    {
      name: 'OPEN_QUESTIONS.md',
      purpose: 'Preguntas técnicas y de negocio pendientes de resolver — el agente NO debe asumir respuestas',
      example: `# OPEN_QUESTIONS.md

### OQ-01 — ¿Qué API de búsqueda web usar?
- **Contexto:** Se necesita buscar info pública de empresas
- **Opciones:** Bing Search API, Google Custom Search, Tavily
- **Estado:** Pendiente — depende de presupuesto

### OQ-02 — ¿Intervalo de polling recomendado?
- **Estado:** Resuelto — 5 segundos
- **Fecha:** 2026-04-09`,
    },
    {
      name: 'specs/SPEC_XX_nombre.md',
      purpose: 'Spec por módulo — uno por cada dominio funcional, con archivos de ambos repos',
      example: `# SPEC_XX — [Nombre del módulo]
**Estado:** Implementado / En progreso / Pendiente
**Última actualización:** fecha

## Qué hace
[Descripción breve]

## Archivos relevantes (rutas completas)
### Backend
- mi-backend/Domain/Entities/MiEntidad.cs
- mi-backend/Application/Services/MiServicio.cs
### Frontend
- mi-frontend/src/app/features/mi-feature/

## Endpoints expuestos
| Método | Ruta | Descripción |
|--------|------|-------------|

## Decisiones técnicas tomadas
## Pendientes / deuda técnica conocida`,
    },
  ];
}

export const MULTI_REPO_TIPS: SpecTip[] = [
  {
    icon: 'account_tree',
    title: 'Un CLAUDE.md por nivel',
    description: 'El CLAUDE.md de la raíz orquesta (reglas cross-repo, estructura, protocolo). El CLAUDE.md de cada repo ejecuta (stack, comandos, convenciones). No dupliques información entre ellos.',
  },
  {
    icon: 'sync_alt',
    title: 'Protocolo cross-repo obligatorio',
    description: 'Sin protocolo, el agente genera endpoints con un contrato y el frontend espera otro. Define el orden: leer contratos → backend primero → validar build → frontend después → actualizar spec.',
  },
  {
    icon: 'folder_shared',
    title: 'docs/ es la memoria compartida',
    description: 'Los specs en docs/ son la fuente de verdad para contratos entre repos. Si un endpoint cambia en el backend, el spec debe actualizarse ANTES de que el frontend lo consuma.',
  },
  {
    icon: 'commit',
    title: 'Un commit por repo, nunca desde la raíz',
    description: 'La raíz NO es un repo git. Si el agente intenta hacer commit ahí, fallará. Cada repo tiene su historial independiente. Usa git -C <repo> para operaciones git.',
  },
  {
    icon: 'rule',
    title: 'Specs con rutas de ambos repos',
    description: 'Un spec de módulo debe listar los archivos relevantes de AMBOS repos. Esto le dice al agente exactamente dónde buscar cuando trabaja en ese módulo.',
  },
];

export function generateMultiRepoIndexMd(): string {
  const specs = getMultiRepoSpecFiles();
  const entries = specs
    .map(s => `| \`${s.name}\` | ${s.purpose} |`)
    .join('\n');

  return `# docs/SYSTEM_SPEC_INDEX.md

> Índice de specs del workspace multi-repo.
> Cada spec documenta un módulo con archivos de ambos repos.
> El agente lee este índice para saber qué spec consultar según la tarea.

## Cómo usar este índice
1. Lee este archivo al inicio de cada tarea
2. Identifica qué módulo(s) toca tu tarea
3. Lee SOLO los specs de esos módulos
4. Si implementas un módulo nuevo, crea su spec y actualiza este índice

## Mapa de documentos

| Archivo | Qué describe |
|---------|-------------|
${entries}

## Reglas de mantenimiento
- Cada tarea que cambia la arquitectura → actualizar ARCHITECTURE.md
- Cada nuevo endpoint o tipo compartido → actualizar el spec del módulo
- Cada decisión pendiente → agregarla a OPEN_QUESTIONS.md
- Los specs son la memoria del proyecto — si no se actualizan, el agente asume
`;
}

export function generateIndexMd(techId: TechId): string {
  const specs = getSpecFiles(techId);

  const entries = specs
    .map(s => `| \`${s.name}\` | ${s.purpose} |`)
    .join('\n');

  return `# docs/specs/index.md

> Este archivo es el mapa de design docs del proyecto.
> El agente lo lee para saber QUÉ spec consultar según la tarea.
> NO cargues todas las specs — solo las que necesitas.

## Cómo usar este índice
1. Lee este archivo al inicio de cada tarea
2. Identifica qué dominio(s) toca tu tarea
3. Lee SOLO las specs de esos dominios
4. Si necesitas crear un módulo nuevo, crea su spec y actualiza este índice

## Mapa de specs

| Archivo | Qué describe |
|---------|-------------|
${entries}

## Reglas de mantenimiento
- Agregar entrada cuando se crea una spec nueva
- Eliminar entrada cuando un módulo se elimina
- Actualizar la descripción si el propósito del módulo cambia
- Mantener ordenado alfabéticamente
`;
}
