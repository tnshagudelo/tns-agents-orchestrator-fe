import { Component, inject, OnInit, signal, computed, ViewChild, ElementRef, effect } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
import { AuthService } from '../../../../core/auth/auth.service';
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
            <!-- Metadata (siempre visible) -->
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

            @if (isTerminal()) {
              <!-- ── Resumen de resolución (estados terminales) ── -->
              <mat-card class="resolution-card resolution-{{ p.status }}">
                <mat-card-content>
                  <div class="resolution-badge">
                    <mat-icon>{{ p.status === 'approved' ? 'check_circle' : 'cancel' }}</mat-icon>
                    <span>{{ p.status === 'approved' ? 'Propuesta aprobada' : 'Propuesta rechazada' }}</span>
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Línea de tiempo del flujo -->
              <mat-card class="timeline-card">
                <mat-card-header>
                  <mat-card-title>Flujo de aprobación</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="timeline">
                    @for (step of p.approvalFlow; track step.role) {
                      <div class="timeline-step" [class]="'tl-' + step.status">
                        <div class="tl-icon">
                          <mat-icon>{{ stepIcon(step.status) }}</mat-icon>
                        </div>
                        <div class="tl-body">
                          <span class="tl-role">{{ roleLabel(step.role) }}</span>
                          <span class="tl-user">{{ step.userName }}</span>
                          <span class="tl-status">{{ approvalStatusLabel(step.status) }}</span>
                          @if (step.decidedAt) {
                            <span class="tl-date">{{ step.decidedAt | date:'dd/MM/yyyy HH:mm' }}</span>
                          }
                          @if (step.note) {
                            <div class="tl-note">
                              <mat-icon>format_quote</mat-icon>
                              <span>{{ step.note }}</span>
                            </div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </mat-card-content>
              </mat-card>

              <button mat-stroked-button class="back-btn" routerLink="/proposals">
                <mat-icon>arrow_back</mat-icon> Volver al tablero
              </button>

            } @else {
              <!-- ── Flujo activo (in_review / pending_approval) ── -->

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
                  @if (canDecide()) {
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
                  } @else {
                    <div class="decision-hint">
                      <mat-icon>info</mat-icon>
                      <span>{{ decisionHint() }}</span>
                    </div>
                  }
                </mat-card-content>
              </mat-card>
            }
          }
        </div>

      </div>

      <!-- ── AGENT SLIDE-IN PANEL (solo en flujo activo) ── -->
      @if (agentPanelOpen() && !isTerminal()) {
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
  styleUrl: './proposal-review.component.scss',
})
export class ProposalReviewComponent implements OnInit {
  @ViewChild('agentPanel') agentPanel?: ProposalChatPanelComponent;
  @ViewChild('proposalContent') proposalContentRef?: ElementRef<HTMLElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly proposalsService = inject(ProposalsService);
  private readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationService);

  selectedIteration = signal(1);
  reviewViewMode = signal<'proposal' | 'changes'>('proposal');
  agentPanelOpen = signal(false);
  showNote = signal(false);
  pendingDecision = signal<'changes_requested' | 'rejected' | null>(null);
  decisionNote = '';

  readonly proposal = this.proposalsService.selectedProposal;

  readonly isTerminal = computed(() => {
    const s = this.proposal()?.status;
    return s === 'approved' || s === 'rejected';
  });

  /** Paso del approval flow que resolvió la propuesta (el que tiene status approved/rejected) */
  readonly resolutionSteps = computed(() => {
    const p = this.proposal();
    if (!p) return [];
    return p.approvalFlow.filter(s => s.status !== 'pending');
  });

  /** El usuario puede decidir solo si su rol corresponde al estado actual */
  readonly canDecide = computed(() => {
    const p = this.proposal();
    const role = this.auth.currentUser()?.proposalRole;
    if (!p || !role) return false;
    if (p.status === 'in_review' && role === 'reviewer') return true;
    if (p.status === 'pending_approval' && role === 'approver') return true;
    return false;
  });

  readonly decisionHint = computed(() => {
    const p = this.proposal();
    const role = this.auth.currentUser()?.proposalRole;
    if (!p) return '';
    if (p.status === 'in_review' && role !== 'reviewer') return 'Solo el revisor puede tomar decisiones en este estado.';
    if (p.status === 'pending_approval' && role !== 'approver') return 'Solo el aprobador puede tomar decisiones en este estado.';
    if (p.status === 'approved') return 'Esta propuesta ya fue aprobada.';
    if (p.status === 'rejected') return 'Esta propuesta fue rechazada.';
    return '';
  });

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
    { id: '5', label: 'Estimación de personas y semanas coherente', checked: false },
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
    const role: ProposalRole = this.auth.currentUser()?.proposalRole as ProposalRole ?? 'reviewer';
    this.proposalsService.decide(p.id, role, status).subscribe({
      next: () => {
        const labels: Record<string, string> = { approved: 'Aprobada', rejected: 'Rechazada', changes_requested: 'Cambios solicitados', pending: 'Pendiente' };
        const label = labels[status] ?? status;
        this.notifications.success(`Decisión registrada: ${label}`);
        this.navigateBackAfterDecision();
      },
      error: (err) => this.notifications.error(err?.error?.error ?? 'Error al registrar decisión'),
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
    const role: ProposalRole = this.auth.currentUser()?.proposalRole as ProposalRole ?? 'reviewer';
    this.proposalsService.decide(p.id, role, decision, this.decisionNote).subscribe({
      next: () => {
        const label = { changes_requested: 'Cambios solicitados', rejected: 'Rechazada' }[decision] ?? decision;
        this.cancelDecision();
        this.notifications.success(`Decisión registrada: ${label}`);
        this.navigateBackAfterDecision();
      },
      error: (err) => this.notifications.error(err?.error?.error ?? 'Error al registrar decisión'),
    });
  }

  private navigateBackAfterDecision(): void {
    setTimeout(() => this.router.navigate(['/proposals']), 1200);
  }

  openAgentPanel(text: string): void {
    this.agentPanelOpen.set(true);
    setTimeout(() => this.agentPanel?.addExternalMessage(text), 150);
  }

  onAddComment(body: string): void {
    const p = this.proposal();
    if (!p) return;
    this.proposalsService.addComment(p.id, {
      authorId: this.auth.currentUser()?.id ?? '',
      authorName: this.auth.currentUser()?.username ?? '',
      authorRole: this.auth.currentUser()?.proposalRole ?? 'reviewer',
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
      riskLevel: iter?.riskLevel ?? 'medium',
    }).subscribe({ error: () => this.notifications.error('Error al guardar iteración') });
  }

  statusLabel(status: string): string {
    return { draft: 'Borrador', in_review: 'En revisión', pending_approval: 'Aprobación', approved: 'Aprobado', rejected: 'Rechazado' }[status] ?? status;
  }

  stepIcon(status: string): string {
    return { pending: 'radio_button_unchecked', approved: 'check_circle', rejected: 'cancel', changes_requested: 'rate_review' }[status] ?? 'help';
  }

  roleLabel(role: string): string {
    return { builder: 'Constructor', reviewer: 'Revisor', approver: 'Aprobador' }[role] ?? role;
  }

  approvalStatusLabel(status: string): string {
    return { pending: 'Pendiente', approved: 'Aprobado', rejected: 'Rechazado', changes_requested: 'Cambios solicitados' }[status] ?? status;
  }
}
