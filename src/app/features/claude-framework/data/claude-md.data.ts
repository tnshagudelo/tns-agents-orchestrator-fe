import { TechId } from '../models/framework.types';
import { getTechnology } from './technologies.data';

export function generateClaudeMd(techId: TechId): string {
  const tech = getTechnology(techId);
  if (!tech) return '';

  const commandsSection = Object.entries(tech.commands)
    .map(([key, val]) => `- **${key}**: \`${val}\``)
    .join('\n');

  const conventionsSection = tech.conventions
    .map(c => `- ${c}`)
    .join('\n');

  const restrictionsSection = tech.restrictions
    .map(r => `- ${r}`)
    .join('\n');

  return `# CLAUDE.md — ${tech.name}

## Stack tecnologico
${tech.stack}

## Comandos del proyecto
${commandsSection}

## Convenciones de codigo
${conventionsSection}

## Restricciones
${restrictionsSection}

## Estructura de carpetas
\`\`\`
[Completa con la estructura real de tu proyecto]
src/
├── app/              # Codigo fuente principal
├── tests/            # Tests unitarios y de integracion
├── config/           # Configuracion del proyecto
└── docs/             # Documentacion interna
\`\`\`

## Flujo de trabajo con Claude Code
1. **Lee antes de escribir**: Siempre analiza el codigo existente antes de modificar
2. **Tests primero**: Escribe o verifica tests antes de implementar cambios
3. **Cambios minimos**: Haz el cambio mas pequeno posible que resuelva el problema
4. **Valida siempre**: Ejecuta \`${tech.commands['test']}\` y \`${tech.commands['build']}\` despues de cada cambio
5. **Commits atomicos**: Un commit por cambio logico, mensajes descriptivos

## Zonas de riesgo
- [Modulo critico 1 — describe por que es riesgoso]
- [Modulo critico 2 — describe las dependencias sensibles]
- [Integracion externa — API/servicio que puede fallar]

## Variables de entorno requeridas
\`\`\`
[VARIABLE_1]=valor_de_ejemplo
[VARIABLE_2]=valor_de_ejemplo
[DATABASE_URL]=postgresql://user:pass@localhost:5432/dbname
\`\`\`
`;
}
