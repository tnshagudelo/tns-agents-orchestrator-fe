import { TechId } from '../models/framework.types';
import { getTechnology } from './technologies.data';

export function generateMultiRepoClaudeMd(techId: TechId): string {
  const tech = getTechnology(techId);
  if (!tech) return '';

  return `# CLAUDE.md — Workspace Multi-Repositorio

> Este archivo orquesta el trabajo con múltiples repos desde un directorio raíz.
> El agente lo lee automáticamente al abrir desde esta carpeta.
> Cada repo tiene su propio CLAUDE.md con detalles específicos.

## Workspace y repositorios

\`\`\`
mi-workspace/
├── CLAUDE.md                     ← este archivo (orquestador)
├── mi-backend/                   ← Repo 1: Backend
│   └── CLAUDE.md                 ← contexto específico del backend
├── mi-frontend/                  ← Repo 2: Frontend
│   └── CLAUDE.md                 ← contexto específico del frontend
└── docs/
    ├── ARCHITECTURE.md           ← diagramas y decisiones de diseño
    ├── SYSTEM_SPEC_INDEX.md      ← índice de specs por módulo
    ├── OPEN_QUESTIONS.md         ← decisiones pendientes
    └── specs/
        └── SPEC_XX_nombre.md     ← specs por módulo/dominio
\`\`\`

## Stack

| Repo | Tecnología | Puerto |
|------|-----------|--------|
| mi-backend | ${tech.stack} | :XXXX |
| mi-frontend | [stack frontend] | :4200 |

## Protocolo cross-repo (cuando la tarea toca ambos repos)

1. **DEFINIR:** Lee docs/spec_api_contracts.md y docs/spec_shared_types.md
2. **PLANIFICAR:** Lista los archivos que cambiarán en cada repo. Espera aprobación.
3. **BACKEND PRIMERO:** Implementa endpoint + tipos en mi-backend
4. **VALIDAR:** El backend debe compilar antes de tocar el frontend
5. **FRONTEND:** Implementa el service y componente en mi-frontend
6. **COMMITS:** Un commit por repo (ver regla abajo)
7. **ACTUALIZAR SPEC:** Actualiza el spec correspondiente al terminar

## Regla de commits

\`\`\`bash
# NUNCA hagas git commit desde la raíz — no es un repo git
git -C mi-backend add .
git -C mi-backend commit -m "tipo(scope): descripción"

git -C mi-frontend add .
git -C mi-frontend commit -m "tipo(scope): descripcion"
\`\`\`

## Mantenimiento de specs

- Nueva ruta o endpoint → actualizar spec de contratos API
- Nuevo tipo compartido → actualizar spec de tipos compartidos
- Cambio de arquitectura → actualizar ARCHITECTURE.md
- Los specs son la memoria del proyecto. Si no se actualizan, se vuelven inútiles.

## Carga de contexto

Al iniciar, lee docs/ARCHITECTURE.md y el spec del dominio en que vayas a trabajar.
Carga SOLO el spec relevante — nunca cargues todos los specs a la vez.
`;
}

export function generateClaudeMd(techId: TechId): string {
  const tech = getTechnology(techId);
  if (!tech) return '';

  const commandsSection = Object.entries(tech.commands)
    .map(([key, val]) => `- **${key}**: \`${val}\``)
    .join('\n');

  const conventionsSection = tech.conventions
    .map((c, i) => `${i + 1}. ${c}`)
    .join('\n');

  const restrictionsSection = tech.restrictions
    .map(r => `- ${r}`)
    .join('\n');

  return `# CLAUDE.md

> Este archivo es la fuente de verdad rápida del proyecto.
> El agente lo lee automáticamente al iniciar cada sesión.
> Mantenlo conciso — los detalles van en docs/specs/.

## Stack
${tech.stack}

## Comandos
${commandsSection}

## Convenciones
${conventionsSection}

## Restricciones
${restrictionsSection}

## Context Engineering
- Las specs de dominio están en \`docs/specs/\`
- Lee \`docs/specs/index.md\` para saber qué spec consultar según la tarea
- NO cargues todas las specs — solo las relevantes para la tarea actual
- Si una tarea modifica la arquitectura, actualiza la spec afectada

## Flujo de trabajo
1. Lee este archivo y \`docs/specs/index.md\` antes de cualquier tarea
2. Consulta solo las specs relevantes para lo que vas a hacer
3. Implementa siguiendo las convenciones de arriba
4. Valida con \`${tech.commands['test']}\` y \`${tech.commands['build']}\`
5. Si el cambio afecta la arquitectura, actualiza las specs

## Actualización de este archivo
Actualiza CLAUDE.md cuando:
- Cambien las versiones del stack
- Se agreguen o modifiquen comandos
- Se establezcan nuevas convenciones
- Se descubran restricciones nuevas
`;
}
