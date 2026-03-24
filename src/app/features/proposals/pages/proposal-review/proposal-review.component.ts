import { Component, inject, OnInit, signal, computed, ViewChild, ElementRef, effect } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import mermaid from 'mermaid';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { ProposalsService } from '../../services/proposals.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ProposalDiffComponent } from '../../components/proposal-diff/proposal-diff.component';
import { CommentThreadComponent } from '../../components/comment-thread/comment-thread.component';
import { ProposalChatPanelComponent } from '../../components/proposal-chat-panel/proposal-chat-panel.component';
import { ProposalApprovalStep, ProposalRole } from '../../models/proposal.model';
import { MarkdownModule } from 'ngx-markdown';

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

@Component({
  selector: 'app-proposal-review',
  standalone: true,
  imports: [
    DatePipe, FormsModule, RouterLink,
    MatButtonModule, MatIconModule, MatCardModule, MatChipsModule,
    MatTabsModule, MatTooltipModule, MatProgressBarModule, MatCheckboxModule,
    MatFormFieldModule, MatInputModule, MatDividerModule,
    ProposalDiffComponent, CommentThreadComponent, ProposalChatPanelComponent,
    MarkdownModule,
  ],
  template: `
    <div class="review-layout">

      <!-- Topbar -->
      <div class="topbar">
        <button mat-icon-button routerLink="/proposals" matTooltip="Volver">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="topbar-title">
          @if (proposal(); as p) {
            <span class="p-project">{{ p.projectName }}</span>
            <mat-icon class="sep">chevron_right</mat-icon>
            <span class="p-name">{{ p.name }}</span>
          }
        </div>
        <div class="stage-pills">
          <div class="stage-pill stage-done">
            <mat-icon>check_circle</mat-icon> Construcción
          </div>
          <div class="stage-arrow"><mat-icon>arrow_forward</mat-icon></div>
          <div class="stage-pill" [class.stage-active]="proposal()?.status === 'in_review'">
            <mat-icon>rate_review</mat-icon> Revisión
          </div>
          <div class="stage-arrow"><mat-icon>arrow_forward</mat-icon></div>
          <div class="stage-pill" [class.stage-active]="proposal()?.status === 'pending_approval'">
            <mat-icon>verified</mat-icon> Aprobación
          </div>
        </div>
      </div>

      <div class="review-body">

        <!-- ── PANEL IZQUIERDO ── -->
        <div class="panel-left">

          <!-- Iteration tabs -->
          @if (proposal(); as p) {
            <div class="iter-tabs">
              @for (iter of p.iterations; track iter.version) {
                <button class="iter-tab" [class.iter-tab--active]="selectedIteration() === iter.version"
                  (click)="selectedIteration.set(iter.version)">
                  v{{ iter.version }}
                </button>
              }
            </div>

            <!-- Proposal content / Diff toggle -->
            <mat-card class="diff-card">
              <mat-card-header>
                <mat-card-title class="diff-card-header">
                  <div class="view-toggle">
                    <button class="toggle-btn" [class.toggle-btn--active]="reviewViewMode() === 'proposal'"
                      (click)="reviewViewMode.set('proposal')">
                      <mat-icon>description</mat-icon> Propuesta
                    </button>
                    <button class="toggle-btn" [class.toggle-btn--active]="reviewViewMode() === 'changes'"
                      (click)="reviewViewMode.set('changes')">
                      <mat-icon>compare_arrows</mat-icon> Cambios
                      @if (previousIteration()) {
                        <span class="diff-subtitle">vs v{{ previousIteration()!.version }}</span>
                      }
                    </button>
                  </div>
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                @if (currentIterationData(); as cur) {
                  @if (reviewViewMode() === 'proposal') {
                    <div class="proposal-content" #proposalContent>
                      @if (cur.content) {
                        <markdown [data]="cur.content" class="md-content"></markdown>
                      } @else {
                        <div class="no-content">
                          <mat-icon>article</mat-icon>
                          <span>Esta iteración aún no tiene contenido.</span>
                        </div>
                      }
                    </div>
                  } @else {
                    <app-proposal-diff [current]="cur" [previous]="previousIteration()" />
                  }
                }
              </mat-card-content>
            </mat-card>

            <!-- Comments for this iteration -->
            <mat-card class="comments-card">
              <mat-card-header>
                <mat-card-title>Comentarios v{{ selectedIteration() }}</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <app-comment-thread
                  [comments]="p.comments"
                  [filterIteration]="selectedIteration()"
                  (addComment)="onAddComment($event)"
                  (askAgent)="openAgentPanel($event)" />
              </mat-card-content>
            </mat-card>
          }
        </div>

        <!-- ── PANEL DERECHO ── -->
        <div class="panel-right">

          @if (proposal(); as p) {
            <!-- Metadata -->
            <mat-card class="meta-card">
              <mat-card-content>
                <div class="meta-row">
                  <mat-icon>label</mat-icon>
                  <span class="status-chip status-{{ p.status }}">{{ statusLabel(p.status) }}</span>
                </div>
                <div class="meta-row">
                  <mat-icon>history</mat-icon>
                  <span>v{{ p.currentIteration }} · {{ p.iterations.length }} iteraciones</span>
                </div>
                <div class="meta-row">
                  <mat-icon>calendar_today</mat-icon>
                  <span>{{ p.updatedAt | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
                @if (p.tags.length) {
                  <div class="meta-tags">
                    @for (tag of p.tags; track tag) {
                      <mat-chip class="tag-chip" disableRipple>{{ tag }}</mat-chip>
                    }
                  </div>
                }
              </mat-card-content>
            </mat-card>

            <!-- Checklist -->
            <mat-card class="checklist-card">
              <mat-card-header>
                <mat-card-title>Checklist de revisión</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <mat-progress-bar mode="determinate" [value]="checklistProgress()" class="checklist-bar" />
                <span class="checklist-label">{{ checkedCount() }}/{{ checklist().length }}</span>

                <div class="checklist-items">
                  @for (item of checklist(); track item.id) {
                    <mat-checkbox [(ngModel)]="item.checked" (change)="updateChecklist()">
                      {{ item.label }}
                    </mat-checkbox>
                  }
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Decision -->
            <mat-card class="decision-card">
              <mat-card-header>
                <mat-card-title>Decisión</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="decision-buttons">
                  <button mat-raised-button color="primary" class="decision-btn decision-approve"
                    (click)="decide('approved')">
                    <mat-icon>check_circle</mat-icon>
                    {{ p.status === 'in_review' ? 'Aprobar y avanzar' : 'Aprobación final' }}
                  </button>
                  <button mat-stroked-button class="decision-btn decision-changes"
                    (click)="requestChanges()">
                    <mat-icon>rate_review</mat-icon>
                    Solicitar cambios
                  </button>
                  <button mat-stroked-button color="warn" class="decision-btn decision-reject"
                    (click)="requestReject()">
                    <mat-icon>cancel</mat-icon>
                    Rechazar
                  </button>
                </div>

                @if (showNote()) {
                  <div class="note-area">
                    <mat-form-field appearance="outline" class="note-field">
                      <mat-label>Nota (requerida)</mat-label>
                      <textarea matInput [(ngModel)]="decisionNote" rows="3"
                        placeholder="Explica los cambios requeridos o motivo del rechazo...">
                      </textarea>
                    </mat-form-field>
                    <div class="note-actions">
                      <button mat-button (click)="cancelDecision()">Cancelar</button>
                      <button mat-raised-button [color]="pendingDecision() === 'rejected' ? 'warn' : 'accent'"
                        (click)="confirmDecision()" [disabled]="!decisionNote.trim()">
                        Confirmar
                      </button>
                    </div>
                  </div>
                }
              </mat-card-content>
            </mat-card>
          }
        </div>

      </div>

      <!-- ── AGENT SLIDE-IN PANEL ── -->
      @if (agentPanelOpen()) {
        <div class="agent-overlay" (click)="agentPanelOpen.set(false)"></div>
        <div class="agent-slidein">
          <div class="slidein-header">
            <span>Chat con agente</span>
            <button mat-icon-button (click)="agentPanelOpen.set(false)">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          @if (proposal(); as p) {
            <app-proposal-chat-panel
              #agentPanel
              [proposalId]="p.id"
              [projectName]="p.projectName"
              (saveIteration)="onSaveIteration($event)" />
          }
        </div>
      }

    </div>
  `,
  styles: [`
    .review-layout { display: flex; flex-direction: column; height: calc(100vh - 64px); overflow: hidden; position: relative; }

    /* Topbar */
    .topbar {
      display: flex; align-items: center; gap: 12px; padding: 12px 20px;
      border-bottom: 1px solid #e5e7eb; flex-shrink: 0; background: white; flex-wrap: wrap;
    }
    .topbar-title { display: flex; align-items: center; gap: 4px; flex: 1;
      .p-project { font-size: 0.85rem; color: rgba(0,0,0,0.5); }
      .p-name { font-size: 0.95rem; font-weight: 600; }
      .sep { font-size: 1.1rem; color: rgba(0,0,0,0.3); }
    }
    .stage-pills { display: flex; align-items: center; gap: 6px; }
    .stage-pill {
      display: flex; align-items: center; gap: 4px; padding: 4px 12px;
      border-radius: 16px; font-size: 0.8rem; background: #f3f4f6; color: rgba(0,0,0,0.4);
      mat-icon { font-size: 1rem; width: 1rem; height: 1rem; }
      &.stage-done   { background: #dcfce7; color: #3B6D11; }
      &.stage-active { background: #2D1B6B; color: white; }
    }
    .stage-arrow mat-icon { font-size: 1rem; width: 1rem; height: 1rem; color: rgba(0,0,0,0.3); }

    /* Body */
    .review-body { display: flex; flex: 1; overflow: hidden; min-height: 0; }

    /* Left panel */
    .panel-left { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; min-width: 0; }

    .iter-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
    .iter-tab {
      padding: 4px 14px; border-radius: 16px; border: 1px solid #e5e7eb;
      background: white; font-size: 0.8rem; cursor: pointer;
      &:hover { border-color: #2D1B6B; }
      &--active { background: #2D1B6B; color: white; border-color: #2D1B6B; }
    }
    .diff-subtitle { font-size: 0.72rem; color: rgba(0,0,0,0.4); margin-left: 4px; font-weight: 400; }

    .diff-card-header { width: 100%; }
    .view-toggle {
      display: flex; gap: 4px; background: #f3f4f6; border-radius: 8px; padding: 3px;
    }
    .toggle-btn {
      display: flex; align-items: center; gap: 4px; padding: 5px 14px;
      border-radius: 6px; border: none; background: transparent;
      font-size: 0.8rem; cursor: pointer; color: rgba(0,0,0,0.5); transition: all 0.2s;
      mat-icon { font-size: 1rem; width: 1rem; height: 1rem; }
      &:hover { color: rgba(0,0,0,0.7); }
      &--active { background: white; color: #2D1B6B; font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    }

    .proposal-content {
      padding: 8px 0;
      max-height: 60vh;
      overflow-y: auto;
    }
    .proposal-content ::ng-deep {
      h1, h2, h3, h4 { margin-top: 16px; margin-bottom: 8px; color: #1a1a2e; }
      h1 { font-size: 1.4rem; }
      h2 { font-size: 1.15rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
      h3 { font-size: 1rem; }
      p { font-size: 0.88rem; line-height: 1.6; color: rgba(0,0,0,0.75); }
      ul, ol { padding-left: 20px; font-size: 0.88rem; }
      li { margin-bottom: 4px; }
      table { width: 100%; border-collapse: collapse; font-size: 0.82rem; margin: 12px 0; }
      th { background: #f3f4f6; padding: 8px 10px; text-align: left; font-weight: 600; border: 1px solid #e5e7eb; }
      td { padding: 8px 10px; border: 1px solid #e5e7eb; }
      tr:nth-child(even) td { background: #fafafa; }
      code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 0.82rem; }
      pre { background: #1e1e2e; color: #cdd6f4; padding: 14px; border-radius: 8px; overflow-x: auto;
        code { background: none; padding: 0; color: inherit; }
      }
      blockquote { border-left: 3px solid #2D1B6B; margin: 12px 0; padding: 8px 16px; background: #f8f7ff; color: rgba(0,0,0,0.7); }
    }

    .no-content {
      display: flex; align-items: center; gap: 8px; padding: 24px;
      color: rgba(0,0,0,0.4); font-size: 0.85rem;
      mat-icon { font-size: 1.2rem; width: 1.2rem; height: 1.2rem; }
    }

    /* Right panel */
    .panel-right { width: 300px; flex-shrink: 0; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; border-left: 1px solid #e5e7eb; background: #fafafa; }

    .meta-card mat-card-content { display: flex; flex-direction: column; gap: 8px; padding: 12px !important; }
    .meta-row { display: flex; align-items: center; gap: 8px; font-size: 0.85rem;
      mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; color: rgba(0,0,0,0.5); }
    }
    .status-chip { padding: 2px 10px; border-radius: 12px; font-size: 0.78rem; }
    .status-draft            { color: #888780; background: #f5f5f4; }
    .status-in_review        { color: #BA7517; background: #fef3c7; }
    .status-pending_approval { color: #185FA5; background: #dbeafe; }
    .status-approved         { color: #3B6D11; background: #dcfce7; }
    .status-rejected         { color: #A32D2D; background: #fee2e2; }
    .meta-tags { display: flex; flex-wrap: wrap; gap: 4px; }
    .tag-chip { font-size: 0.7rem; height: 20px; }

    .checklist-bar { border-radius: 4px; margin-bottom: 4px; }
    .checklist-label { font-size: 0.72rem; color: rgba(0,0,0,0.45); display: block; text-align: right; margin-bottom: 12px; }
    .checklist-items { display: flex; flex-direction: column; gap: 6px; }
    mat-checkbox { font-size: 0.85rem; }

    .decision-buttons { display: flex; flex-direction: column; gap: 8px; }
    .decision-btn { width: 100%; }
    .note-area { margin-top: 12px; display: flex; flex-direction: column; gap: 8px; animation: slideIn 0.2s ease; }
    @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
    .note-field { width: 100%; }
    .note-actions { display: flex; justify-content: flex-end; gap: 8px; }

    /* Agent slide-in */
    .agent-overlay {
      position: absolute; inset: 0; background: rgba(0,0,0,0.3); z-index: 10;
    }
    .agent-slidein {
      position: absolute; right: 0; top: 0; bottom: 0; width: 380px;
      background: white; z-index: 20; display: flex; flex-direction: column;
      box-shadow: -4px 0 16px rgba(0,0,0,0.15); animation: slideRight 0.25s ease;
    }
    @keyframes slideRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
    .slidein-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-weight: 600;
    }
  `],
})
export class ProposalReviewComponent implements OnInit {
  @ViewChild('agentPanel') agentPanel?: ProposalChatPanelComponent;
  @ViewChild('proposalContent') proposalContentRef?: ElementRef<HTMLElement>;

  private readonly route = inject(ActivatedRoute);
  protected readonly proposalsService = inject(ProposalsService);
  private readonly notifications = inject(NotificationService);

  selectedIteration = signal(1);
  reviewViewMode = signal<'proposal' | 'changes'>('proposal');
  agentPanelOpen = signal(false);
  showNote = signal(false);
  pendingDecision = signal<'changes_requested' | 'rejected' | null>(null);
  decisionNote = '';

  readonly proposal = this.proposalsService.selectedProposal;

  readonly currentIterationData = computed(() => {
    const p = this.proposal();
    if (!p) return null;
    return p.iterations.find(i => i.version === this.selectedIteration()) ?? null;
  });

  readonly previousIteration = computed(() => {
    const p = this.proposal();
    const sel = this.selectedIteration();
    if (!p || sel <= 1) return null;
    return p.iterations.find(i => i.version === sel - 1) ?? null;
  });

  checklist = signal<ChecklistItem[]>([
    { id: '1', label: 'Arquitectura coherente y bien definida', checked: false },
    { id: '2', label: 'Equipo justificado para el alcance', checked: false },
    { id: '3', label: 'Riesgos documentados', checked: false },
    { id: '4', label: 'Consideraciones de seguridad incluidas', checked: false },
    { id: '5', label: 'Presupuesto razonable y desglosado', checked: false },
  ]);

  readonly checkedCount = computed(() => this.checklist().filter(c => c.checked).length);
  readonly checklistProgress = computed(() => (this.checkedCount() / this.checklist().length) * 100);

  constructor() {
    mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });

    effect(() => {
      // Track dependencies to re-run on changes
      this.currentIterationData();
      this.reviewViewMode();

      // Defer to next tick so the DOM is updated
      setTimeout(() => this.renderMermaidDivs(), 100);
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.proposalsService.getById(id).subscribe({
      next: p => this.selectedIteration.set(p.currentIteration),
      error: () => this.notifications.error('Error al cargar la propuesta'),
    });
  }

  private renderMermaidDivs(): void {
    const container = this.proposalContentRef?.nativeElement;
    if (!container) return;
    const divs = Array.from(
      container.querySelectorAll<HTMLElement>('.mermaid:not([data-mermaid-processed])')
    );
    if (divs.length === 0) return;
    divs.forEach(el => {
      const decoded = el.textContent ?? '';
      el.textContent = decoded;
      el.removeAttribute('data-processed');
      el.setAttribute('data-mermaid-processed', 'true');
    });
    mermaid.run({ nodes: divs }).catch(() => {/* suppress parse errors */});
  }

  updateChecklist(): void {
    this.checklist.update(list => [...list]);
  }

  decide(status: ProposalApprovalStep['status']): void {
    const p = this.proposal();
    if (!p) return;
    const role: ProposalRole = p.status === 'in_review' ? 'reviewer' : 'approver';
    this.proposalsService.decide(p.id, role, status).subscribe({
      next: () => this.notifications.success(`Decisión registrada: ${status}`),
      error: () => this.notifications.error('Error al registrar decisión'),
    });
  }

  requestChanges(): void {
    this.pendingDecision.set('changes_requested');
    this.showNote.set(true);
  }

  requestReject(): void {
    this.pendingDecision.set('rejected');
    this.showNote.set(true);
  }

  cancelDecision(): void {
    this.showNote.set(false);
    this.pendingDecision.set(null);
    this.decisionNote = '';
  }

  confirmDecision(): void {
    const p = this.proposal();
    const decision = this.pendingDecision();
    if (!p || !decision) return;
    const role: ProposalRole = p.status === 'in_review' ? 'reviewer' : 'approver';
    this.proposalsService.decide(p.id, role, decision, this.decisionNote).subscribe({
      next: () => {
        this.cancelDecision();
        this.notifications.success('Decisión registrada');
      },
      error: () => this.notifications.error('Error al registrar decisión'),
    });
  }

  openAgentPanel(text: string): void {
    this.agentPanelOpen.set(true);
    setTimeout(() => this.agentPanel?.addExternalMessage(text), 150);
  }

  onAddComment(body: string): void {
    const p = this.proposal();
    if (!p) return;
    this.proposalsService.addComment(p.id, {
      authorId: '1',
      authorName: 'Me',
      authorRole: 'reviewer',
      body,
      iterationVersion: this.selectedIteration(),
    }).subscribe({
      error: () => this.notifications.error('Error al añadir comentario'),
    });
  }

  onSaveIteration(content: string): void {
    const p = this.proposal();
    if (!p) return;
    const iter = this.currentIterationData();
    this.proposalsService.updateIteration(p.id, {
      content,
      components: iter?.components ?? [],
      teamSize: iter?.teamSize ?? 0,
      durationWeeks: iter?.durationWeeks ?? 0,
      budgetUsd: iter?.budgetUsd ?? 0,
      riskLevel: iter?.riskLevel ?? 'medium',
    }).subscribe({ error: () => this.notifications.error('Error al guardar iteración') });
  }

  statusLabel(status: string): string {
    return { draft: 'Borrador', in_review: 'En revisión', pending_approval: 'Aprobación', approved: 'Aprobado', rejected: 'Rechazado' }[status] ?? status;
  }
}
