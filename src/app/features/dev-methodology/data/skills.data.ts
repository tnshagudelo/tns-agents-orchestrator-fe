import { ProjectMode } from '../models/framework.types';
import { SkillDefinition } from '../models/framework.types';

export function getSkills(mode: ProjectMode): SkillDefinition[] {
  const common: SkillDefinition[] = [
    {
      id: 'context',
      name: 'Context',
      command: '/context',
      description: 'Muestra el uso actual de la ventana de contexto: qué archivos se cargaron, cuántos tokens se están usando y cuánto espacio queda. Útil para entender qué sabe el agente en ese momento.',
      when: 'Cuando quieras revisar qué contexto tiene cargado el agente o cuánto espacio te queda antes de llenar la ventana.',
      example: '/context',
    },
    {
      id: 'clear',
      name: 'Clear',
      command: '/clear',
      description: 'Limpia por completo la conversación y el contexto cargado. El agente empieza de cero como si abrieras una nueva sesión.',
      when: 'Cuando cambias de tarea y no quieres que el contexto anterior contamine la nueva conversación.',
      example: '/clear',
    },
    {
      id: 'compact',
      name: 'Compact',
      command: '/compact',
      description: 'Comprime la conversación actual resumiendo los intercambios previos. Mantiene lo importante pero libera tokens en la ventana de contexto para continuar trabajando.',
      when: 'Cuando la conversación es larga y estás cerca del límite de contexto, pero aún necesitas continuar sobre el mismo tema.',
      example: '/compact',
    },
    {
      id: 'commit',
      name: 'Commit',
      command: '/commit',
      description: 'Genera un commit con mensaje descriptivo basado en los cambios staged. Analiza el diff y propone un mensaje siguiendo las convenciones del proyecto.',
      when: 'Después de completar un cambio lógico que quieras guardar.',
      example: '/commit',
    },
    {
      id: 'fix',
      name: 'Fix',
      command: '/fix',
      description: 'Analiza un error o bug reportado y propone la corrección. Lee el contexto del proyecto (CLAUDE.md + specs) para alinear la solución con la arquitectura existente.',
      when: 'Cuando tienes un bug identificado y quieres que el agente lo resuelva.',
      example: '/fix El endpoint /api/clients retorna 500 cuando el campo industry es null',
    },
    {
      id: 'feature',
      name: 'Feature',
      command: '/feature',
      description: 'Implementa una funcionalidad nueva siguiendo el spec correspondiente. Lee las specs existentes, respeta las convenciones y genera código alineado con la arquitectura.',
      when: 'Cuando tienes un spec aprobado y quieres comenzar la implementación.',
      example: '/feature Implementar el módulo de notificaciones según docs/specs/notifications.md',
    },
    {
      id: 'simplify',
      name: 'Simplify',
      command: '/simplify',
      description: 'Revisa el código recién modificado buscando oportunidades de reutilización, calidad y eficiencia. Corrige lo que encuentre.',
      when: 'Después de implementar una funcionalidad, para asegurar calidad del código generado.',
    },
  ];

  const modeSkills: Record<ProjectMode, SkillDefinition[]> = {
    new: [
      {
        id: 'session-start',
        name: 'Session Start',
        command: '/project:session-start',
        description: 'Inicializa una sesión de trabajo cargando el contexto del proyecto: lee CLAUDE.md, specs relevantes y el estado actual del repositorio.',
        when: 'Al inicio de cada sesión de desarrollo para que el agente tenga todo el contexto.',
        example: '/project:session-start',
      },
      {
        id: 'sync-types',
        name: 'Sync Types',
        command: '/project:sync-types',
        description: 'Sincroniza los tipos TypeScript del frontend con los contratos definidos en shared-types.md. Asegura que los modelos del cliente estén alineados con el backend.',
        when: 'Después de modificar contratos o endpoints en la documentación.',
        example: '/project:sync-types',
      },
      ...common,
    ],
    existing: [
      {
        id: 'session-start',
        name: 'Session Start',
        command: '/project:session-start',
        description: 'Carga el contexto del proyecto existente: CLAUDE.md, specs, arquitectura. Esencial cuando el agente no conoce el proyecto.',
        when: 'Primera acción al comenzar a trabajar con un proyecto que ya tiene código.',
        example: '/project:session-start',
      },
      ...common,
      {
        id: 'sync-types',
        name: 'Sync Types',
        command: '/project:sync-types',
        description: 'Sincroniza tipos con los contratos documentados. Útil cuando documentas un proyecto existente y necesitas alinear los tipos.',
        when: 'Después de crear o actualizar los contratos en shared-types.md.',
        example: '/project:sync-types',
      },
    ],
    migration: [
      {
        id: 'session-start',
        name: 'Session Start',
        command: '/project:session-start',
        description: 'Carga el contexto de migración: CLAUDE.md, specs de migración, estado actual. Crítico para que el agente entienda qué cambió y qué falta.',
        when: 'Al inicio de cada sesión de migración.',
      },
      ...common,
      {
        id: 'sync-types',
        name: 'Sync Types',
        command: '/project:sync-types',
        description: 'Sincroniza tipos después de cambios de migración. Detecta breaking changes entre los tipos actuales y los contratos actualizados.',
        when: 'Después de migrar un módulo que afecta interfaces o contratos.',
      },
    ],
    'multi-repo': [
      {
        id: 'session-start',
        name: 'Session Start',
        command: '/project:session-start',
        description: 'Carga el contexto del workspace completo: CLAUDE.md global, CLAUDE.md del repo actual y specs compartidas. Necesario para que el agente entienda las dependencias entre repos.',
        when: 'Al inicio de cada sesión, especialmente al cambiar de repositorio.',
      },
      {
        id: 'sync-types',
        name: 'Sync Types',
        command: '/project:sync-types',
        description: 'Sincroniza tipos entre repos del workspace. Verifica que los contratos compartidos estén alineados en frontend y backend.',
        when: 'Después de modificar contratos compartidos o al cambiar de repo.',
      },
      ...common,
    ],
  };

  return modeSkills[mode];
}
