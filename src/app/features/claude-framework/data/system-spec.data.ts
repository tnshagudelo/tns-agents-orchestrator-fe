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
    description: 'Con un index.md bien escrito, el agente lee solo las specs que necesita. Un proyecto con 10 specs de 50 lineas cada una consume 90% menos tokens que poner todo en un solo archivo de 500 lineas.',
  },
  {
    icon: 'sync',
    title: 'Actualiza specs cuando el proyecto cambia',
    description: 'Cada vez que agregas un modulo, cambias una regla de negocio o modificas la arquitectura, actualiza la spec afectada. Contexto desactualizado genera codigo incorrecto.',
  },
  {
    icon: 'rule',
    title: 'Una spec por dominio, no por archivo',
    description: 'Las specs describen dominios de negocio (auth, payments, notifications), no archivos individuales. Un dominio puede tener 20 archivos pero una sola spec de 30 lineas.',
  },
  {
    icon: 'visibility_off',
    title: 'El agente no necesita saber todo',
    description: 'Si le pides corregir un bug en "pagos", solo necesita la spec de pagos. Cargar specs de "notificaciones" y "reportes" es gasto de tokens sin beneficio.',
  },
  {
    icon: 'edit_note',
    title: 'Specs cortas y concretas',
    description: 'Cada spec debe tener entre 20-60 lineas. Si supera 80 lineas, probablemente mezcla dos dominios y debe dividirse.',
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
      purpose: 'Autenticacion y autorizacion: flujos de login, roles, permisos, manejo de tokens',
      example: `# Auth

## Proposito
Manejo de autenticacion JWT y autorizacion basada en roles.

## Entidades
- User: id, email, passwordHash, role, createdAt
- Session: id, userId, token, expiresAt

## Reglas de negocio
1. Los tokens expiran en 24 horas
2. Refresh token tiene validez de 7 dias
3. Maximo 3 sesiones activas por usuario
4. Roles: admin, editor, viewer

## Restricciones
- No almacenar passwords en texto plano
- No exponer tokens en URLs
- No permitir escalacion de privilegios`,
    },
  ];

  if (isFrontend) {
    common.push(
      {
        name: 'ui-patterns.md',
        purpose: 'Patrones de UI, componentes compartidos, sistema de diseno y manejo de estado',
        example: `# UI Patterns

## Proposito
Convenciones de interfaz y componentes reutilizables.

## Estado
- Estado local: signals / useState
- Estado global: service con signals / store
- No duplicar estado entre componentes

## Componentes compartidos
- StatusBadge: muestra estado con color semantico
- LoadingSpinner: overlay global durante peticiones HTTP
- NotificationToast: feedback al usuario (success, error, warning)

## Restricciones
- No usar estilos inline en el template
- No crear componentes de mas de 300 lineas`,
      },
      {
        name: 'api-integration.md',
        purpose: 'Contratos de API, endpoints consumidos, manejo de errores HTTP',
        example: `# API Integration

## Proposito
Comunicacion con el backend via REST API.

## Base URL
- Dev: https://localhost:7018
- Prod: /api

## Autenticacion
Bearer token en header Authorization

## Manejo de errores
- 401: redirigir a login
- 403: mostrar mensaje de permisos
- 500: toast de error generico

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
        purpose: 'Modelo de datos, migraciones, indices y restricciones de base de datos',
        example: `# Database

## Proposito
Esquema de base de datos y reglas de acceso a datos.

## Motor
PostgreSQL 16

## Migraciones
- Comando: ${tech.commands['migrate'] ?? 'npm run migrate'}
- Siempre crear migracion antes de cambiar el esquema

## Restricciones
- No hacer queries raw sin justificacion
- No eliminar columnas sin migracion de datos
- Indices obligatorios en foreign keys`,
      },
      {
        name: 'api-endpoints.md',
        purpose: 'Definicion de endpoints, validaciones de entrada/salida, codigos de respuesta',
        example: `# API Endpoints

## Proposito
Contratos de la API REST.

## Convenciones
- Versionado: /api/v1/
- Formato: JSON
- Paginacion: ?page=1&pageSize=20

## Validacion
- Request: validar con ${tech.id === 'nestjs' ? 'class-validator DTOs' : tech.id === 'fastapi' ? 'Pydantic models' : tech.id === 'django' ? 'DRF Serializers' : 'Zod schemas'}
- Response: siempre tipado, nunca any

## Restricciones
- No poner logica de negocio en controllers
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
      purpose: 'Diagramas de estructura, pipeline de agentes, estados, flujo de polling y decisiones de diseno',
      example: `# ARCHITECTURE.md

## Vision general
[Descripcion del sistema y como interactuan los repos]

## Diagramas (mermaid)
- Estructura del sistema
- Pipeline de procesamiento
- Maquina de estados
- Flujo de polling frontend → backend

## Decisiones de diseno
### D1 — [Nombre de la decision]
- **Decision:** [que se decidio]
- **Justificacion:** [por que]
- **Alternativas descartadas:** [que se considero y por que no]`,
    },
    {
      name: 'SYSTEM_SPEC_INDEX.md',
      purpose: 'Indice de todos los specs del proyecto con estado y orden de implementacion',
      example: `# SYSTEM_SPEC_INDEX.md

| Spec | Modulo | Estado | Ultima actualizacion |
|------|--------|--------|---------------------|
| SPEC_01 | Dominio y entidades | Implementado | 2026-04-09 |
| SPEC_02 | Sistema de jobs | Implementado | 2026-04-09 |
| SPEC_03 | CRUD Clientes | Pendiente | — |`,
    },
    {
      name: 'OPEN_QUESTIONS.md',
      purpose: 'Preguntas tecnicas y de negocio pendientes de resolver — el agente NO debe asumir respuestas',
      example: `# OPEN_QUESTIONS.md

### OQ-01 — Que API de busqueda web usar?
- **Contexto:** Se necesita buscar info publica de empresas
- **Opciones:** Bing Search API, Google Custom Search, Tavily
- **Estado:** Pendiente — depende de presupuesto

### OQ-02 — Intervalo de polling recomendado?
- **Estado:** Resuelto — 5 segundos
- **Fecha:** 2026-04-09`,
    },
    {
      name: 'specs/SPEC_XX_nombre.md',
      purpose: 'Spec por modulo — uno por cada dominio funcional, con archivos de ambos repos',
      example: `# SPEC_XX — [Nombre del modulo]
**Estado:** Implementado / En progreso / Pendiente
**Ultima actualizacion:** fecha

## Que hace
[Descripcion breve]

## Archivos relevantes (rutas completas)
### Backend
- mi-backend/Domain/Entities/MiEntidad.cs
- mi-backend/Application/Services/MiServicio.cs
### Frontend
- mi-frontend/src/app/features/mi-feature/

## Endpoints expuestos
| Metodo | Ruta | Descripcion |
|--------|------|-------------|

## Decisiones tecnicas tomadas
## Pendientes / deuda tecnica conocida`,
    },
  ];
}

export const MULTI_REPO_TIPS: SpecTip[] = [
  {
    icon: 'account_tree',
    title: 'Un CLAUDE.md por nivel',
    description: 'El CLAUDE.md de la raiz orquesta (reglas cross-repo, estructura, protocolo). El CLAUDE.md de cada repo ejecuta (stack, comandos, convenciones). No dupliques informacion entre ellos.',
  },
  {
    icon: 'sync_alt',
    title: 'Protocolo cross-repo obligatorio',
    description: 'Sin protocolo, Claude genera endpoints con un contrato y el frontend espera otro. Define el orden: leer contratos → backend primero → validar build → frontend despues → actualizar spec.',
  },
  {
    icon: 'folder_shared',
    title: 'docs/ es la memoria compartida',
    description: 'Los specs en docs/ son la fuente de verdad para contratos entre repos. Si un endpoint cambia en el backend, el spec debe actualizarse ANTES de que el frontend lo consuma.',
  },
  {
    icon: 'commit',
    title: 'Un commit por repo, nunca desde la raiz',
    description: 'La raiz NO es un repo git. Si Claude intenta hacer commit ahi, fallara. Cada repo tiene su historial independiente. Usa git -C <repo> para operaciones git.',
  },
  {
    icon: 'rule',
    title: 'Specs con rutas de ambos repos',
    description: 'Un spec de modulo debe listar los archivos relevantes de AMBOS repos. Esto le dice a Claude exactamente donde buscar cuando trabaja en ese modulo.',
  },
];

export function generateMultiRepoIndexMd(): string {
  const specs = getMultiRepoSpecFiles();
  const entries = specs
    .map(s => `| \`${s.name}\` | ${s.purpose} |`)
    .join('\n');

  return `# docs/SYSTEM_SPEC_INDEX.md

> Indice de specs del workspace multi-repo.
> Cada spec documenta un modulo con archivos de ambos repos.
> Claude lee este indice para saber que spec consultar segun la tarea.

## Como usar este indice
1. Lee este archivo al inicio de cada tarea
2. Identifica que modulo(s) toca tu tarea
3. Lee SOLO los specs de esos modulos
4. Si implementas un modulo nuevo, crea su spec y actualiza este indice

## Mapa de documentos

| Archivo | Que describe |
|---------|-------------|
${entries}

## Reglas de mantenimiento
- Cada tarea que cambia la arquitectura → actualizar ARCHITECTURE.md
- Cada nuevo endpoint o tipo compartido → actualizar el spec del modulo
- Cada decision pendiente → agregarla a OPEN_QUESTIONS.md
- Los specs son la memoria del proyecto — si no se actualizan, Claude asume
`;
}

export function generateIndexMd(techId: TechId): string {
  const specs = getSpecFiles(techId);

  const entries = specs
    .map(s => `| \`${s.name}\` | ${s.purpose} |`)
    .join('\n');

  return `# docs/specs/index.md

> Este archivo es el mapa de design docs del proyecto.
> El agente lo lee para saber QUE spec consultar segun la tarea.
> NO cargues todas las specs — solo las que necesitas.

## Como usar este indice
1. Lee este archivo al inicio de cada tarea
2. Identifica que dominio(s) toca tu tarea
3. Lee SOLO las specs de esos dominios
4. Si necesitas crear un modulo nuevo, crea su spec y actualiza este indice

## Mapa de specs

| Archivo | Que describe |
|---------|-------------|
${entries}

## Reglas de mantenimiento
- Agregar entrada cuando se crea una spec nueva
- Eliminar entrada cuando un modulo se elimina
- Actualizar la descripcion si el proposito del modulo cambia
- Mantener ordenado alfabeticamente
`;
}
