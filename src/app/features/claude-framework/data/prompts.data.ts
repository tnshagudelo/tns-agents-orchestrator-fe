import { ProjectMode, PromptTemplate, TechId } from '../models/framework.types';
import { getTechnology } from './technologies.data';

export function getPrompts(mode: ProjectMode, techId: TechId): PromptTemplate[] {
  const tech = getTechnology(techId);
  if (!tech) return [];

  const promptsMap: Record<ProjectMode, PromptTemplate[]> = {
    new: [
      {
        id: 'new-p1',
        label: 'Validar que el agente leyo el contexto',
        when: 'Al iniciar cualquier sesion de trabajo',
        text: `Resume que sabes de este proyecto basandote en CLAUDE.md y las specs disponibles en system_spec/.

Incluye:
- Stack y versiones
- Convenciones principales
- Restricciones que debes respetar
- Modulos o dominios que conoces`,
      },
      {
        id: 'new-p2',
        label: 'Generar scaffold con contexto',
        when: 'Cuando necesitas crear la estructura inicial del proyecto',
        text: `Crea la estructura inicial del proyecto ${tech.name} siguiendo las convenciones definidas en CLAUDE.md.

Requisitos:
- Nombre: [nombre-del-proyecto]
- Incluye: [listar modulos iniciales]

Antes de generar codigo, lee system_spec/index.md para entender los dominios.
Despues de generar, ejecuta: ${tech.commands['build']}`,
      },
      {
        id: 'new-p3',
        label: 'Crear una spec de dominio nueva',
        when: 'Cuando agregas un modulo nuevo al proyecto',
        text: `Crea el archivo system_spec/[nombre-del-modulo].spec.md con esta estructura:

# [Nombre del modulo]

## Proposito
[Una linea que explique para que sirve este modulo]

## Entidades
[Lista de entidades/modelos con sus campos principales]

## Reglas de negocio
[Lista numerada de reglas que el codigo debe cumplir]

## Restricciones
[Lo que NO se debe hacer en este modulo]

## Dependencias
[Otros modulos o servicios externos de los que depende]

Despues, actualiza system_spec/index.md agregando la nueva entrada.`,
      },
      {
        id: 'new-p4',
        label: 'Implementar feature con contexto completo',
        when: 'Cuando ya tienes specs y quieres que el agente construya algo',
        text: `Lee system_spec/[modulo].spec.md antes de implementar.

Implementa: [descripcion del feature]

Criterios:
- [criterio 1]
- [criterio 2]

Sigue las convenciones de CLAUDE.md.
Ejecuta ${tech.commands['test']} al terminar.
Si el feature cambia la arquitectura, dime que actualizar en las specs.`,
      },
    ],
    existing: [
      {
        id: 'ext-p1',
        label: 'Generar CLAUDE.md desde un proyecto existente',
        when: 'Primera vez que usas Context Engineering en un proyecto que ya existe',
        text: `Analiza este proyecto ${tech.name} y genera un CLAUDE.md con:

1. Stack y versiones (lee package.json o requirements.txt)
2. Comandos del proyecto (dev, test, build, lint)
3. Convenciones que detectes en el codigo existente
4. Restricciones importantes
5. Estructura de carpetas actual

El archivo debe ser conciso — maximo 40 lineas. Los detalles iran en system_spec/.`,
      },
      {
        id: 'ext-p2',
        label: 'Generar specs desde codigo existente',
        when: 'Cuando quieres documentar los modulos actuales para el agente',
        text: `Analiza el modulo [nombre-del-modulo] y genera su spec en system_spec/[nombre].spec.md.

La spec debe incluir:
- Proposito del modulo (1 linea)
- Entidades principales con campos
- Reglas de negocio que detectes en la logica
- Restricciones o validaciones importantes
- Dependencias con otros modulos

Tambien actualiza system_spec/index.md con la nueva entrada.
No inventes reglas — solo documenta lo que existe en el codigo.`,
      },
      {
        id: 'ext-p3',
        label: 'Corregir un bug usando el contexto',
        when: 'Cuando hay un bug y quieres que el agente lo resuelva con contexto',
        text: `Lee system_spec/[modulo-afectado].spec.md antes de investigar.

Bug: [descripcion del problema]
Comportamiento esperado: [que deberia pasar]
Comportamiento actual: [que esta pasando]

Pasos:
1. Verifica que entiendes las reglas de negocio de la spec
2. Encuentra la causa raiz
3. Corrige respetando las restricciones de CLAUDE.md
4. Ejecuta ${tech.commands['test']}
5. Si la spec no cubria este caso, dime que agregar`,
      },
      {
        id: 'ext-p4',
        label: 'Auditar si las specs estan actualizadas',
        when: 'Periodicamente, o cuando sospechas que el contexto esta desactualizado',
        text: `Compara el estado actual del codigo con las specs en system_spec/:

1. Lee system_spec/index.md
2. Para cada spec listada, verifica si el codigo real coincide
3. Identifica: specs desactualizadas, modulos sin spec, specs de modulos eliminados
4. Dame un reporte con las acciones necesarias

Formato del reporte:
- [spec.md] → Actualizar: [que cambio]
- [modulo-nuevo] → Crear spec
- [spec-obsoleta.md] → Eliminar`,
      },
    ],
    migration: [
      {
        id: 'mig-p1',
        label: 'Crear spec de migracion',
        when: 'Antes de iniciar cualquier migracion',
        text: `Crea system_spec/migration.spec.md con:

# Migracion: [de que] → [a que]

## Alcance
- Version origen: [version actual]
- Version destino: [version objetivo]

## Breaking changes
[Lista de cambios que rompen compatibilidad — consulta la guia oficial]

## Modulos afectados
[Lista de modulos que necesitan cambios, en orden de dependencia]

## Orden de migracion
1. [modulo sin dependencias primero]
2. [modulo que depende del anterior]
...

## Validacion
- Comando de test: ${tech.commands['test']}
- Comando de build: ${tech.commands['build']}

Actualiza system_spec/index.md con esta nueva spec.`,
      },
      {
        id: 'mig-p2',
        label: 'Migrar un modulo especifico',
        when: 'Para migrar modulo por modulo siguiendo el orden de la spec',
        text: `Lee system_spec/migration.spec.md para entender el contexto completo.

Migra SOLO el modulo: [nombre-del-modulo]

Pasos:
1. Lee la spec del modulo en system_spec/[nombre].spec.md
2. Aplica los cambios segun los breaking changes listados
3. Actualiza las dependencias afectadas
4. Ejecuta ${tech.commands['test']}
5. NO migres otros modulos en este paso

Dime que cambiar en la spec del modulo si la migracion afecta sus reglas.`,
      },
      {
        id: 'mig-p3',
        label: 'Validar migracion completa',
        when: 'Cuando todos los modulos estan migrados',
        text: `La migracion deberia estar completa. Valida:

1. Ejecuta ${tech.commands['build']} — debe pasar limpio
2. Ejecuta ${tech.commands['test']} — todos los tests deben pasar
3. Revisa que CLAUDE.md refleje las versiones nuevas
4. Revisa que cada spec en system_spec/ este actualizada
5. Elimina system_spec/migration.spec.md (ya no se necesita)
6. Actualiza system_spec/index.md sin la entrada de migracion

Dame un resumen de los cambios realizados para el PR.`,
      },
    ],
  };

  return promptsMap[mode];
}
