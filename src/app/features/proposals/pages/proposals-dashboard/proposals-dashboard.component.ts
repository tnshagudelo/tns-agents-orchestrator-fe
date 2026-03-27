import { Component, inject, OnInit, signal, computed, effect, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MOCK_USERS, getMockUserByRole } from '../../models/mock-users.const';
import { AuthService } from '../../../../core/auth/auth.service';
import { CreateProposalRequest } from '../../models/proposal.model';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DatePipe } from '@angular/common';
import { DragDropModule, CdkDrag, CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { ProposalsService } from '../../services/proposals.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Proposal, ProposalStatus } from '../../models/proposal.model';
import { ProposalCardComponent } from '../../components/proposal-card/proposal-card.component';

// ─── Dialog component ─────────────────────────────────────────────────────────
@Component({
  selector: 'app-new-proposal-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule, MatFormFieldModule, MatInputModule,
    MatDialogModule, MatSelectModule, MatChipsModule, MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>Nueva Propuesta</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">

        <mat-form-field appearance="outline">
          <mat-label>Nombre de la propuesta *</mat-label>
          <input matInput formControlName="name" placeholder="Propuesta v1" />
          <mat-error>Requerido</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Nombre del proyecto *</mat-label>
          <input matInput formControlName="projectName" placeholder="Mi Proyecto" />
          <mat-error>Requerido</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Revisor *</mat-label>
          <mat-select formControlName="reviewerId">
            @for (u of reviewerOptions; track u.id) {
              <mat-option [value]="u.id">{{ u.name }}</mat-option>
            }
          </mat-select>
          <mat-error>Requerido</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Aprobador *</mat-label>
          <mat-select formControlName="approverId">
            @for (u of approverOptions; track u.id) {
              <mat-option [value]="u.id">{{ u.name }}</mat-option>
            }
          </mat-select>
          <mat-error>Requerido</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Etiquetas</mat-label>
          <mat-chip-grid #chipGrid>
            @for (tag of tags; track tag) {
              <mat-chip (removed)="removeTag(tag)">
                {{ tag }}
                <button matChipRemove><mat-icon>cancel</mat-icon></button>
              </mat-chip>
            }
          </mat-chip-grid>
          <input placeholder="Añadir tag y presionar Enter..."
            [matChipInputFor]="chipGrid"
            [matChipInputSeparatorKeyCodes]="separatorKeys"
            (matChipInputTokenEnd)="addTag($event)" />
        </mat-form-field>

        <p class="creator-info">Creando como: {{ currentUser.name }} (autor)</p>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" (click)="submit()" [disabled]="form.invalid">
        Crear
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form { display: flex; flex-direction: column; gap: 8px; min-width: 400px; padding-top: 8px; }
    .creator-info { margin: 0; font-size: 0.78rem; color: rgba(0,0,0,0.45); }
  `],
})
export class NewProposalDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<NewProposalDialogComponent>);
  private readonly auth = inject(AuthService);

  readonly currentUser = { id: this.auth.currentUser()?.id ?? '', name: this.auth.currentUser()?.username ?? '' };
  readonly separatorKeys = [ENTER, COMMA] as const;
  tags: string[] = [];

  readonly reviewerOptions = MOCK_USERS.filter(u => u.id !== this.currentUser.id);

  form = new FormGroup({
    name: new FormControl('', Validators.required),
    projectName: new FormControl('', Validators.required),
    reviewerId: new FormControl('', Validators.required),
    approverId: new FormControl('', Validators.required),
  });

  get approverOptions() {
    const reviewerId = this.form.get('reviewerId')?.value;
    return MOCK_USERS.filter(u => u.id !== this.currentUser.id && u.id !== reviewerId);
  }

  addTag(event: MatChipInputEvent): void {
    const value = (event.value ?? '').trim();
    if (value && !this.tags.includes(value)) {
      this.tags.push(value);
    }
    event.chipInput.clear();
  }

  removeTag(tag: string): void {
    this.tags = this.tags.filter(t => t !== tag);
  }

  submit(): void {
    if (this.form.invalid) return;
    const { name, projectName, reviewerId, approverId } = this.form.value;
    const reviewer = MOCK_USERS.find(u => u.id === reviewerId)!;
    const approver = MOCK_USERS.find(u => u.id === approverId)!;
    this.dialogRef.close({
      name: name!,
      projectName: projectName!,
      reviewerUserId: reviewer.id,
      reviewerUserName: reviewer.name,
      approverUserId: approver.id,
      approverUserName: approver.name,
      tags: this.tags,
    });
  }
}

// ─── Dashboard component ──────────────────────────────────────────────────────
interface KanbanColumn {
  id: string;
  label: string;
  color: string;
  status: ProposalStatus;
  cards: Proposal[];
}

@Component({
  selector: 'app-proposals-dashboard',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    DatePipe, FormsModule,
    MatButtonModule, MatIconModule, MatCardModule, MatChipsModule,
    MatFormFieldModule, MatInputModule, MatTableModule,
    MatDialogModule, MatSelectModule, MatTooltipModule,
    DragDropModule,
    ProposalCardComponent,
  ],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <h1>Propuestas</h1>
        <div class="header-actions">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Buscar</mat-label>
            <mat-icon matPrefix>search</mat-icon>
            <input matInput [ngModel]="filterText()" (ngModelChange)="filterText.set($event)" placeholder="Nombre de propuesta..." />
          </mat-form-field>

          <div class="view-toggle">
            <button mat-icon-button [class.active]="viewMode() === 'kanban'" (click)="viewMode.set('kanban')" matTooltip="Kanban">
              <mat-icon>view_kanban</mat-icon>
            </button>
            <button mat-icon-button [class.active]="viewMode() === 'list'" (click)="viewMode.set('list')" matTooltip="Lista">
              <mat-icon>view_list</mat-icon>
            </button>
          </div>

          <button mat-raised-button color="primary" (click)="openNewDialog()">
            <mat-icon>add</mat-icon> Nueva propuesta
          </button>
        </div>
      </div>

      <!-- Status filter pills -->
      <div class="status-filters">
        <button class="filter-pill" [class.active]="!activeStatus()" (click)="toggleStatus(null)">
          Todas
        </button>
        @for (s of allStatuses; track s.value) {
          <button class="filter-pill pill-{{ s.value }}"
            [class.active]="activeStatus() === s.value"
            (click)="toggleStatus(s.value)">
            <span class="pill-dot"></span>
            {{ s.label }}
          </button>
        }
      </div>

      <!-- Kanban view -->
      @if (viewMode() === 'kanban') {
        <div class="kanban-board">
          @for (col of kanbanColumns; track col.id) {
            <div class="kanban-column"
              [class.col-drop-valid]="draggingProposal() && isValidTarget(col.status)"
              [class.col-drop-blocked]="draggingProposal() && !isValidTarget(col.status)">
              <div class="col-header" [style.border-top-color]="col.color">
                <span>{{ col.label }}</span>
                <span class="col-count">{{ kanbanCounts()[col.status] }}</span>
                @if (draggingProposal() && !isValidTarget(col.status)) {
                  <mat-icon class="col-blocked-icon" matTooltip="Transición no permitida">block</mat-icon>
                }
              </div>
              <div class="col-body"
                cdkDropList
                [id]="col.id"
                [cdkDropListData]="col.cards"
                [cdkDropListConnectedTo]="dropListIds"
                [cdkDropListEnterPredicate]="dropPredicates[col.status]"
                (cdkDropListDropped)="onDrop($event, col.status)">
                @for (p of col.cards; track p.id) {
                  <div cdkDrag class="drag-item"
                    [cdkDragData]="p"
                    (cdkDragStarted)="draggingProposal.set(p)"
                    (cdkDragEnded)="draggingProposal.set(null)">
                    <app-proposal-card [proposal]="p" (action)="onCardAction($event)" />
                    <div *cdkDragPlaceholder class="drag-placeholder"></div>
                  </div>
                }
                @if (col.cards.length === 0) {
                  <div class="empty-col">Sin propuestas</div>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- List view -->
      @if (viewMode() === 'list') {
        <mat-card>
          <table mat-table [dataSource]="filteredProposals()" class="proposals-table">

            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Propuesta</th>
              <td mat-cell *matCellDef="let p">
                <span class="p-name">{{ p.name }}</span>
                <span class="p-project">{{ p.projectName }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let p">
                <mat-chip class="status-{{ p.status }}" disableRipple>{{ statusLabel(p.status) }}</mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="version">
              <th mat-header-cell *matHeaderCellDef>Versión</th>
              <td mat-cell *matCellDef="let p">v{{ p.currentIteration }}</td>
            </ng-container>

            <ng-container matColumnDef="approvalFlow">
              <th mat-header-cell *matHeaderCellDef>Aprobaciones</th>
              <td mat-cell *matCellDef="let p">
                <div class="inline-avatars">
                  @for (step of p.approvalFlow; track step.role) {
                    <div class="sm-avatar avatar-{{ step.status }}" [matTooltip]="step.userName + ' · ' + step.role">
                      {{ step.userName.charAt(0) }}
                    </div>
                  }
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="updatedAt">
              <th mat-header-cell *matHeaderCellDef>Actualizado</th>
              <td mat-cell *matCellDef="let p">{{ p.updatedAt | date:'dd/MM/yy' }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let p">
                <button mat-icon-button (click)="navigate(p)" matTooltip="Abrir">
                  <mat-icon>open_in_new</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="tableColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: tableColumns;" class="table-row"></tr>
          </table>

          @if (filteredProposals().length === 0) {
            <div class="table-empty">No hay propuestas. Crea la primera.</div>
          }
        </mat-card>
      }
    </div>
  `,
  styleUrl: './proposals-dashboard.component.scss',
})
export class ProposalsDashboardComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  protected readonly proposalsService = inject(ProposalsService);
  private readonly notifications = inject(NotificationService);

  viewMode = signal<'kanban' | 'list'>('kanban');
  filterText = signal('');
  activeStatus = signal<ProposalStatus | null>(null);
  draggingProposal = signal<Proposal | null>(null);

  readonly tableColumns = ['name', 'status', 'version', 'approvalFlow', 'updatedAt', 'actions'];
  readonly dropListIds = ['col-draft', 'col-in_review', 'col-pending_approval', 'col-final'];

  // ── Workflow: transiciones permitidas en el kanban ────────────────────────
  readonly allowedTransitions: Record<ProposalStatus, ProposalStatus[]> = {
    draft:            ['in_review'],
    in_review:        ['draft', 'pending_approval'],
    pending_approval: ['in_review', 'approved'],
    approved:         [],   // terminal
    rejected:         [],   // terminal
  };

  // Predicados precomputados por columna para cdkDropListEnterPredicate
  readonly dropPredicates: Record<ProposalStatus, (drag: CdkDrag<Proposal>) => boolean> =
    (['draft', 'in_review', 'pending_approval', 'approved', 'rejected'] as ProposalStatus[])
      .reduce((acc, status) => {
        acc[status] = (drag: CdkDrag<Proposal>) =>
          this.allowedTransitions[drag.data?.status]?.includes(status) ?? false;
        return acc;
      }, {} as Record<ProposalStatus, (drag: CdkDrag<Proposal>) => boolean>);

  isValidTarget(targetStatus: ProposalStatus): boolean {
    const d = this.draggingProposal();
    if (!d || d.status === targetStatus) return false;
    return this.allowedTransitions[d.status].includes(targetStatus);
  }

  readonly allStatuses = [
    { value: 'draft' as ProposalStatus, label: 'Borrador' },
    { value: 'in_review' as ProposalStatus, label: 'En revisión' },
    { value: 'pending_approval' as ProposalStatus, label: 'Aprobación' },
    { value: 'approved' as ProposalStatus, label: 'Aprobado' },
    { value: 'rejected' as ProposalStatus, label: 'Rechazado' },
  ];

  // Kanban column arrays (mutable — used by CDK DragDrop)
  draftCards: Proposal[] = [];
  inReviewCards: Proposal[] = [];
  pendingApprovalCards: Proposal[] = [];
  finalCards: Proposal[] = [];

  readonly kanbanColumns: KanbanColumn[] = [
    { id: 'col-draft',           label: 'Borrador',       color: '#888780', status: 'draft',            cards: this.draftCards },
    { id: 'col-in_review',       label: 'En revisión',    color: '#BA7517', status: 'in_review',        cards: this.inReviewCards },
    { id: 'col-pending_approval',label: 'Aprobación',     color: '#185FA5', status: 'pending_approval', cards: this.pendingApprovalCards },
    { id: 'col-final',           label: 'Aprobado/Rechazado', color: '#3B6D11', status: 'approved',    cards: this.finalCards },
  ];

  readonly filteredProposals = computed(() => {
    const all = this.proposalsService.proposals() ?? [];
    const status = this.activeStatus();
    const text = this.filterText().toLowerCase();
    return all
      .filter(p => !status || p.status === status)
      .filter(p => !text || p.name?.toLowerCase().includes(text) || p.projectName?.toLowerCase().includes(text));
  });

  // Signal-based counts for kanban headers — avoids NG0100 from mutable array reads
  readonly kanbanCounts = computed(() => {
    const all = this.proposalsService.proposals() ?? [];
    const text = this.filterText().toLowerCase();
    const filtered = text ? all.filter(p => p.name?.toLowerCase().includes(text) || p.projectName?.toLowerCase().includes(text)) : all;
    const finalCount = filtered.filter(p => p.status === 'approved' || p.status === 'rejected').length;
    return {
      draft:            filtered.filter(p => p.status === 'draft').length,
      in_review:        filtered.filter(p => p.status === 'in_review').length,
      pending_approval: filtered.filter(p => p.status === 'pending_approval').length,
      approved:         finalCount,
      rejected:         finalCount,
    } satisfies Record<ProposalStatus, number>;
  });

  constructor() {
    effect(() => {
      const all = this.proposalsService.proposals() ?? [];
      const text = this.filterText().toLowerCase();
      const filtered = text ? all.filter(p => p.name?.toLowerCase().includes(text) || p.projectName?.toLowerCase().includes(text)) : all;

      this.draftCards.splice(0, this.draftCards.length, ...filtered.filter(p => p.status === 'draft'));
      this.inReviewCards.splice(0, this.inReviewCards.length, ...filtered.filter(p => p.status === 'in_review'));
      this.pendingApprovalCards.splice(0, this.pendingApprovalCards.length, ...filtered.filter(p => p.status === 'pending_approval'));
      this.finalCards.splice(0, this.finalCards.length, ...filtered.filter(p => p.status === 'approved' || p.status === 'rejected'));
    });
  }

  ngOnInit(): void {
    this.proposalsService.loadAll().subscribe({
      error: () => this.notifications.error('Error al cargar propuestas'),
    });
  }

  toggleStatus(status: ProposalStatus | null): void {
    this.activeStatus.set(this.activeStatus() === status ? null : status);
  }

  onDrop(event: CdkDragDrop<Proposal[]>, targetStatus: ProposalStatus): void {
    if (event.previousContainer === event.container) return;

    const proposal = event.previousContainer.data[event.previousIndex];

    // Defensa: rechazar si la transición no está permitida (no debería llegar aquí gracias al predicate)
    if (!this.allowedTransitions[proposal.status].includes(targetStatus)) {
      this.notifications.error(`No se puede mover de "${this.statusLabel(proposal.status)}" a "${this.statusLabel(targetStatus)}"`);
      return;
    }

    transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);

    this.proposalsService.updateStatus(proposal.id, targetStatus).subscribe({
      error: () => {
        this.notifications.error('Error al actualizar estado');
        this.proposalsService.loadAll().subscribe();
      },
    });
  }

  onCardAction(event: { proposalId: string; action: string }): void {
    this.navigate({ id: event.proposalId, status: event.action === 'review' ? 'in_review' : 'draft' } as Proposal);
  }

  navigate(p: Proposal): void {
    const path = (p.status === 'in_review' || p.status === 'pending_approval')
      ? `/proposals/${p.id}/review`
      : `/proposals/${p.id}/workpad`;
    this.router.navigate([path]);
  }

  openNewDialog(): void {
    const ref = this.dialog.open(NewProposalDialogComponent, { width: '460px' });
    ref.afterClosed().subscribe((result?: Omit<CreateProposalRequest, 'createdByUserId' | 'createdByUserName'>) => {
      if (!result) return;
      this.proposalsService.create(result).subscribe({
        next: p => this.router.navigate([`/proposals/${p.id}/workpad`]),
        error: () => this.notifications.error('Error al crear propuesta'),
      });
    });
  }

  statusLabel(status: ProposalStatus): string {
    return { draft: 'Borrador', in_review: 'En revisión', pending_approval: 'Aprobación', approved: 'Aprobado', rejected: 'Rechazado' }[status];
  }
}
