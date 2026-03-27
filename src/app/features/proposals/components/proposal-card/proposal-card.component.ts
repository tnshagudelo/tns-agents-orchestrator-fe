import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Proposal, ProposalRole } from '../../models/proposal.model';

export interface ProposalCardAction {
  proposalId: string;
  action: 'open' | 'review' | 'view';
}

@Component({
  selector: 'app-proposal-card',
  standalone: true,
  imports: [DatePipe, MatCardModule, MatChipsModule, MatIconModule, MatButtonModule, MatTooltipModule, MatProgressBarModule],
  templateUrl: './proposal-card.component.html',
  styles: [`
    .proposal-card {
      margin-bottom: 4px;
      cursor: grab;
      border: 1px solid #ede9f8;
      transition: box-shadow 0.2s, border-color 0.2s;
      &:hover { box-shadow: 0 4px 14px rgba(45,27,107,0.12); border-color: #c4b5e8; }
    }

    mat-card-content { padding: 12px !important; display: flex; flex-direction: column; gap: 10px; }

    .card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
    .card-titles { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .proposal-name { font-weight: 600; font-size: 0.88rem; color: #1a1a2e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .project-name { font-size: 0.73rem; color: #6b7280; }

    .status-chip {
      font-size: 0.7rem; padding: 0 8px; height: 22px; flex-shrink: 0;
      mat-icon { font-size: 0.85rem; width: 0.85rem; height: 0.85rem; }
    }
    .status-draft            { --mdc-chip-label-text-color: #6b7280; background: #f4f4f5 !important; }
    .status-in_review        { --mdc-chip-label-text-color: #BA7517; background: #fef3c7 !important; }
    .status-pending_approval { --mdc-chip-label-text-color: #185FA5; background: #dbeafe !important; }
    .status-approved         { --mdc-chip-label-text-color: #3B6D11; background: #dcfce7 !important; }
    .status-rejected         { --mdc-chip-label-text-color: #A32D2D; background: #fee2e2 !important; }

    .tags { display: flex; flex-wrap: wrap; gap: 4px; }
    .tag-chip { font-size: 0.7rem; height: 20px; background: #ede9f8 !important; --mdc-chip-label-text-color: #4a3b7c !important; }

    .approval-progress { display: flex; flex-direction: column; gap: 4px; }
    mat-progress-bar { border-radius: 4px; --mdc-linear-progress-active-indicator-color: #6d4fcf; }
    .progress-label { font-size: 0.7rem; color: #9ca3af; text-align: right; }

    .card-footer { display: flex; justify-content: space-between; align-items: center; }

    .avatars { display: flex; gap: -4px; }
    .avatar {
      width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 0.7rem; font-weight: 700; color: white; border: 2px solid white;
      background: #9ca3af;
      &-pending          { background: #9ca3af; }
      &-approved         { background: #3B6D11; }
      &-rejected         { background: #A32D2D; }
      &-changes_requested{ background: #BA7517; }
    }

    .footer-right { display: flex; align-items: center; gap: 8px; }
    .card-date { font-size: 0.72rem; color: #9ca3af; }
    .action-btn {
      font-size: 0.75rem; height: 28px; line-height: 28px; padding: 0 10px;
      color: #2D1B6B; border-color: #c4b5e8;
      mat-icon { font-size: 0.9rem; width: 0.9rem; height: 0.9rem; }
      &:hover { background: #f0edf7; }
    }
  `],
})
export class ProposalCardComponent {
  proposal = input.required<Proposal>();
  currentRole = input<ProposalRole>('builder');
  action = output<ProposalCardAction>();

  statusIcon(): string {
    return { draft: 'edit_note', in_review: 'rate_review', pending_approval: 'pending_actions', approved: 'check_circle', rejected: 'cancel' }[this.proposal().status];
  }

  statusLabel(): string {
    return { draft: 'Borrador', in_review: 'En revisión', pending_approval: 'Aprobación', approved: 'Aprobado', rejected: 'Rechazado' }[this.proposal().status];
  }

  approvedSteps(): number {
    return this.proposal().approvalFlow.filter(s => s.status === 'approved').length;
  }

  approvalProgress(): number {
    const total = this.proposal().approvalFlow.length;
    return total ? (this.approvedSteps() / total) * 100 : 0;
  }

  actionIcon(): string {
    const s = this.proposal().status;
    if (s === 'draft') return 'open_in_new';
    if (s === 'in_review' || s === 'pending_approval') return 'rate_review';
    return 'visibility';
  }

  actionLabel(): string {
    const s = this.proposal().status;
    if (s === 'draft') return 'Editar';
    if (s === 'in_review' || s === 'pending_approval') return 'Revisar';
    return 'Ver';
  }

  onAction(): void {
    const s = this.proposal().status;
    const action = s === 'draft' ? 'open' : (s === 'in_review' || s === 'pending_approval' ? 'review' : 'view');
    this.action.emit({ proposalId: this.proposal().id, action });
  }
}
