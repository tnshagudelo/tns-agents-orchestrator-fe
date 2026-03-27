import { ProjectMode, PromptTemplate, TechId } from '../models/framework.types';
import { getTechnology } from './technologies.data';

export function getPrompts(mode: ProjectMode, techId: TechId): PromptTemplate[] {
  const tech = getTechnology(techId);
  if (!tech) return [];

  const isPython = tech.packageManager === 'pip';
  const testCmd = tech.commands['test'];
  const buildCmd = tech.commands['build'];

  const promptsMap: Record<ProjectMode, PromptTemplate[]> = {
    new: [
      {
        id: 'new-p1',
        label: 'Scaffold del proyecto',
        text: `Crea la estructura inicial de un proyecto ${tech.name} con ${tech.stack}.\n\nRequisitos:\n- Nombre del proyecto: [nombre-del-proyecto]\n- Debe incluir: configuracion de linting, testing, y estructura de carpetas por feature\n- Sigue las convenciones de CLAUDE.md\n- Agrega un README.md basico\n\nDespues de generar, ejecuta: ${buildCmd}`,
      },
      {
        id: 'new-p2',
        label: 'Feature completo con TDD',
        text: `Implementa la feature [nombre-de-la-feature] en ${tech.name} usando TDD:\n\n1. Primero escribe los tests que describan el comportamiento esperado\n2. Luego implementa el codigo minimo para que pasen\n3. Refactoriza manteniendo los tests en verde\n\nComportamiento esperado:\n- [descripcion del comportamiento]\n- [caso edge 1]\n- [caso edge 2]\n\nEjecuta ${testCmd} al terminar.`,
      },
      {
        id: 'new-p3',
        label: 'Configurar CI/CD',
        text: `Configura el pipeline de CI/CD para este proyecto ${tech.name}:\n\n- Plataforma: [GitHub Actions / GitLab CI / Azure DevOps]\n- Pasos: install → lint → test → build → deploy\n- Comandos:\n  - Test: ${testCmd}\n  - Build: ${buildCmd}\n- Ambiente de deploy: [produccion / staging]\n- Secretos necesarios: [listar variables de entorno]`,
      },
      {
        id: 'new-p4',
        label: 'Agregar autenticacion',
        text: `Agrega autenticacion ${isPython ? 'con JWT usando python-jose' : 'con JWT'} al proyecto ${tech.name}:\n\n- Tipo: [JWT / OAuth2 / Session]\n- Endpoints: login, register, refresh-token, logout\n- Proteccion de rutas: [listar rutas protegidas]\n- Storage del token: [localStorage / httpOnly cookie]\n- Roles: [admin, user, viewer]\n\nIncluye tests para cada endpoint y para las rutas protegidas.`,
      },
    ],
    existing: [
      {
        id: 'ext-p1',
        label: 'Entender el codigo',
        text: `Analiza este proyecto ${tech.name} y dame un resumen de:\n\n1. Estructura de carpetas y su proposito\n2. Dependencias principales y sus versiones\n3. Patrones de arquitectura usados\n4. Flujo de datos principal\n5. Tests existentes y cobertura\n6. Posibles code smells o deuda tecnica\n\nArchivos clave a revisar: [listar archivos o usar "todos"]`,
      },
      {
        id: 'ext-p2',
        label: 'Refactorizar modulo',
        text: `Refactoriza el modulo [nombre-del-modulo] en ${tech.name}:\n\nProblemas actuales:\n- [problema 1]\n- [problema 2]\n\nResultado esperado:\n- [mejora 1]\n- [mejora 2]\n\nRestricciones:\n- No cambiar la API publica del modulo\n- Mantener compatibilidad con los tests existentes\n- Ejecutar ${testCmd} despues de cada cambio`,
      },
      {
        id: 'ext-p3',
        label: 'Corregir bug',
        text: `Hay un bug en [ubicacion del bug] del proyecto ${tech.name}:\n\nComportamiento actual: [que pasa]\nComportamiento esperado: [que deberia pasar]\nPasos para reproducir:\n1. [paso 1]\n2. [paso 2]\n\nAntes de corregir:\n1. Escribe un test que reproduzca el bug\n2. Corrige el codigo\n3. Verifica con ${testCmd}\n4. Explica la causa raiz`,
      },
      {
        id: 'ext-p4',
        label: 'Agregar feature a modulo existente',
        text: `Agrega la funcionalidad [nombre] al modulo [modulo] en ${tech.name}:\n\nDescripcion:\n- [que debe hacer]\n- [criterios de aceptacion]\n\nIntegracion:\n- Se conecta con: [otros modulos/servicios]\n- Endpoint afectado: [ruta]\n- Modelo de datos: [cambios necesarios]\n\nSigue las convenciones existentes del proyecto y ejecuta ${testCmd} && ${buildCmd} al terminar.`,
      },
    ],
    migration: [
      {
        id: 'mig-p1',
        label: 'Analisis de impacto',
        text: `Analiza el impacto de migrar [componente/libreria/version] en este proyecto ${tech.name}:\n\nMigracion: [de que] → [a que]\n\nNecesito:\n1. Lista de archivos afectados\n2. Breaking changes documentados\n3. Dependencias que tambien necesitan actualizarse\n4. Estimacion de esfuerzo (bajo/medio/alto)\n5. Plan de migracion paso a paso\n6. Riesgos identificados`,
      },
      {
        id: 'mig-p2',
        label: 'Migrar modulo',
        text: `Migra el modulo [nombre-del-modulo] de [version-actual] a [version-nueva] en ${tech.name}:\n\nPasos:\n1. Actualiza las dependencias involucradas\n2. Aplica los cambios de API segun la guia de migracion oficial\n3. Actualiza los tests\n4. Verifica con ${testCmd}\n5. Verifica con ${buildCmd}\n\nNo migrar otros modulos — solo [nombre-del-modulo].`,
      },
      {
        id: 'mig-p3',
        label: 'Tests de contrato',
        text: `Escribe contract tests para los siguientes endpoints/interfaces antes de la migracion en ${tech.name}:\n\nModulos: [listar modulos]\nEndpoints: [listar endpoints]\n\nCada test debe validar:\n- Request schema (tipos, campos obligatorios)\n- Response schema (tipos, estructura)\n- Codigos de error esperados\n- Headers requeridos\n\nEjecuta ${testCmd} y confirma que todos pasan con el codigo actual.`,
      },
      {
        id: 'mig-p4',
        label: 'Validar migracion completa',
        text: `Revisa el diff completo de la rama de migracion en ${tech.name} y valida:\n\n1. No hay regresiones en tests existentes\n2. Los contract tests siguen pasando\n3. No se introdujeron patrones obsoletos\n4. Las convenciones de CLAUDE.md se respetan\n5. El build pasa limpio: ${buildCmd}\n6. No hay warnings nuevos en: ${tech.commands['lint'] ?? testCmd}\n\nGenera un resumen para el PR con los cambios clave.`,
      },
    ],
  };

  return promptsMap[mode];
}
