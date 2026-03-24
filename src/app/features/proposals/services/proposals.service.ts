import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { BaseApiService } from '../../../core/services/base-api.service';
import { CreateProposalRequest, Proposal, ProposalApprovalStep, ProposalComment, ProposalIteration, ProposalRole, ProposalStatus } from '../models/proposal.model';
import { CURRENT_USER } from '../models/mock-users.const';

@Injectable({ providedIn: 'root' })
export class ProposalsService extends BaseApiService {
  private readonly _proposals = signal<Proposal[]>([]);
  private readonly _selectedProposal = signal<Proposal | null>(null);
  private readonly _isLoading = signal(false);

  readonly proposals = this._proposals.asReadonly();
  readonly selectedProposal = this._selectedProposal.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  constructor(http: HttpClient) {
    super(http);
  }

  loadAll(): Observable<Proposal[]> {
    this._isLoading.set(true);
    return this.get<any[]>('/proposals').pipe(
      map(items => (items ?? []).map(p => this._normalize(p))),
      tap(items => {
        this._proposals.set(items);
        this._isLoading.set(false);
      })
    );
  }

  getById(id: string): Observable<Proposal> {
    this._isLoading.set(true);
    return this.get<any>(`/proposals/${id}`).pipe(
      map(p => this._normalize(p)),
      tap(p => {
        this._selectedProposal.set(p);
        this._isLoading.set(false);
      })
    );
  }

  create(data: Omit<CreateProposalRequest, 'createdByUserId' | 'createdByUserName'>): Observable<Proposal> {
    const payload: CreateProposalRequest = {
      ...data,
      createdByUserId: CURRENT_USER.id,
      createdByUserName: CURRENT_USER.name,
    };
    return this.post<any>('/proposals', payload).pipe(
      map(p => this._normalize(p)),
      tap(p => this._proposals.update(list => [p, ...list]))
    );
  }

  updateIteration(id: string, iteration: Omit<ProposalIteration, 'version' | 'createdAt'>): Observable<Proposal> {
    // Optimistic: agrega la nueva iteración localmente de inmediato
    const snapshot = this._selectedProposal();
    if (snapshot?.id === id) {
      const newVersion = (snapshot.iterations[snapshot.iterations.length - 1]?.version ?? 0) + 1;
      const optimisticIteration: ProposalIteration = {
        ...iteration,
        riskLevel: iteration.riskLevel,
        version: newVersion,
        createdAt: new Date(),
      };
      this._syncLocal({
        ...snapshot,
        iterations: [...snapshot.iterations, optimisticIteration],
        currentIteration: newVersion,
        updatedAt: new Date(),
      });
    }

    return this.post<any>(`/proposals/${id}/iterations`, iteration).pipe(
      map(raw => raw?.id && raw?.iterations ? this._normalize(raw) : ({
        ...(this._selectedProposal()!),
      })),
      tap(p => this._syncLocal(p)),
      catchError(err => {
        if (snapshot) this._syncLocal(snapshot);
        return throwError(() => err);
      })
    );
  }

  submitForReview(id: string): Observable<Proposal> {
    return this.post<any>(`/proposals/${id}/submit`, { userId: CURRENT_USER.id }).pipe(
      map(p => this._normalize(p)),
      tap(p => this._syncLocal(p))
    );
  }

  private static readonly _statusIntMap: Record<ProposalStatus, number> = {
    draft:            0,
    in_review:        1,
    pending_approval: 2,
    approved:         3,
    rejected:         4,
  };

  updateStatus(id: string, status: ProposalStatus): Observable<Proposal> {
    // Optimistic: apply new status to local signal immediately
    const previous = this._proposals().find(p => p.id === id) ?? null;
    if (previous) {
      this._syncLocal({ ...previous, status });
    }

    return this.patch<any>(`/proposals/${id}`, { status: ProposalsService._statusIntMap[status] }).pipe(
      map(p => this._normalize(p)),
      tap(p => this._syncLocal(p)),
      catchError(err => {
        // Revert optimistic update on failure
        if (previous) {
          this._syncLocal(previous);
        }
        return throwError(() => err);
      })
    );
  }

  deleteProposal(id: string): Observable<void> {
    return this.delete<void>(`/proposals/${id}`).pipe(
      tap(() => this._proposals.update(list => list.filter(p => p.id !== id)))
    );
  }

  addComment(id: string, comment: Omit<ProposalComment, 'id' | 'createdAt'>): Observable<void> {
    const roleIntMap: Record<ProposalRole, number> = { builder: 0, reviewer: 1, approver: 2 };
    const payload = {
      authorId: comment.authorId,
      authorName: comment.authorName,
      authorRole: roleIntMap[comment.authorRole] ?? 0,
      body: comment.body,
      iterationVersion: comment.iterationVersion,
    };

    // Optimistic: agrega el comentario localmente de inmediato
    const optimistic: ProposalComment = {
      ...comment,
      id: `tmp-${crypto.randomUUID()}`,
      createdAt: new Date(),
    };
    const snapshot = this._selectedProposal();
    if (snapshot?.id === id) {
      this._syncLocal({ ...snapshot, comments: [...snapshot.comments, optimistic] });
    }

    return this.post<any>(`/proposals/${id}/comments`, payload).pipe(
      tap(raw => {
        // Si el backend retorna la propuesta completa, sincronizamos; si no, dejamos el optimistic
        if (raw?.id && raw?.iterations) {
          this._syncLocal(this._normalize(raw));
        }
      }),
      map(() => undefined),
      catchError(err => {
        // Revertir optimistic si falla
        if (snapshot) this._syncLocal(snapshot);
        return throwError(() => err);
      })
    );
  }

  decide(id: string, role: ProposalRole, status: ProposalApprovalStep['status'], note?: string): Observable<Proposal> {
    const decisionMap: Record<string, string> = {
      approved:           'Approve',
      rejected:           'Reject',
      changes_requested:  'RequestChanges',
    };
    const payload = {
      userId: CURRENT_USER.id,
      decision: decisionMap[status] ?? 'Approve',
      note: note ?? null,
    };
    return this.post<any>(`/proposals/${id}/decisions`, payload).pipe(
      map(p => this._normalize(p)),
      tap(p => this._syncLocal(p))
    );
  }

  // ── Normalizer: maps backend PascalCase enums → frontend lowercase ──────────

  private _normalize(raw: any): Proposal {
    return {
      ...raw,
      status: this._normalizeStatus(raw.status),
      currentIteration: raw.currentIteration
        ?? (raw.iterations?.length ? raw.iterations[raw.iterations.length - 1].version : 0),
      iterations: (raw.iterations ?? []).map((i: any) => this._normalizeIteration(i)),
      approvalFlow: (raw.approvalFlow ?? []).map((s: any) => ({
        ...s,
        role: s.role?.toLowerCase() as ProposalRole,
        status: this._normalizeApprovalStatus(s.status),
      })),
      tags: raw.tags ?? [],
      comments: raw.comments ?? [],
      createdAt: new Date(raw.createdAt),
      updatedAt: new Date(raw.updatedAt),
    };
  }

  private _normalizeIteration(i: any): ProposalIteration {
    const riskMap: Record<string, ProposalIteration['riskLevel']> = {
      '0': 'low', '1': 'medium', '2': 'high',
      low: 'low', medium: 'medium', high: 'high',
    };
    return {
      version:       i.version ?? 0,
      content:       i.content ?? i.Content ?? '',
      components:    i.components ?? i.Components ?? [],
      teamSize:      i.teamSize ?? i.TeamSize ?? 0,
      durationWeeks: i.durationWeeks ?? i.DurationWeeks ?? 0,
      budgetUsd:     i.budgetUsd ?? i.BudgetUsd ?? 0,
      riskLevel:     riskMap[(i.riskLevel ?? i.RiskLevel ?? 'medium').toString().toLowerCase()] ?? 'medium',
      createdAt:     new Date(i.createdAt ?? i.CreatedAt),
    };
  }

  private _normalizeStatus(value: string): ProposalStatus {
    const map: Record<string, ProposalStatus> = {
      draft:             'draft',
      inreview:          'in_review',
      pendingreview:     'in_review',
      pendingapproval:   'pending_approval',
      approved:          'approved',
      rejected:          'rejected',
    };
    return map[value?.toLowerCase().replace(/_/g, '')] ?? 'draft';
  }

  private _normalizeApprovalStatus(value: string): ProposalApprovalStep['status'] {
    const map: Record<string, ProposalApprovalStep['status']> = {
      pending:            'pending',
      approved:           'approved',
      rejected:           'rejected',
      changesrequested:   'changes_requested',
      changes_requested:  'changes_requested',
    };
    return map[value?.toLowerCase().replace(/ /g, '')] ?? 'pending';
  }

  private _capitalize(value: string): string {
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
  }

  private _syncLocal(updated: Proposal): void {
    this._proposals.update(list => list.map(p => p.id === updated.id ? updated : p));
    if (this._selectedProposal()?.id === updated.id) {
      this._selectedProposal.set(updated);
    }
  }
}
