import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { FrameworkStateService } from '../../services/framework-state.service';
import { ModeOption, ProjectMode } from '../../models/framework.types';

@Component({
  selector: 'app-mode-selector',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatDividerModule],
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

    /* Flow */
    .flow-section { margin-bottom: 28px; }
    .flow-steps {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
      gap: 10px;
    }
    .flow-step {
      display: flex; flex-direction: column; align-items: center;
      text-align: center; padding: 14px 10px; border-radius: 10px;
      background: #f8f7ff; border: 1px solid #e8e4f3;
    }
    .flow-number {
      width: 26px; height: 26px; border-radius: 50%;
      background: #3f51b5; color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.72rem; font-weight: 700; margin-bottom: 6px;
    }
    .flow-label { font-weight: 600; font-size: 0.8rem; margin-bottom: 3px; }
    .flow-desc { font-size: 0.72rem; color: rgba(0,0,0,0.5); line-height: 1.4; }

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

  // ── Flujo de trabajo ────────────────────────────────────────────────────────

  readonly flowSteps = [
    { label: 'HU / Necesidad', desc: 'Defines qué quieres lograr' },
    { label: 'Design Doc', desc: 'El agente genera el plan técnico' },
    { label: 'Revisión', desc: 'Tú apruebas o ajustas' },
    { label: 'Implementar', desc: 'El agente codifica según el doc' },
    { label: 'Actualizar', desc: 'El doc refleja lo implementado' },
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
    this.router.navigate(['/claude-framework/tech']);
  }
}
