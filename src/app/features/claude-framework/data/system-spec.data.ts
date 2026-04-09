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
      name: 'auth.spec.md',
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
        name: 'ui-patterns.spec.md',
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
        name: 'api-integration.spec.md',
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
        name: 'database.spec.md',
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
        name: 'api-endpoints.spec.md',
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

export function generateIndexMd(techId: TechId): string {
  const specs = getSpecFiles(techId);

  const entries = specs
    .map(s => `| \`${s.name}\` | ${s.purpose} |`)
    .join('\n');

  return `# system_spec/index.md

> Este archivo es el mapa de specs del proyecto.
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
