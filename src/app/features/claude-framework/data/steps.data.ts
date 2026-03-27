import { ProjectMode, Step, TechId } from '../models/framework.types';
import { getTechnology } from './technologies.data';

export function getSteps(mode: ProjectMode, techId: TechId): Step[] {
  const tech = getTechnology(techId);
  if (!tech) return [];

  const stepsMap: Record<ProjectMode, Step[]> = {
    new: [
      {
        id: 'new-1',
        title: 'Inicializar repositorio Git',
        description: 'Crea el repositorio y haz el primer commit vacio para tener historial limpio.',
        command: 'git init && git commit --allow-empty -m "chore: init"',
        tag: 'transversal',
      },
      {
        id: 'new-2',
        title: 'Crear CLAUDE.md',
        description: 'Genera el archivo CLAUDE.md con las convenciones del stack. Ve a la pestana CLAUDE.md para copiar el template.',
        command: 'touch CLAUDE.md',
        tag: 'transversal',
      },
      {
        id: 'new-3',
        title: 'Iniciar sesion con Claude Code',
        description: 'Abre Claude Code en la raiz del proyecto para que lea CLAUDE.md automaticamente.',
        command: 'claude',
        tag: 'transversal',
      },
      {
        id: 'new-4',
        title: `Scaffold del proyecto ${tech.name}`,
        description: `Usa Claude Code para generar la estructura inicial del proyecto con ${tech.stack}.`,
        command: tech.commands['generate'] ?? tech.commands['dev'],
        tag: 'tech-specific',
      },
      {
        id: 'new-5',
        title: 'Instalar dependencias',
        description: `Instala las dependencias del proyecto con ${tech.packageManager}.`,
        command: tech.packageManager === 'npm' ? 'npm install' : 'pip install -r requirements.txt',
        tag: 'tech-specific',
      },
      {
        id: 'new-6',
        title: 'Configurar tests y escribir el primero',
        description: `Pide a Claude que configure el framework de testing y escriba un test base para validar el setup.`,
        command: tech.commands['test'],
        tag: 'tech-specific',
      },
      {
        id: 'new-7',
        title: 'Commit inicial con estructura completa',
        description: 'Haz commit de toda la estructura generada. Verifica que el build pase antes.',
        command: `${tech.commands['build']} && git add -A && git commit -m "feat: scaffold inicial ${tech.name}"`,
        tag: 'transversal',
      },
    ],
    existing: [
      {
        id: 'ext-1',
        title: 'Explorar el proyecto con Claude',
        description: 'Abre Claude Code y pidele que analice la estructura, dependencias y patrones del proyecto.',
        command: 'claude',
        tag: 'transversal',
      },
      {
        id: 'ext-2',
        title: 'Crear o actualizar CLAUDE.md',
        description: 'Genera el CLAUDE.md basado en lo que Claude descubrio del proyecto. Ajusta con las convenciones del equipo.',
        command: 'touch CLAUDE.md',
        tag: 'transversal',
      },
      {
        id: 'ext-3',
        title: 'Definir el alcance del cambio',
        description: 'Describe a Claude exactamente que quieres cambiar. Se especifico: archivos, funciones, comportamiento esperado.',
        tag: 'transversal',
      },
      {
        id: 'ext-4',
        title: 'Escribir tests del comportamiento actual',
        description: `Antes de modificar, pide a Claude que escriba tests que capturen el comportamiento actual usando ${tech.commands['test']}.`,
        command: tech.commands['test'],
        tag: 'tech-specific',
      },
      {
        id: 'ext-5',
        title: 'Implementar el cambio',
        description: `Pide a Claude que implemente el cambio siguiendo las convenciones de ${tech.name}. Revisa cada archivo modificado.`,
        tag: 'tech-specific',
      },
      {
        id: 'ext-6',
        title: 'Ejecutar tests y validar',
        description: 'Corre los tests para verificar que no hay regresiones y que el nuevo comportamiento es correcto.',
        command: `${tech.commands['test']} && ${tech.commands['build']}`,
        tag: 'tech-specific',
      },
      {
        id: 'ext-7',
        title: 'Commit y review',
        description: 'Haz commit del cambio con un mensaje descriptivo. Pide a Claude que revise el diff antes de pushear.',
        command: 'git add -A && git commit -m "feat: [descripcion del cambio]"',
        tag: 'transversal',
      },
    ],
    migration: [
      {
        id: 'mig-1',
        title: 'Auditar el estado actual',
        description: `Pide a Claude que analice el codigo fuente, dependencias desactualizadas y puntos de riesgo en el proyecto ${tech.name}.`,
        command: 'claude',
        tag: 'transversal',
      },
      {
        id: 'mig-2',
        title: 'Crear branch de migracion',
        description: 'Crea una rama dedicada para la migracion. Nunca migrar directamente en main.',
        command: 'git checkout -b migration/[descripcion]',
        tag: 'transversal',
      },
      {
        id: 'mig-3',
        title: 'Escribir contract tests',
        description: 'Antes de migrar, escribe tests que validen los contratos de entrada/salida de los modulos que vas a tocar.',
        command: tech.commands['test'],
        tag: 'tech-specific',
      },
      {
        id: 'mig-4',
        title: `Migrar modulo por modulo`,
        description: `Pide a Claude que migre un modulo a la vez siguiendo las convenciones de ${tech.name}. No migrar todo junto.`,
        tag: 'tech-specific',
      },
      {
        id: 'mig-5',
        title: 'Validar con build y tests',
        description: 'Despues de cada modulo migrado, valida que el build y los tests pasen.',
        command: `${tech.commands['build']} && ${tech.commands['test']}`,
        tag: 'tech-specific',
      },
      {
        id: 'mig-6',
        title: 'Review de la migracion',
        description: 'Pide a Claude que revise el diff completo de la migracion buscando regresiones, patrones rotos o inconsistencias.',
        tag: 'transversal',
      },
      {
        id: 'mig-7',
        title: 'Pull Request con descripcion detallada',
        description: 'Crea el PR con un resumen del impacto, modulos migrados, tests agregados y breaking changes si los hay.',
        command: 'gh pr create --title "migration: [descripcion]" --body "## Resumen\\n..."',
        tag: 'transversal',
      },
    ],
  };

  return stepsMap[mode];
}
