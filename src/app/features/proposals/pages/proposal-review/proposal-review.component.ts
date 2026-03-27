import { Component, inject, OnInit, signal, computed, viewChild, ElementRef, effect } from '@angular/core';
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
  templateUrl: './proposal-review.component.html',
  styleUrl: './proposal-review.component.scss',
})
export class ProposalReviewComponent implements OnInit {
  readonly agentPanel = viewChild<ProposalChatPanelComponent>('agentPanel');
  readonly proposalContentRef = viewChild<ElementRef<HTMLElement>>('proposalContent');

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
    const container = this.proposalContentRef()?.nativeElement;
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
    setTimeout(() => this.agentPanel()?.addExternalMessage(text), 150);
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
