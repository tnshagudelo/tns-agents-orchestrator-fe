import { Component, inject, OnInit, signal, computed, viewChild, ElementRef, effect } from '@angular/core';
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
  templateUrl: './proposal-workpad.component.html',
  styleUrl: './proposal-workpad.component.scss',
})
export class ProposalWorkpadComponent implements OnInit {
  readonly chatPanel = viewChild<ProposalChatPanelComponent>('chatPanel');
  readonly readonlyContentRef = viewChild<ElementRef<HTMLElement>>('readonlyContent');

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
    setTimeout(() => this.chatPanel()?.addExternalMessage(text), 100);
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
    const container = this.readonlyContentRef()?.nativeElement;
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
