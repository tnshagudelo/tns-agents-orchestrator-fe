import { Component, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProposalComment } from '../../models/proposal.model';

@Component({
  selector: 'app-comment-thread',
  standalone: true,
  imports: [DatePipe, FormsModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatTooltipModule],
  template: `
    <div class="comment-thread">
      @if (comments().length === 0) {
        <div class="empty-comments">
          <mat-icon>chat_bubble_outline</mat-icon>
          <span>Sin comentarios aún</span>
        </div>
      } @else {
        <div class="comments-list">
          @for (comment of filteredComments(); track comment.id) {
            <div class="comment" [class.resolved]="comment.resolvedAt">
              <div class="comment-header">
                <div class="author-avatar">{{ comment.authorName.charAt(0).toUpperCase() }}</div>
                <div class="author-info">
                  <span class="author-name">{{ comment.authorName }}</span>
                  <span class="role-badge role-{{ comment.authorRole }}">{{ comment.authorRole }}</span>
                </div>
                <span class="comment-time">{{ comment.createdAt | date:'dd/MM HH:mm' }}</span>
              </div>

              <p class="comment-body">{{ comment.body }}</p>

              <div class="comment-actions">
                @if (comment.resolvedAt) {
                  <span class="resolved-label"><mat-icon>check_circle</mat-icon> Resuelto</span>
                }
                <button mat-icon-button class="ask-agent-btn" (click)="askAgent.emit(comment.body)" matTooltip="Enviar al agente">
                  <mat-icon>psychology</mat-icon>
                </button>
              </div>
            </div>
          }
        </div>
      }

      <div class="add-comment">
        <mat-form-field appearance="outline" class="comment-field">
          <mat-label>Añadir comentario</mat-label>
          <textarea matInput [(ngModel)]="newComment" rows="2" (keydown.enter)="submitComment($event)"></textarea>
        </mat-form-field>
        <button mat-icon-button color="primary" (click)="submitComment()" [disabled]="!newComment.trim()">
          <mat-icon>send</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .comment-thread { display: flex; flex-direction: column; gap: 12px; padding: 8px 0; }

    .empty-comments {
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      padding: 32px 16px; color: rgba(0,0,0,0.4); font-size: 0.85rem;
      mat-icon { font-size: 2rem; width: 2rem; height: 2rem; opacity: 0.5; }
    }

    .comments-list { display: flex; flex-direction: column; gap: 10px; max-height: 400px; overflow-y: auto; }

    .comment {
      border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px;
      background: white; transition: opacity 0.2s;
      &.resolved { opacity: 0.6; background: #f9fafb; }
    }

    .comment-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
    .author-avatar {
      width: 28px; height: 28px; border-radius: 50%; background: #2D1B6B; color: white;
      display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; flex-shrink: 0;
    }
    .author-info { display: flex; align-items: center; gap: 6px; flex: 1; }
    .author-name { font-size: 0.82rem; font-weight: 600; }
    .role-badge {
      font-size: 0.65rem; padding: 1px 6px; border-radius: 10px; text-transform: capitalize;
      &-builder  { background: #e0e7ff; color: #3730a3; }
      &-reviewer { background: #fef3c7; color: #92400e; }
      &-approver { background: #dcfce7; color: #166534; }
    }
    .comment-time { font-size: 0.7rem; color: rgba(0,0,0,0.4); margin-left: auto; }

    .comment-body { margin: 0 0 6px; font-size: 0.85rem; line-height: 1.5; color: rgba(0,0,0,0.75); }

    .comment-actions { display: flex; align-items: center; justify-content: flex-end; gap: 4px; }
    .resolved-label {
      display: flex; align-items: center; gap: 4px; font-size: 0.72rem; color: #3B6D11;
      mat-icon { font-size: 0.9rem; width: 0.9rem; height: 0.9rem; }
    }
    .ask-agent-btn { width: 28px; height: 28px; line-height: 28px;
      mat-icon { font-size: 1rem; width: 1rem; height: 1rem; color: #2D1B6B; }
    }

    .add-comment { display: flex; align-items: flex-end; gap: 8px; }
    .comment-field { flex: 1; }
  `],
})
export class CommentThreadComponent {
  comments = input.required<ProposalComment[]>();
  filterIteration = input<number | null>(null);

  addComment = output<string>();
  askAgent = output<string>();

  newComment = '';

  filteredComments() {
    const iter = this.filterIteration();
    return iter != null
      ? this.comments().filter(c => c.iterationVersion === iter)
      : this.comments();
  }

  submitComment(event?: Event): void {
    if (event instanceof KeyboardEvent && event.shiftKey) return;
    event?.preventDefault();
    const text = this.newComment.trim();
    if (!text) return;
    this.addComment.emit(text);
    this.newComment = '';
  }
}
