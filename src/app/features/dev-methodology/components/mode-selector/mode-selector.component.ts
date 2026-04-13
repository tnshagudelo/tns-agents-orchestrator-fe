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
  styles: [`
    .page-container { padding: 24px; max-width: 1100px; }

    /* Hero */
    .hero {
      margin-bottom: 32px;
      h1 { margin: 0 0 6px; font-size: 1.75rem; font-weight: 700; color: #1a1a2e; }
      .hero-badge {
        display: inline-block; padding: 2px 10px; border-radius: 10px;
        background: #e8eaf6; color: #3f51b5; font-size: 0.72rem; font-weight: 600;
        margin-bottom: 12px; letter-spacing: 0.3px;
      }
      .hero-desc {
        font-size: 0.9rem; color: rgba(0,0,0,0.6); line-height: 1.7; max-width: 850px;
      }
    }

    /* Section titles */
    .section-title {
      display: flex; align-items: center; gap: 8px;
      font-size: 1.05rem; font-weight: 600; margin: 0 0 14px; color: #1a1a2e;
      mat-icon { color: #3f51b5; }
    }
    .section-desc {
      font-size: 0.85rem; color: rgba(0,0,0,0.55); line-height: 1.6;
      margin: -8px 0 16px; max-width: 800px;
    }

    /* Why section */
    .why-section { margin-bottom: 28px; }
    .why-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
    }
    .why-card {
      padding: 16px; border-radius: 10px;
      background: #f0fdf4; border: 1px solid #bbf7d0;
      text-align: center;
    }
    .why-card mat-icon { color: #16a34a; font-size: 1.6rem; width: 1.6rem; height: 1.6rem; }
    .why-card h4 { margin: 8px 0 4px; font-size: 0.88rem; font-weight: 600; }
    .why-card p { margin: 0; font-size: 0.78rem; color: rgba(0,0,0,0.55); line-height: 1.5; }

    /* What is a Design Doc */
    .what-section { margin-bottom: 28px; }
    .what-intro {
      font-size: 0.88rem; color: rgba(0,0,0,0.65); line-height: 1.7; margin: 0 0 14px;
      max-width: 800px;
    }
    .what-analogy {
      padding: 14px 18px; border-radius: 8px; margin-bottom: 16px;
      background: #fffbeb; border: 1px solid #fef3c7;
      font-size: 0.85rem; color: #92400e; line-height: 1.6;
    }
    .what-analogy strong { color: #78350f; }
    .company-table {
      width: 100%; border-collapse: collapse; font-size: 0.82rem; max-width: 750px;
    }
    .company-table th {
      background: #f1f5f9; padding: 8px 14px; text-align: left; font-weight: 600;
      border: 1px solid #e2e8f0; color: #334155;
    }
    .company-table td { padding: 8px 14px; border: 1px solid #e2e8f0; }
    .company-table tr:hover td { background: #f8fafc; }

    /* Flow timeline */
    .flow-section { margin-bottom: 28px; }
    .flow-timeline { max-width: 680px; }

    .flow-card {
      border-radius: 10px; border: 1px solid #e5e7eb;
      background: #fafafa; cursor: pointer; transition: all 0.15s ease;
      &:hover { border-color: #c7d2fe; background: #fefefe; }
    }
    .flow-card--active { border-color: #818cf8; box-shadow: 0 2px 12px rgba(99,102,241,0.1); }
    .flow-card--spec { border-left: 3px solid #a78bfa; }

    .flow-card-header {
      display: flex; align-items: center; gap: 12px; padding: 14px 16px;
    }
    .flow-card-title { flex: 1; }
    .flow-label { font-weight: 600; font-size: 0.85rem; color: #1a1a2e; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .flow-expand { color: rgba(0,0,0,0.3); font-size: 20px; width: 20px; height: 20px; }

    .flow-number {
      width: 28px; height: 28px; border-radius: 50%;
      background: #3f51b5; color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.72rem; font-weight: 700; flex-shrink: 0;
    }
    .flow-number--spec { background: #7c3aed; }

    .flow-participants {
      display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px;
    }
    .participant {
      display: inline-flex; align-items: center; gap: 3px;
      padding: 1px 8px; border-radius: 10px;
      font-size: 0.68rem; font-weight: 500;
      mat-icon { font-size: 12px; width: 12px; height: 12px; }
    }
    .participant--team { background: #dbeafe; color: #1e40af; }
    .participant--client { background: #fef3c7; color: #92400e; }
    .participant--ai { background: #f3e8ff; color: #7c3aed; }
    .participant--qa { background: #fce7f3; color: #9d174d; }

    .flow-ai-badge {
      display: inline-flex; align-items: center; gap: 2px;
      padding: 1px 8px; border-radius: 10px;
      background: #f3e8ff; color: #7c3aed;
      font-size: 0.65rem; font-weight: 600;
      mat-icon { font-size: 11px; width: 11px; height: 11px; }
    }

    .flow-card-body {
      padding: 0 16px 16px 56px;
      animation: fadeIn 0.2s ease;
      p { margin: 0 0 10px; font-size: 0.8rem; color: rgba(0,0,0,0.6); line-height: 1.6; }
    }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

    .flow-card-outcome {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 12px; border-radius: 6px;
      background: #f0fdf4; border: 1px solid #bbf7d0;
      font-size: 0.76rem; color: #166534;
      mat-icon { font-size: 14px; width: 14px; height: 14px; color: #16a34a; flex-shrink: 0; }
    }
    .flow-card-example {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 12px; border-radius: 6px; margin-bottom: 10px;
      background: #f8f7ff; border: 1px solid #e8e4f3;
      font-size: 0.76rem; color: #4338ca;
      mat-icon { font-size: 14px; width: 14px; height: 14px; color: #6366f1; flex-shrink: 0; }
    }
    .flow-card-pipeline {
      display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
      margin-bottom: 10px;
    }
    .pipeline-step {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 6px 12px; border-radius: 8px;
      background: #f1f5f9; border: 1px solid #e2e8f0;
      font-size: 0.76rem; font-weight: 500; color: #334155;
      mat-icon { font-size: 14px; width: 14px; height: 14px; color: #64748b; }
    }
    .pipeline-arrow { font-size: 14px; width: 14px; height: 14px; color: #94a3b8; }

    .flow-connector {
      width: 2px; height: 16px; background: #d1d5db; margin: 0 auto;
    }
    .flow-connector--short { height: 8px; }

    .flow-group {
      border: 2px dashed #c4b5fd; border-radius: 14px;
      padding: 12px 12px 16px;
      background: rgba(139,92,246,0.02);
    }
    .flow-group-label {
      display: flex; align-items: center; gap: 6px; justify-content: center;
      font-size: 0.72rem; font-weight: 600; color: #7c3aed;
      margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
    }
    .flow-loop-hint {
      display: flex; align-items: center; gap: 4px; justify-content: center;
      font-size: 0.68rem; color: #a78bfa; font-style: italic;
      margin: 4px 0;
      mat-icon { font-size: 12px; width: 12px; height: 12px; }
    }

    /* How to generate a Design Doc */
    .how-section { margin-bottom: 28px; }
    .how-steps {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 14px; margin-bottom: 18px;
    }
    .how-step {
      padding: 18px; border-radius: 10px;
      background: #fafafa; border: 1px solid #e5e7eb;
    }
    .how-step-header {
      display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
    }
    .how-step-number {
      width: 24px; height: 24px; border-radius: 50%;
      background: #3f51b5; color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.7rem; font-weight: 700; flex-shrink: 0;
    }
    .how-step-role {
      padding: 2px 10px; border-radius: 10px;
      font-size: 0.68rem; font-weight: 600; letter-spacing: 0.3px;
    }
    .role--human { background: #dbeafe; color: #1e40af; }
    .role--agent { background: #f3e8ff; color: #7c3aed; }
    .how-step h4 { margin: 0 0 6px; font-size: 0.88rem; font-weight: 600; color: #1a1a2e; }
    .how-step p { margin: 0 0 8px; font-size: 0.78rem; color: rgba(0,0,0,0.55); line-height: 1.5; }
    .how-step-example {
      display: flex; gap: 8px; align-items: flex-start;
      padding: 8px 10px; border-radius: 6px;
      background: white; border: 1px solid #e5e7eb;
      font-size: 0.75rem; color: rgba(0,0,0,0.6); line-height: 1.5;
      font-style: italic;
    }
    .how-step-example mat-icon {
      font-size: 14px; width: 14px; height: 14px; flex-shrink: 0;
      margin-top: 2px; color: #9ca3af;
    }
    .how-tip {
      padding: 18px; border-radius: 10px; margin-bottom: 14px;
      background: #f0fdf4; border: 1px solid #bbf7d0;
    }
    .how-tip-header {
      display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
      font-size: 0.88rem; color: #166534;
    }
    .how-tip-header mat-icon { color: #16a34a; }
    .how-tip-prompt {
      padding: 14px; border-radius: 8px; margin: 0 0 12px;
      background: #065f46; color: #d1fae5;
      font-size: 0.76rem; line-height: 1.6;
      white-space: pre-wrap; word-break: break-word;
      font-family: 'Cascadia Code', 'Fira Code', monospace;
    }
    .how-tip-copy {
      font-size: 0.76rem !important;
    }
    .how-key-insight {
      display: flex; gap: 12px; align-items: flex-start;
      padding: 16px 18px; border-radius: 10px;
      background: #fffbeb; border: 1px solid #fef3c7;
    }
    .how-key-insight > mat-icon { color: #f59e0b; flex-shrink: 0; margin-top: 2px; }
    .how-key-insight strong { font-size: 0.85rem; color: #78350f; display: block; margin-bottom: 4px; }
    .how-key-insight p {
      margin: 0; font-size: 0.78rem; color: #92400e; line-height: 1.6;
    }

    /* Concepts */
    .concepts-section { margin-bottom: 28px; }
    .concept-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 10px;
    }
    .concept-card {
      display: flex; gap: 10px; align-items: flex-start;
      padding: 12px 14px; border-radius: 8px;
      background: #f0f9ff; border: 1px solid #bae6fd;
    }
    .concept-icon { color: #0284c7; flex-shrink: 0; margin-top: 2px; }
    .concept-title { font-weight: 600; font-size: 0.82rem; display: block; margin-bottom: 2px; }
    .concept-desc { margin: 0; font-size: 0.76rem; color: rgba(0,0,0,0.55); line-height: 1.5; }

    /* When to use */
    .when-section { margin-bottom: 28px; }
    .when-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .when-col h3 {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.88rem; font-weight: 600; margin: 0 0 8px;
    }
    .when-col h3 mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }
    .when-col.col-yes h3 { color: #166534; }
    .when-col.col-no h3 { color: #991b1b; }
    .when-item {
      display: flex; gap: 8px; align-items: flex-start;
      padding: 7px 10px; border-radius: 6px; margin-bottom: 5px;
      font-size: 0.78rem; line-height: 1.5;
    }
    .col-yes .when-item { background: #f0fdf4; border: 1px solid #bbf7d0; }
    .col-no .when-item { background: #fef2f2; border: 1px solid #fecaca; }
    .when-item mat-icon { font-size: 14px; width: 14px; height: 14px; flex-shrink: 0; margin-top: 2px; }
    .col-yes .when-item mat-icon { color: #16a34a; }
    .col-no .when-item mat-icon { color: #dc2626; }
    .when-reason { color: rgba(0,0,0,0.4); font-size: 0.72rem; }
    .when-rule {
      margin-top: 10px; padding: 12px 16px; border-radius: 8px;
      background: #f8f7ff; border: 1px solid #e8e4f3;
      font-size: 0.82rem; color: #1a1a2e; line-height: 1.6;
    }
    .when-rule strong { color: #3f51b5; }

    /* Modes grid */
    .modes-section { margin-bottom: 24px; }
    .modes-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 14px;
    }
    .mode-card {
      padding: 22px; cursor: pointer;
      border: 2px solid transparent; border-radius: 12px;
      transition: all 0.15s ease; position: relative;

      &:hover {
        border-color: #3f51b5; transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.1);
      }
      h3 { margin: 10px 0 6px; font-size: 0.95rem; font-weight: 600; }
      p { margin: 0; font-size: 0.78rem; color: rgba(0,0,0,0.55); line-height: 1.5; }
    }
    .mode-icon { font-size: 1.6rem; width: 1.6rem; height: 1.6rem; color: #3f51b5; }
    .arrow {
      position: absolute; top: 22px; right: 16px;
      color: rgba(0,0,0,0.2); transition: color 0.15s;
    }
    .mode-card:hover .arrow { color: #3f51b5; }
  `],
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
