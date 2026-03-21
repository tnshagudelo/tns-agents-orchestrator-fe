import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
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
    return this.post<any>(`/proposals/${id}/iterations`, iteration).pipe(
      map(p => this._normalize(p)),
      tap(p => this._syncLocal(p))
    );
  }

  submitForReview(id: string): Observable<Proposal> {
    return this.post<any>(`/proposals/${id}/submit`, {}).pipe(
      map(p => this._normalize(p)),
      tap(p => this._syncLocal(p))
    );
  }

  updateStatus(id: string, status: ProposalStatus): Observable<Proposal> {
    return this.patch<any>(`/proposals/${id}`, { status }).pipe(
      map(p => this._normalize(p)),
      tap(p => this._syncLocal(p))
    );
  }

  addComment(id: string, comment: Omit<ProposalComment, 'id' | 'createdAt'>): Observable<Proposal> {
    return this.post<any>(`/proposals/${id}/comments`, comment).pipe(
      map(p => this._normalize(p)),
      tap(p => this._syncLocal(p))
    );
  }

  decide(id: string, role: ProposalRole, status: ProposalApprovalStep['status'], note?: string): Observable<Proposal> {
    return this.post<any>(`/proposals/${id}/decisions`, { role, status, note }).pipe(
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
      iterations: (raw.iterations ?? []).map((i: any) => ({
        ...i,
        createdAt: new Date(i.createdAt),
      })),
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

  private _syncLocal(updated: Proposal): void {
    this._proposals.update(list => list.map(p => p.id === updated.id ? updated : p));
    if (this._selectedProposal()?.id === updated.id) {
      this._selectedProposal.set(updated);
    }
  }
}
