import { ProjectMode, Step, TechId } from '../models/framework.types';
import { getTechnology } from './technologies.data';

export function getSteps(mode: ProjectMode, techId: TechId): Step[] {
  const tech = getTechnology(techId);
  if (!tech) return [];

  const stepsMap: Record<ProjectMode, Step[]> = {
    new: [
      {
        id: 'new-1',
        title: 'Crea CLAUDE.md en la raiz del proyecto',
        description: 'Este archivo le dice al agente QUIEN es tu proyecto: stack, comandos y reglas. El agente lo lee automaticamente cada vez que inicia.',
        tip: 'Sin CLAUDE.md el agente inventa convenciones. Con el, las respeta.',
        command: 'touch CLAUDE.md',
        tag: 'context',
      },
      {
        id: 'new-2',
        title: 'Crea la carpeta system_spec/ con el indice',
        description: 'Aqui vive el contexto profundo: specs por dominio. El indice (index.md) le dice al agente QUE spec leer segun lo que necesite, sin cargar todas.',
        tip: 'Un index.md bien escrito reduce el consumo de tokens hasta un 70% porque el agente solo lee las specs que necesita.',
        command: 'mkdir -p system_spec && touch system_spec/index.md',
        tag: 'spec',
      },
      {
        id: 'new-3',
        title: 'Escribe tu primer spec de dominio',
        description: 'Crea un archivo .spec.md para el primer modulo que vayas a construir. Describe: que hace, entidades, reglas de negocio y restricciones.',
        tip: 'Una spec de 30 lineas bien escritas vale mas que 200 lineas de explicacion verbal.',
        command: `touch system_spec/${tech.id === 'angular' || tech.id === 'react' || tech.id === 'vue' || tech.id === 'nextjs' ? 'auth.spec.md' : 'api.spec.md'}`,
        tag: 'spec',
      },
      {
        id: 'new-4',
        title: 'Inicia Claude Code y valida el contexto',
        description: 'Abre Claude Code en la raiz. Pidele que resuma lo que sabe del proyecto. Si lo explica bien, tu contexto esta funcionando.',
        tip: 'Prompt de validacion: "Resume que sabes de este proyecto, su stack y sus reglas."',
        command: 'claude',
        tag: 'validate',
      },
      {
        id: 'new-5',
        title: 'Genera el scaffold con contexto',
        description: `Pidele al agente que cree la estructura del proyecto ${tech.name}. Como ya leyo CLAUDE.md y las specs, seguira las convenciones automaticamente.`,
        tip: 'No le digas COMO hacer las cosas (eso ya esta en las specs). Dile QUE quieres que haga.',
        tag: 'context',
      },
      {
        id: 'new-6',
        title: 'Actualiza las specs con lo generado',
        description: 'Despues de generar codigo, actualiza index.md y las specs con los modulos que ahora existen. El contexto debe reflejar el estado real del proyecto.',
        tip: 'Regla de oro: cada vez que el proyecto cambia, las specs cambian. Contexto desactualizado = resultados malos.',
        tag: 'spec',
      },
    ],
    existing: [
      {
        id: 'ext-1',
        title: 'Abre Claude Code y pidele que analice el proyecto',
        description: 'El agente puede explorar la estructura, dependencias y patrones existentes. Usa esto como base para crear tus archivos de contexto.',
        tip: 'Prompt: "Analiza la estructura de este proyecto, sus dependencias y patrones. Dame un resumen."',
        command: 'claude',
        tag: 'context',
      },
      {
        id: 'ext-2',
        title: 'Crea CLAUDE.md basado en lo que descubrio',
        description: 'Toma el analisis del agente, editalo con las convenciones reales de tu equipo, y guardalo como CLAUDE.md. Este archivo es la fuente de verdad rapida.',
        tip: 'CLAUDE.md debe caber en una pantalla. Si es muy largo, mueve detalles a system_spec/.',
        command: 'touch CLAUDE.md',
        tag: 'context',
      },
      {
        id: 'ext-3',
        title: 'Crea system_spec/ con indice y specs por modulo',
        description: 'Divide el conocimiento del proyecto en specs: una por dominio o modulo. El index.md mapea cada spec a su area para que el agente no cargue todo.',
        tip: 'Empieza con 3-4 specs de los modulos mas criticos. Puedes agregar mas despues.',
        command: 'mkdir -p system_spec && touch system_spec/index.md',
        tag: 'spec',
      },
      {
        id: 'ext-4',
        title: 'Valida el contexto con una tarea real',
        description: 'Pide al agente una tarea que ya hiciste antes (un bug fix, un feature). Si genera algo similar a lo que tu hiciste, el contexto funciona.',
        tip: 'Si el resultado es muy distinto a lo esperado, revisa que specs le faltan al agente.',
        tag: 'validate',
      },
      {
        id: 'ext-5',
        title: 'Establece la rutina de actualizacion',
        description: 'Cada vez que hagas un cambio importante (nuevo modulo, nuevo patron, nueva dependencia), actualiza CLAUDE.md y la spec afectada.',
        tip: 'Agrega al Definition of Done de tu equipo: "Actualizar specs si el cambio afecta la arquitectura."',
        tag: 'spec',
      },
    ],
    migration: [
      {
        id: 'mig-1',
        title: 'Actualiza CLAUDE.md con la version destino',
        description: 'Antes de migrar, edita CLAUDE.md con las versiones nuevas, comandos actualizados y cualquier convencion que cambie con la migracion.',
        tip: 'El agente necesita saber A DONDE va la migracion, no solo de donde viene.',
        command: 'code CLAUDE.md',
        tag: 'context',
      },
      {
        id: 'mig-2',
        title: 'Crea una spec de migracion',
        description: 'Crea migration.spec.md con: version origen, version destino, breaking changes conocidos, modulos afectados y orden de migracion.',
        tip: 'Esta spec es temporal — la eliminas cuando la migracion termine.',
        command: 'touch system_spec/migration.spec.md',
        tag: 'spec',
      },
      {
        id: 'mig-3',
        title: 'Actualiza index.md con la spec de migracion',
        description: 'Agrega la entrada de migration.spec.md al indice para que el agente la encuentre cuando trabaje en tareas de la migracion.',
        tag: 'spec',
      },
      {
        id: 'mig-4',
        title: 'Migra modulo por modulo con el agente',
        description: `Pide al agente que migre un solo modulo a la vez. El contexto de las specs le dice las restricciones de ${tech.name} y el orden correcto.`,
        tip: 'Despues de migrar cada modulo, corre los tests antes de continuar con el siguiente.',
        command: tech.commands['test'],
        tag: 'validate',
      },
      {
        id: 'mig-5',
        title: 'Actualiza las specs con el estado post-migracion',
        description: 'Las specs deben reflejar la nueva realidad. Actualiza versiones, patrones y elimina migration.spec.md cuando todo este completo.',
        tip: 'Un proyecto migrado con specs desactualizadas es peor que uno sin specs — genera confusion.',
        tag: 'spec',
      },
    ],
  };

  return stepsMap[mode];
}
