import { Component, inject, OnInit, signal, computed, ViewChild, ElementRef, effect } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { ProposalsService } from '../../services/proposals.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ProposalChatPanelComponent } from '../../components/proposal-chat-panel/proposal-chat-panel.component';
import { CommentThreadComponent } from '../../components/comment-thread/comment-thread.component';
import { ApprovalFlowComponent } from '../../components/approval-flow/approval-flow.component';
import { ProposalIteration, ProposalApprovalStep } from '../../models/proposal.model';
import { ProposalChatService } from '../../services/proposal-chat.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { MarkdownModule } from 'ngx-markdown';
import mermaid from 'mermaid';

@Component({
  selector: 'app-proposal-workpad',
  standalone: true,
  imports: [
    DatePipe, FormsModule, RouterLink,
    MatButtonModule, MatIconModule, MatCardModule, MatChipsModule,
    MatTabsModule, MatTooltipModule, MatProgressBarModule, MatDividerModule,
    ProposalChatPanelComponent, CommentThreadComponent, ApprovalFlowComponent,
    MarkdownModule,
  ],
  template: `
    <div class="workpad-layout">

      <!-- ── ZONA IZQUIERDA ────────────────────────────────────── -->
      <aside class="zone-left">
        <div class="back-link">
          <button mat-icon-button routerLink="/proposals" matTooltip="Volver">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <span class="back-label">Propuestas</span>
        </div>

        @if (proposal(); as p) {
          <div class="project-info">
            @if (!isTerminal() && editingProject()) {
              <input class="inline-input" [(ngModel)]="editProjectName" (blur)="saveProjectName()" (keydown.enter)="saveProjectName()" autofocus />
            } @else if (!isTerminal()) {
              <span class="project-name" (click)="startEditProject()">{{ p.projectName }} <mat-icon class="edit-icon">edit</mat-icon></span>
            } @else {
              <span class="project-name project-name--readonly">{{ p.projectName }}</span>
            }
            @if (!isTerminal() && editingProposal()) {
              <input class="inline-input inline-input--large" [(ngModel)]="editProposalName" (blur)="saveProposalName()" (keydown.enter)="saveProposalName()" autofocus />
            } @else if (!isTerminal()) {
              <span class="proposal-title" (click)="startEditProposal()">{{ p.name }} <mat-icon class="edit-icon">edit</mat-icon></span>
            } @else {
              <span class="proposal-title proposal-title--readonly">{{ p.name }}</span>
            }
          </div>

          <mat-divider />

          <div class="section-label">Iteraciones</div>
          <div class="iteration-tracker">
            @for (iter of p.iterations; track iter.version) {
              <button class="iter-btn" [class.iter-btn--active]="selectedIteration() === iter.version"
                (click)="selectIteration(iter.version)">
                v{{ iter.version }}
              </button>
            }
          </div>

          @if (!isTerminal()) {
            <mat-divider />
            <div class="section-label">Flujo de aprobación</div>
            <app-approval-flow [steps]="p.approvalFlow" />
          }

          @if (currentIterationData(); as iter) {
            <mat-divider />
            <div class="section-label">Métricas</div>
            <div class="metrics-list">
              <div class="metric-item">
                <mat-icon>group</mat-icon>
                <span>{{ iter.teamSize }} personas</span>
              </div>
              <div class="metric-item">
                <mat-icon>schedule</mat-icon>
                <span>{{ iter.durationWeeks }} semanas</span>
              </div>
              <div class="metric-item">
                <mat-icon [style.color]="riskColor(iter.riskLevel)">warning</mat-icon>
                <mat-chip class="risk-chip risk-{{ iter.riskLevel }}" disableRipple>{{ iter.riskLevel }}</mat-chip>
              </div>
            </div>
          }

          @if (isTerminal()) {
            <mat-divider />
            <div class="resolution-banner resolution-{{ p.status }}">
              <mat-icon>{{ p.status === 'approved' ? 'check_circle' : 'cancel' }}</mat-icon>
              <span>{{ p.status === 'approved' ? 'Aprobada' : 'Rechazada' }}</span>
            </div>

            <!-- Timeline del flujo -->
            <div class="section-label">Flujo de decisiones</div>
            <div class="flow-timeline">
              @for (step of p.approvalFlow; track step.role) {
                <div class="flow-step flow-{{ step.status }}">
                  <div class="flow-icon">
                    <mat-icon>{{ stepIcon(step.status) }}</mat-icon>
                  </div>
                  <div class="flow-body">
                    <span class="flow-role">{{ roleLabel(step.role) }}</span>
                    <span class="flow-user">{{ step.userName }}</span>
                    @if (step.decidedAt) {
                      <span class="flow-date">{{ step.decidedAt | date:'dd/MM/yyyy HH:mm' }}</span>
                    }
                    @if (step.note) {
                      <div class="flow-note">{{ step.note }}</div>
                    }
                  </div>
                </div>
              }
            </div>

            @if (auth.currentUser()?.proposalRole === 'approver') {
              <mat-divider />
              <div class="delete-zone">
                @if (!confirmingDelete()) {
                  <button class="delete-btn" (click)="confirmingDelete.set(true)">
                    <mat-icon>delete_outline</mat-icon> Eliminar propuesta
                  </button>
                } @else {
                  <div class="delete-confirm">
                    <span class="delete-confirm-text">¿Eliminar permanentemente?</span>
                    <div class="delete-confirm-actions">
                      <button class="delete-confirm-yes" (click)="deleteProposal()">Sí, eliminar</button>
                      <button class="delete-confirm-no" (click)="confirmingDelete.set(false)">Cancelar</button>
                    </div>
                  </div>
                }
              </div>
            }
          } @else if (p.status === 'draft') {
            <mat-divider />
            <button mat-raised-button color="primary" class="submit-btn" (click)="submitForReview()">
              <mat-icon>send</mat-icon> Enviar a revisión
            </button>

            <div class="delete-zone">
              @if (!confirmingDelete()) {
                <button class="delete-btn" (click)="confirmingDelete.set(true)">
                  <mat-icon>delete_outline</mat-icon> Eliminar borrador
                </button>
              } @else {
                <div class="delete-confirm">
                  <span class="delete-confirm-text">¿Eliminar permanentemente?</span>
                  <div class="delete-confirm-actions">
                    <button class="delete-confirm-yes" (click)="deleteProposal()">Sí, eliminar</button>
                    <button class="delete-confirm-no" (click)="confirmingDelete.set(false)">Cancelar</button>
                  </div>
                </div>
              }
            </div>
          }
        } @else {
          <div class="loading-left">
            <mat-icon class="spin">sync</mat-icon>
          </div>
        }
      </aside>

      <!-- ── ZONA CENTRAL ──────────────────────────────────────── -->
      <main class="zone-center">
        <!-- Workpad header -->
        <div class="workpad-header">
          <div class="header-left">
            <span class="iteration-label">
              @if (proposal(); as p) { v{{ selectedIteration() }} de {{ p.name }} }
            </span>
            @if (isTerminal()) {
              <mat-chip-set>
                <mat-chip class="mode-chip mode-chip--readonly" disableRipple>
                  <mat-icon>lock</mat-icon> Solo lectura
                </mat-chip>
              </mat-chip-set>
            } @else {
              <mat-chip-set>
                <mat-chip class="mode-chip" disableRipple>
                  <mat-icon>{{ workpadMode() === 'chat' ? 'chat' : 'edit' }}</mat-icon>
                  {{ workpadMode() === 'chat' ? 'Chat con agente' : 'Edición' }}
                </mat-chip>
              </mat-chip-set>
            }
          </div>
          <div class="header-right">
            <button mat-stroked-button (click)="copyContent()" matTooltip="Copiar contenido">
              <mat-icon>content_copy</mat-icon>
            </button>
            <button mat-stroked-button (click)="exportMarkdown()" matTooltip="Exportar markdown">
              <mat-icon>download</mat-icon>
            </button>
            @if (!isTerminal()) {
              <button mat-raised-button [color]="workpadMode() === 'chat' ? 'accent' : 'primary'"
                (click)="toggleMode()">
                <mat-icon>{{ workpadMode() === 'chat' ? 'edit' : 'chat' }}</mat-icon>
                {{ workpadMode() === 'chat' ? 'Editar' : 'Chat' }}
              </button>
            }
          </div>
        </div>

        @if (isTerminal()) {
          <!-- Readonly: markdown renderizado -->
          <div class="readonly-area" #readonlyContent>
            @if (currentIterationData(); as cur) {
              @if (cur.content) {
                <markdown [data]="cur.content" class="md-content"></markdown>
              } @else {
                <div class="readonly-empty">
                  <mat-icon>article</mat-icon>
                  <span>Esta iteración no tiene contenido.</span>
                </div>
              }
            }
          </div>
        } @else {
          <!-- Chat mode -->
          @if (workpadMode() === 'chat') {
            <div class="chat-area">
              @if (proposal(); as p) {
                <app-proposal-chat-panel
                  #chatPanel
                  [proposalId]="p.id"
                  [projectName]="p.projectName"
                  (saveIteration)="onSaveIteration($event)" />
              }
            </div>
          }

          <!-- Edit mode -->
          @if (workpadMode() === 'edit') {
            <div class="edit-area">
              <div class="edit-toolbar">
                <button mat-stroked-button (click)="insertMd('## ')">H2</button>
                <button mat-stroked-button (click)="insertMd('### ')">H3</button>
                <button mat-stroked-button (click)="insertMd('**', '**')"><b>Bold</b></button>
                <button mat-stroked-button (click)="insertMd('\`', '\`')">Code</button>
                <button mat-stroked-button (click)="insertMd('| Col1 | Col2 |\n|------|------|\n| val  | val  |\n')">Table</button>
                <span class="toolbar-spacer"></span>
                <button mat-raised-button color="primary" (click)="saveEditAsIteration()" [disabled]="!editContent().trim()">
                  <mat-icon>save</mat-icon> Guardar como iteración
                </button>
              </div>
              <textarea class="edit-canvas" [(ngModel)]="editContentStr"
                placeholder="Escribe la arquitectura en markdown..."></textarea>
            </div>
          }
        }
      </main>

      <!-- ── ZONA DERECHA ──────────────────────────────────────── -->
      <aside class="zone-right" [class.zone-right--collapsed]="rightCollapsed()">
        <button class="collapse-btn" (click)="rightCollapsed.set(!rightCollapsed())" matTooltip="Toggle panel">
          <mat-icon>{{ rightCollapsed() ? 'chevron_left' : 'chevron_right' }}</mat-icon>
        </button>

        @if (!rightCollapsed()) {
          <mat-tab-group class="collab-tabs">
            <mat-tab label="Comentarios">
              @if (proposal(); as p) {
                <app-comment-thread
                  [comments]="p.comments"
                  [filterIteration]="selectedIteration()"
                  (addComment)="onAddComment($event)"
                  (askAgent)="onAskAgent($event)" />
              }
            </mat-tab>
            <mat-tab label="Historial">
              <div class="history-timeline">
                @if (proposal(); as p) {
                  @for (iter of p.iterations; track iter.version) {
                    <div class="timeline-item">
                      <div class="timeline-dot"></div>
                      <div class="timeline-content">
                        <span class="timeline-version">v{{ iter.version }}</span>
                        <span class="timeline-date">{{ iter.createdAt | date:'dd/MM/yy HH:mm' }}</span>
                        <span class="timeline-team">{{ iter.teamSize }} pers · {{ iter.durationWeeks }} sem</span>
                      </div>
                    </div>
                  }
                }
              </div>
            </mat-tab>
          </mat-tab-group>
        }
      </aside>

    </div>
  `,
  styleUrl: './proposal-workpad.component.scss',
})
export class ProposalWorkpadComponent implements OnInit {
  @ViewChild('chatPanel') chatPanel?: ProposalChatPanelComponent;
  @ViewChild('readonlyContent') readonlyContentRef?: ElementRef<HTMLElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly proposalsService = inject(ProposalsService);
  private readonly chatService = inject(ProposalChatService);
  protected readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationService);

  workpadMode = signal<'chat' | 'edit'>('chat');
  selectedIteration = signal(1);
  rightCollapsed = signal(false);
  editingProject = signal(false);
  editingProposal = signal(false);
  confirmingDelete = signal(false);
  editProjectName = '';
  editProposalName = '';
  editContentStr = '';

  readonly proposal = this.proposalsService.selectedProposal;

  readonly isTerminal = computed(() => {
    const s = this.proposal()?.status;
    return s === 'approved' || s === 'rejected';
  });

  readonly currentIterationData = computed(() => {
    const p = this.proposal();
    if (!p) return null;
    return p.iterations.find(i => i.version === this.selectedIteration()) ?? p.iterations[p.iterations.length - 1] ?? null;
  });

  readonly editContent = computed(() => this.editContentStr);

  constructor() {
    mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });

    effect(() => {
      this.currentIterationData();
      this.isTerminal();
      setTimeout(() => this.renderMermaidDivs(), 100);
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.proposalsService.getById(id).subscribe({
      next: p => {
        this.selectedIteration.set(p.currentIteration);
        const iter = p.iterations.find(i => i.version === p.currentIteration);
        if (iter) this.editContentStr = iter.content;
      },
      error: () => this.notifications.error('Error al cargar la propuesta'),
    });
  }

  selectIteration(version: number): void {
    this.selectedIteration.set(version);
    const iter = this.proposal()?.iterations.find(i => i.version === version);
    if (iter) this.editContentStr = iter.content;
  }

  toggleMode(): void {
    const next = this.workpadMode() === 'chat' ? 'edit' : 'chat';
    if (next === 'edit') {
      const iter = this.currentIterationData();
      if (iter) this.editContentStr = iter.content;
    }
    this.workpadMode.set(next);
  }

  startEditProject(): void {
    this.editProjectName = this.proposal()?.projectName ?? '';
    this.editingProject.set(true);
  }

  saveProjectName(): void {
    this.editingProject.set(false);
  }

  startEditProposal(): void {
    this.editProposalName = this.proposal()?.name ?? '';
    this.editingProposal.set(true);
  }

  saveProposalName(): void {
    this.editingProposal.set(false);
  }

  deleteProposal(): void {
    const id = this.proposal()?.id;
    if (!id) return;
    this.proposalsService.deleteProposal(id).subscribe({
      next: () => {
        this.notifications.success('Propuesta eliminada');
        this.router.navigate(['/proposals']);
      },
      error: (err) => {
        this.confirmingDelete.set(false);
        this.notifications.error(err?.error?.error ?? 'Error al eliminar la propuesta');
      },
    });
  }

  submitForReview(): void {
    const id = this.proposal()?.id;
    if (!id) return;
    this.proposalsService.submitForReview(id).subscribe({
      next: () => this.notifications.success('Propuesta enviada a revisión'),
      error: () => this.notifications.error('Error al enviar a revisión'),
    });
  }

  onSaveIteration(content: string): void {
    const p = this.proposal();
    if (!p) return;
    const metrics = this.chatService.currentMetrics();
    const iter = this.currentIterationData();
    const riskLevelMap: Record<string, number> = { low: 0, medium: 1, high: 2 };
    const payload = {
      content,
      components: metrics?.components ?? iter?.components ?? [],
      teamSize: metrics?.teamSize ?? iter?.teamSize ?? 0,
      durationWeeks: metrics?.durationWeeks ?? iter?.durationWeeks ?? 0,
      riskLevel: (riskLevelMap[(metrics?.riskLevel ?? iter?.riskLevel ?? 'medium')] ?? 1) as unknown as 'low' | 'medium' | 'high',
    };
    this.proposalsService.updateIteration(p.id, payload).subscribe({
      next: updated => {
        this.selectedIteration.set(updated.currentIteration);
        this.editContentStr = content;
        this.notifications.success('Iteración guardada');
      },
      error: () => this.notifications.error('Error al guardar iteración'),
    });
  }

  saveEditAsIteration(): void {
    this.onSaveIteration(this.editContentStr);
  }

  onAddComment(body: string): void {
    const p = this.proposal();
    if (!p) return;
    this.proposalsService.addComment(p.id, {
      authorId: this.auth.currentUser()?.id ?? '',
      authorName: this.auth.currentUser()?.username ?? '',
      authorRole: this.auth.currentUser()?.proposalRole ?? 'builder',
      body,
      iterationVersion: this.selectedIteration(),
    }).subscribe({
      error: () => this.notifications.error('Error al añadir comentario'),
    });
  }

  onAskAgent(text: string): void {
    this.workpadMode.set('chat');
    setTimeout(() => this.chatPanel?.addExternalMessage(text), 100);
  }

  copyContent(): void {
    const content = this.currentIterationData()?.content ?? '';
    navigator.clipboard.writeText(content).then(() => this.notifications.success('Copiado al portapapeles'));
  }

  exportMarkdown(): void {
    const content = this.currentIterationData()?.content ?? '';
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${this.proposal()?.name ?? 'propuesta'}.md`;
    a.click(); URL.revokeObjectURL(url);
  }

  insertMd(before: string, after = ''): void {
    this.editContentStr += before + after;
  }

  private renderMermaidDivs(): void {
    const container = this.readonlyContentRef?.nativeElement;
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
    mermaid.run({ nodes: divs }).catch(() => {});
  }

  riskColor(level: string): string {
    return { low: '#3B6D11', medium: '#BA7517', high: '#A32D2D' }[level] ?? '#888';
  }

  stepIcon(status: string): string {
    return { pending: 'radio_button_unchecked', approved: 'check_circle', rejected: 'cancel', changes_requested: 'rate_review' }[status] ?? 'help';
  }

  roleLabel(role: string): string {
    return { builder: 'Constructor', reviewer: 'Revisor', approver: 'Aprobador' }[role] ?? role;
  }
}
