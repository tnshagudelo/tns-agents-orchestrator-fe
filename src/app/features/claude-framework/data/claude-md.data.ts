import { TechId } from '../models/framework.types';
import { getTechnology } from './technologies.data';

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

> Este archivo es la fuente de verdad rapida del proyecto.
> El agente lo lee automaticamente al iniciar cada sesion.
> Mantenlo conciso — los detalles van en system_spec/.

## Stack
${tech.stack}

## Comandos
${commandsSection}

## Convenciones
${conventionsSection}

## Restricciones
${restrictionsSection}

## Context Engineering
- Las specs de dominio estan en \`system_spec/\`
- Lee \`system_spec/index.md\` para saber que spec consultar segun la tarea
- NO cargues todas las specs — solo las relevantes para la tarea actual
- Si una tarea modifica la arquitectura, actualiza la spec afectada

## Flujo de trabajo
1. Lee este archivo y \`system_spec/index.md\` antes de cualquier tarea
2. Consulta solo las specs relevantes para lo que vas a hacer
3. Implementa siguiendo las convenciones de arriba
4. Valida con \`${tech.commands['test']}\` y \`${tech.commands['build']}\`
5. Si el cambio afecta la arquitectura, actualiza las specs

## Actualizacion de este archivo
Actualiza CLAUDE.md cuando:
- Cambien las versiones del stack
- Se agreguen o modifiquen comandos
- Se establezcan nuevas convenciones
- Se descubran restricciones nuevas
`;
}
