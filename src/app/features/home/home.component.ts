import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './home.component.html',
  styles: [`
    .home {
      padding: 32px 24px; max-width: 1100px;
    }

    /* ── Hero ─────────────────────────────────────────── */
    .hero {
      position: relative; text-align: center;
      padding: 48px 24px 40px; margin-bottom: 40px;
      border-radius: 16px;
      background: linear-gradient(160deg, #0d0d1a 0%, #1a1a2e 40%, #16213e 70%, #0f3460 100%);
      color: white; overflow: hidden;
    }
    .hero-glow {
      position: absolute; top: -40%; right: -20%;
      width: 400px; height: 400px; border-radius: 50%;
      background: radial-gradient(circle, rgba(218,108,207,0.2) 0%, transparent 70%);
      pointer-events: none;
    }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 4px 14px; border-radius: 20px;
      background: rgba(218,108,207,0.15); border: 1px solid rgba(218,108,207,0.3);
      color: #e8a0e0; font-size: 0.68rem; font-weight: 600;
      letter-spacing: 0.5px; margin-bottom: 20px;
      mat-icon { font-size: 13px; width: 13px; height: 13px; }
    }
    .hero h1 {
      margin: 0 0 14px; font-size: 2.2rem; font-weight: 800;
      background: linear-gradient(135deg, #fff 30%, #da6ccf 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero-lead {
      margin: 0 auto 32px; max-width: 640px;
      font-size: 0.92rem; line-height: 1.7;
      color: rgba(255,255,255,0.65);
    }
    .hero-lead strong { color: rgba(255,255,255,0.9); }

    .hero-stats {
      display: flex; align-items: center; justify-content: center;
      gap: 28px; flex-wrap: wrap;
    }
    .stat { display: flex; flex-direction: column; align-items: center; }
    .stat-value {
      font-size: 1.8rem; font-weight: 800; color: #da6ccf;
    }
    .stat-label {
      font-size: 0.72rem; color: rgba(255,255,255,0.45);
      text-transform: uppercase; letter-spacing: 0.3px; margin-top: 2px;
    }
    .stat-divider {
      width: 1px; height: 36px;
      background: rgba(255,255,255,0.1);
    }

    /* ── Method section ───────────────────────────────── */
    .method-section { margin-bottom: 40px; }
    .section-title {
      display: flex; align-items: center; gap: 8px;
      font-size: 1.05rem; font-weight: 600; margin: 0 0 8px; color: #1a1a2e;
      mat-icon { color: #3f51b5; }
    }
    .section-desc {
      font-size: 0.85rem; color: rgba(0,0,0,0.5); line-height: 1.6;
      margin: 0 0 20px; max-width: 700px;
    }

    .method-flow {
      display: flex; align-items: stretch; gap: 0;
      overflow-x: auto; padding-bottom: 8px;
    }
    .method-step {
      display: flex; flex-direction: column; align-items: center;
      text-align: center; padding: 16px 14px; min-width: 140px; max-width: 170px;
      border-radius: 10px; background: #fafafa; border: 1px solid #e5e7eb;
      position: relative; flex-shrink: 0;
    }
    .method-step-number {
      width: 28px; height: 28px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.72rem; font-weight: 700; color: white; margin-bottom: 8px;
    }
    .step-color--blue { background: #3f51b5; }
    .step-color--purple { background: #7c3aed; }
    .step-color--indigo { background: #4f46e5; }
    .step-color--emerald { background: #059669; }
    .step-color--pending {
      background: #e2e8f0; color: #94a3b8;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
    }

    .method-step--pending {
      opacity: 0.6; border-style: dashed;
    }

    .method-step-title {
      font-size: 0.78rem; font-weight: 600; color: #1a1a2e;
      display: block; margin-bottom: 4px;
    }
    .method-step-desc {
      font-size: 0.68rem; color: rgba(0,0,0,0.45); line-height: 1.4;
    }
    .method-pending-tag {
      display: inline-flex; align-items: center;
      padding: 1px 8px; border-radius: 10px; margin-top: 8px;
      background: #fef3c7; color: #92400e;
      font-size: 0.6rem; font-weight: 600;
    }
    .method-ai-tag {
      display: inline-flex; align-items: center; gap: 2px;
      padding: 1px 8px; border-radius: 10px; margin-top: 8px;
      background: #f3e8ff; color: #7c3aed;
      font-size: 0.6rem; font-weight: 600;
      mat-icon { font-size: 10px; width: 10px; height: 10px; }
    }
    .method-connector {
      display: flex; align-items: center; justify-content: center;
      min-width: 28px; flex-shrink: 0; position: relative;
      &::before {
        content: ''; width: 100%; height: 2px;
        background: #d1d5db;
      }
    }
    .method-loop-icon {
      position: absolute; top: -6px;
      font-size: 12px; width: 12px; height: 12px; color: #a78bfa;
    }
    .method-cta {
      margin-top: 18px;
      button {
        font-size: 0.8rem !important;
        mat-icon { font-size: 16px; width: 16px; height: 16px; margin-right: 4px; }
      }
    }

    /* ── Modules grid ─────────────────────────────────── */
    .modules-section { margin-bottom: 40px; }
    .modules-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
      gap: 14px;
    }
    .module-card {
      display: flex; flex-direction: column; gap: 12px;
      padding: 20px; border-radius: 12px;
      background: white; border: 1px solid #e5e7eb;
      cursor: pointer; transition: all 0.2s;
      position: relative;
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        border-color: #c7d2fe;
      }
    }
    .module-icon-wrap {
      width: 42px; height: 42px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 1.3rem; width: 1.3rem; height: 1.3rem; color: white; }
    }
    .icon-bg--pink { background: linear-gradient(135deg, #da6ccf, #c054b5); }
    .icon-bg--blue { background: linear-gradient(135deg, #3f51b5, #3949ab); }
    .icon-bg--teal { background: linear-gradient(135deg, #00897b, #00796b); }
    .icon-bg--amber { background: linear-gradient(135deg, #f59e0b, #d97706); }
    .icon-bg--indigo { background: linear-gradient(135deg, #6366f1, #4f46e5); }

    .module-info {
      h3 { margin: 0 0 4px; font-size: 0.95rem; font-weight: 600; color: #1a1a2e; }
      p { margin: 0; font-size: 0.78rem; color: rgba(0,0,0,0.5); line-height: 1.5; }
    }
    .module-tags {
      display: flex; gap: 6px; flex-wrap: wrap;
    }
    .module-tag {
      padding: 2px 8px; border-radius: 8px;
      background: #f1f5f9; color: #475569;
      font-size: 0.65rem; font-weight: 500;
    }
    .module-arrow {
      position: absolute; top: 20px; right: 16px;
      color: rgba(0,0,0,0.15); font-size: 18px; width: 18px; height: 18px;
      transition: color 0.2s;
    }
    .module-card:hover .module-arrow { color: #3f51b5; }

    .module-card--pink:hover { border-color: #f0abeb; }
    .module-card--blue:hover { border-color: #93a4e8; }
    .module-card--teal:hover { border-color: #80cbc4; }
    .module-card--amber:hover { border-color: #fcd34d; }
    .module-card--indigo:hover { border-color: #a5b4fc; }

    /* ── Footer ───────────────────────────────────────── */
    .home-footer {
      margin-top: 8px;
    }
    .footer-content {
      display: flex; align-items: center; gap: 12px;
      padding: 16px 20px; border-radius: 10px;
      background: #f8f7ff; border: 1px solid #e8e4f3;
      mat-icon { color: #da6ccf; flex-shrink: 0; }
      p {
        margin: 0; font-size: 0.78rem;
        color: rgba(0,0,0,0.5); line-height: 1.5;
      }
      p strong { color: #1a1a2e; }
    }
  `],
})
export class HomeComponent {
  private readonly router = inject(Router);

  readonly methodSteps = [
    { title: 'Refinamiento', desc: 'Equipo + cliente alinean la necesidad', color: 'blue', ai: false, loopNext: false, pending: false },
    { title: 'Spec con IA', desc: 'Claude genera el spec técnico', color: 'purple', ai: true, loopNext: true, pending: false },
    { title: 'Revisión QA', desc: 'QA valida alcance y casos borde', color: 'purple', ai: false, loopNext: false, pending: true },
    { title: 'Implementación', desc: 'Desarrollo por fases con Claude Code', color: 'indigo', ai: true, loopNext: false, pending: false },
    { title: 'Entrega', desc: 'Pruebas, CI/CD y validación QA', color: 'emerald', ai: false, loopNext: false, pending: true },
  ];

  readonly modules = [
    {
      title: 'Account Planning',
      desc: 'Perfilamiento inteligente de clientes con búsqueda web, análisis profundo y generación de portafolio comercial.',
      icon: 'business_center',
      route: '/account-planning',
      accent: 'pink',
      tags: ['Búsqueda web', 'LLM', 'Dashboard ejecutivo'],
    },
    {
      title: 'Agente PM',
      desc: 'Asistente de gestión de proyectos que organiza tareas, prioriza y da seguimiento al equipo.',
      icon: 'hub',
      route: '/projectmanageragent',
      accent: 'blue',
      tags: ['Gestión', 'Orquestación', 'Seguimiento'],
    },
    {
      title: 'Propuestas',
      desc: 'Generación y revisión colaborativa de propuestas comerciales con flujo de aprobación multi-rol.',
      icon: 'description',
      route: '/proposals',
      accent: 'teal',
      tags: ['Colaboración', 'Multi-rol', 'Aprobación'],
    },
    {
      title: 'Conocimiento',
      desc: 'Base de conocimiento organizacional alimentada por documentos, con búsqueda semántica.',
      icon: 'psychology',
      route: '/knowledge',
      accent: 'amber',
      tags: ['RAG', 'Documentos', 'Búsqueda semántica'],
    },
    {
      title: 'Metodología',
      desc: 'Guía interactiva de la metodología Design Docs + Context Engineering para desarrollo con IA.',
      icon: 'auto_stories',
      route: '/dev-methodology',
      accent: 'indigo',
      tags: ['Design Docs', 'Context Engineering', 'Guía'],
    },
  ];

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
