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
        text: `Resume que sabes de este proyecto basandote en CLAUDE.md y las specs disponibles en docs/specs/.

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

Antes de generar codigo, lee docs/specs/index.md para entender los dominios.
Despues de generar, ejecuta: ${tech.commands['build']}`,
      },
      {
        id: 'new-p3',
        label: 'Crear una spec de dominio nueva',
        when: 'Cuando agregas un modulo nuevo al proyecto',
        text: `Crea el archivo docs/specs/[nombre-del-modulo].md con esta estructura:

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

Despues, actualiza docs/specs/index.md agregando la nueva entrada.`,
      },
      {
        id: 'new-p4',
        label: 'Implementar feature con contexto completo',
        when: 'Cuando ya tienes specs y quieres que el agente construya algo',
        text: `Lee docs/specs/[modulo].md antes de implementar.

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

El archivo debe ser conciso — maximo 40 lineas. Los detalles iran en docs/specs/.`,
      },
      {
        id: 'ext-p2',
        label: 'Generar specs desde codigo existente',
        when: 'Cuando quieres documentar los modulos actuales para el agente',
        text: `Analiza el modulo [nombre-del-modulo] y genera su spec en docs/specs/[nombre].md.

La spec debe incluir:
- Proposito del modulo (1 linea)
- Entidades principales con campos
- Reglas de negocio que detectes en la logica
- Restricciones o validaciones importantes
- Dependencias con otros modulos

Tambien actualiza docs/specs/index.md con la nueva entrada.
No inventes reglas — solo documenta lo que existe en el codigo.`,
      },
      {
        id: 'ext-p3',
        label: 'Corregir un bug usando el contexto',
        when: 'Cuando hay un bug y quieres que el agente lo resuelva con contexto',
        text: `Lee docs/specs/[modulo-afectado].md antes de investigar.

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
        text: `Compara el estado actual del codigo con las specs en docs/specs/:

1. Lee docs/specs/index.md
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
        text: `Crea docs/specs/migration.md con:

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

Actualiza docs/specs/index.md con esta nueva spec.`,
      },
      {
        id: 'mig-p2',
        label: 'Migrar un modulo especifico',
        when: 'Para migrar modulo por modulo siguiendo el orden de la spec',
        text: `Lee docs/specs/migration.md para entender el contexto completo.

Migra SOLO el modulo: [nombre-del-modulo]

Pasos:
1. Lee la spec del modulo en docs/specs/[nombre].md
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
4. Revisa que cada spec en docs/specs/ este actualizada
5. Elimina docs/specs/migration.md (ya no se necesita)
6. Actualiza docs/specs/index.md sin la entrada de migracion

Dame un resumen de los cambios realizados para el PR.`,
      },
    ],
    'multi-repo': [
      {
        id: 'multi-p1',
        label: 'Validar que Claude entiende el workspace',
        when: 'Al iniciar cualquier sesion de trabajo desde la raiz',
        text: `Resume la estructura de este workspace basandote en los CLAUDE.md disponibles:

1. Que repositorios hay y que hace cada uno
2. Stack y versiones de cada repo
3. Reglas cross-repo (protocolo de trabajo)
4. Donde esta la documentacion compartida (docs/)
5. Como se hacen commits (por repo, no desde la raiz)

Si encuentras ARCHITECTURE.md o specs en docs/, mencionalos.`,
      },
      {
        id: 'multi-p2',
        label: 'Tarea cross-repo (toca backend + frontend)',
        when: 'Cuando una tarea requiere cambios en ambos repositorios',
        text: `Necesito implementar: [descripcion de la tarea]

Sigue el protocolo cross-repo del CLAUDE.md:
1. Lee docs/spec_api_contracts.md y docs/spec_shared_types.md primero
2. Planifica: lista los archivos que cambiaran en cada repo. Espera mi aprobacion.
3. Backend primero: implementa endpoint + tipos
4. Valida build del backend antes de continuar
5. Frontend: implementa service + componente usando los tipos del backend
6. Un commit por repo al terminar
7. Actualiza el spec correspondiente en docs/`,
      },
      {
        id: 'multi-p3',
        label: 'Crear spec compartido nuevo',
        when: 'Cuando agregas un modulo que afecta ambos repos',
        text: `Crea docs/specs/SPEC_XX_[nombre-del-modulo].md con esta estructura:

# SPEC_XX — [Nombre del modulo]
**Estado:** En progreso
**Ultima actualizacion:** [fecha]

## Que hace
[Descripcion breve]

## Archivos relevantes (rutas completas de ambos repos)
### Backend
- repo-backend/ruta/archivo.cs
### Frontend
- repo-frontend/src/app/ruta/archivo.ts

## Endpoints expuestos
| Metodo | Ruta | Descripcion |
|--------|------|-------------|

## Decisiones tecnicas
## Pendientes / deuda tecnica

Despues, actualiza docs/SYSTEM_SPEC_INDEX.md con la nueva entrada.`,
      },
      {
        id: 'multi-p4',
        label: 'Generar CLAUDE.md global desde workspace existente',
        when: 'Primera vez configurando el workspace multi-repo',
        text: `Analiza este workspace y genera el CLAUDE.md de la raiz:

1. Identifica los repos (subdirectorios con .git)
2. Lee el CLAUDE.md de cada repo (si existe) para entender su stack
3. Genera el CLAUDE.md global con:
   - Estructura del workspace (arbol de directorios)
   - Tabla de repos con stack y puertos
   - Protocolo cross-repo (backend primero, validar build, etc.)
   - Reglas de commits por repo (NUNCA desde la raiz)
   - Reglas de mantenimiento de specs
   - Comandos rapidos (build, run, test de cada repo)

Maximo 60 lineas. Los detalles van en docs/.`,
      },
      {
        id: 'multi-p5',
        label: 'Auditar coherencia entre repos',
        when: 'Periodicamente, o cuando sospechas que los contratos estan desalineados',
        text: `Verifica la coherencia entre los repos de este workspace:

1. Lee docs/spec_api_contracts.md (si existe)
2. Compara con los endpoints reales del backend (controllers)
3. Compara con los services del frontend (URLs y tipos)
4. Identifica:
   - Endpoints en el backend sin consumidor en el frontend
   - Services en el frontend llamando endpoints que no existen
   - Tipos/DTOs con campos distintos entre repos
   - Specs desactualizadas

Dame un reporte con las acciones necesarias para cada inconsistencia.`,
      },
    ],
  };

  return promptsMap[mode];
}
