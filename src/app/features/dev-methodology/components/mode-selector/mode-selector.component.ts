import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { FrameworkStateService } from '../../services/framework-state.service';
import { ModeOption, ProjectMode } from '../../models/framework.types';

@Component({
  selector: 'app-mode-selector',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatIconModule, MatDividerModule],
  templateUrl: './mode-selector.component.html',
  styleUrl: './mode-selector.component.scss',
})
export class ModeSelectorComponent {
  private readonly state = inject(FrameworkStateService);
  private readonly router = inject(Router);

  // ── Por que este framework ──────────────────────────────────────────────────

  readonly whyCards = [
    {
      icon: 'speed',
      title: 'Productividad',
      desc: 'Un agente con contexto estructurado genera código alineado con tu arquitectura. Sin contexto, adivina y tú corriges.',
    },
    {
      icon: 'group',
      title: 'Consistencia',
      desc: 'Design Docs centralizan las convenciones del equipo. Todos — humanos y agentes — trabajan con las mismas reglas.',
    },
    {
      icon: 'history',
      title: 'Memoria del proyecto',
      desc: 'Los Design Docs son la memoria técnica del proyecto. Cuando alguien nuevo llega, lee los docs y entiende.',
    },
    {
      icon: 'verified',
      title: 'Calidad',
      desc: 'Diseñar antes de codificar reduce errores, retrabajos y decisiones que hay que revertir después.',
    },
  ];

  // ── Que es un Design Doc ────────────────────────────────────────────────────

  readonly companies = [
    { name: 'Google', calls: 'Design Doc', ref: 'Software Engineering at Google (O\'Reilly, 2020)' },
    { name: 'Amazon', calls: 'Technical Design Document', ref: 'Working Backwards process' },
    { name: 'Uber / Spotify', calls: 'RFC (Request for Comments)', ref: 'Propuesta técnica abierta a revisión' },
    { name: 'Microsoft', calls: 'Design Specification', ref: 'Documentación interna de ingeniería' },
    { name: 'Startups', calls: 'Tech Spec', ref: 'Versión ligera y pragmática' },
  ];

  // ── Flujo de trabajo T&S ─────────────────────────────────────────────────────

  activeFlowStep = -1;

  // ── Cómo se genera un Design Doc ─────────────────────────────────────────────

  readonly howSteps = [
    {
      role: 'human',
      roleLabel: 'Tú',
      title: 'Describes la necesidad',
      desc: 'Explica en lenguaje natural qué quieres construir. No necesitas detallar el cómo — solo el qué y el para qué.',
      example: '"Necesito un módulo de notificaciones que envíe emails cuando un planning se aprueba. Debe soportar templates y cola asíncrona."',
      exampleIcon: 'chat',
    },
    {
      role: 'agent',
      roleLabel: 'Agente',
      title: 'Genera el plan técnico',
      desc: 'Como ya leyó CLAUDE.md y las specs existentes, propone: archivos a crear, entidades, endpoints, decisiones técnicas y dependencias con otros módulos.',
      example: 'El agente produce un documento estructurado alineado con tu arquitectura real, no un plan genérico.',
      exampleIcon: 'description',
    },
    {
      role: 'human',
      roleLabel: 'Tú',
      title: 'Revisas y apruebas',
      desc: 'Validas que el plan respeta la arquitectura, ajustas lo que no tenga sentido y apruebas. El Design Doc aprobado se convierte en el contrato de implementación.',
      example: 'Solo después de tu aprobación el agente comienza a codificar — nunca antes.',
      exampleIcon: 'verified',
    },
  ];

  readonly designDocPrompt = `Lee docs/specs/index.md y CLAUDE.md antes de responder.

Necesito implementar: [describe tu necesidad aquí]

Genera un Design Doc en docs/specs/[nombre].md con:
1. Propósito (1 línea)
2. Entidades con campos principales
3. Endpoints (método, ruta, request, response)
4. Decisiones técnicas (qué y por qué)
5. Restricciones
6. Dependencias con otros módulos

NO implementes nada — solo el plan. Espera mi aprobación.`;

  promptCopied = false;

  copyPrompt(): void {
    navigator.clipboard.writeText(this.designDocPrompt);
    this.promptCopied = true;
    setTimeout(() => this.promptCopied = false, 2000);
  }

  // ── Ciclo de vida HU ────────────────────────────────────────────────────────

  activeHuStep = -1;

  readonly huSteps = [
    { icon: 'lightbulb', label: 'Inception', detail: 'Se identifica la necesidad y se redacta la historia inicial con contexto de negocio.' },
    { icon: 'inbox', label: 'Backlog', detail: 'La HU entra al backlog priorizado, visible para todo el equipo.' },
    { icon: 'tune', label: 'Refinamiento', detail: 'Se detallan criterios de aceptación, alcance y dependencias con el equipo.' },
    { icon: 'rocket_launch', label: 'Sprint', detail: 'Se implementa la funcionalidad, se despliega en ambiente de pruebas y QA ejecuta los casos de prueba antes de avanzar a demo.' },
    { icon: 'slideshow', label: 'Demo', detail: 'Se presenta al cliente en la demo de iteración y se recoge feedback.' },
    { icon: 'task_alt', label: 'Aceptación', detail: 'El cliente valida que cumple los criterios acordados y se marca como completada.' },
  ];

  // ── Conceptos clave ─────────────────────────────────────────────────────────

  readonly concepts = [
    {
      icon: 'description',
      title: 'CLAUDE.md',
      desc: 'Archivo de contexto que el agente lee automáticamente al abrir el proyecto. Define stack, comandos, convenciones y reglas.',
    },
    {
      icon: 'folder',
      title: 'docs/specs/',
      desc: 'Carpeta con design docs por módulo. Cada doc describe: qué hace, entidades, endpoints, decisiones y deuda técnica.',
    },
    {
      icon: 'architecture',
      title: 'ARCHITECTURE.md',
      desc: 'Documento con diagramas, decisiones de diseño y estructura del sistema. La visión técnica del proyecto.',
    },
    {
      icon: 'quiz',
      title: 'OPEN_QUESTIONS.md',
      desc: 'Preguntas técnicas pendientes de resolver. El agente NO debe asumir respuestas — debe consultar aquí primero.',
    },
  ];

  // ── Cuando usar Design Docs ─────────────────────────────────────────────────

  readonly whenYes = [
    { text: 'Feature nuevo que toca 2+ módulos', reason: 'Sin plan, el agente genera piezas que no encajan' },
    { text: 'Cambio de arquitectura', reason: 'Decisiones difíciles de revertir' },
    { text: 'Nuevo endpoint + UI que lo consume', reason: 'El contrato debe definirse antes' },
    { text: 'Integración con sistema externo', reason: 'Las interfaces deben ser explícitas' },
    { text: 'Tarea de más de 1 día', reason: 'Necesitas dividirla y planificar' },
  ];

  readonly whenNo = [
    { text: 'Bug fix de pocas líneas', reason: 'Directo con un prompt claro' },
    { text: 'Cambiar un texto en la UI', reason: 'Directo' },
    { text: 'Actualizar dependencia sin breaking changes', reason: 'Directo' },
    { text: 'Refactor en un solo archivo', reason: 'Directo' },
    { text: 'Tarea con Design Doc existente', reason: 'Leer el doc y trabajar sobre él' },
  ];

  // ── Escenarios de configuracion ─────────────────────────────────────────────

  readonly modes: ModeOption[] = [
    {
      mode: 'new',
      title: 'Proyecto nuevo',
      description: 'Primeros pasos: definir arquitectura, crear CLAUDE.md y los primeros design docs antes de escribir código.',
      icon: 'add_circle_outline',
    },
    {
      mode: 'existing',
      title: 'Proyecto existente',
      description: 'Documentar un proyecto con código existente para que el agente entienda la arquitectura.',
      icon: 'edit_note',
    },
    {
      mode: 'migration',
      title: 'Migración',
      description: 'Design docs temporales para migración: breaking changes, orden de módulos y validación.',
      icon: 'swap_horiz',
    },
    {
      mode: 'multi-repo',
      title: 'Multi-repositorio',
      description: 'Workspace con 2+ repos. Un CLAUDE.md global orquesta, cada repo tiene su contexto propio.',
      icon: 'account_tree',
    },
  ];

  select(mode: ProjectMode): void {
    this.state.selectMode(mode);
    this.router.navigate(['/dev-methodology/tech']);
  }
}
