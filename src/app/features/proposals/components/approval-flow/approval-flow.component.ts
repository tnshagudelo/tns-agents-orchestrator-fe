import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProposalApprovalStep } from '../../models/proposal.model';

@Component({
  selector: 'app-approval-flow',
  standalone: true,
  imports: [MatIconModule, MatTooltipModule],
  template: `
    <div class="approval-flow">
      @for (step of steps(); track step.role; let last = $last) {
        <div class="step" [class]="'step-' + step.status">
          <div class="step-icon" [matTooltip]="step.userName">
            <mat-icon>{{ stepIcon(step.status) }}</mat-icon>
          </div>
          <div class="step-info">
            <span class="step-role">{{ roleLabel(step.role) }}</span>
            <span class="step-user">{{ step.userName }}</span>
          </div>
        </div>
        @if (!last) {
          <div class="step-connector" [class.connector-done]="step.status === 'approved'"></div>
        }
      }
    </div>
  `,
  styles: [`
    .approval-flow {
      display: flex;
      align-items: center;
      gap: 0;
      padding: 8px 0;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }

    .step-icon {
      width: 32px; height: 32px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      background: #e5e7eb; color: #9ca3af;
      mat-icon { font-size: 1rem; width: 1rem; height: 1rem; }
    }

    .step-pending            .step-icon { background: #e5e7eb; color: #9ca3af; }
    .step-approved           .step-icon { background: #dcfce7; color: #3B6D11; }
    .step-rejected           .step-icon { background: #fee2e2; color: #A32D2D; }
    .step-changes_requested  .step-icon { background: #fef3c7; color: #BA7517; }

    .step-info { display: flex; flex-direction: column; align-items: center; }
    .step-role { font-size: 0.65rem; font-weight: 600; text-transform: uppercase; color: rgba(0,0,0,0.45); }
    .step-user { font-size: 0.72rem; color: rgba(0,0,0,0.7); max-width: 60px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .step-connector {
      flex: 1;
      height: 2px;
      background: #e5e7eb;
      min-width: 12px;
      margin-bottom: 20px;
      &.connector-done { background: #3B6D11; }
    }
  `],
})
export class ApprovalFlowComponent {
  steps = input.required<ProposalApprovalStep[]>();

  stepIcon(status: ProposalApprovalStep['status']): string {
    return { pending: 'radio_button_unchecked', approved: 'check_circle', rejected: 'cancel', changes_requested: 'rate_review' }[status];
  }

  roleLabel(role: string): string {
    return { builder: 'Autor', reviewer: 'Revisor', approver: 'Aprobador' }[role] ?? role;
  }
}
