import { Component, OnInit, OnDestroy, inject, signal, computed, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UpperCasePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { switchMap, tap } from 'rxjs';
import { PlanningSessionService } from '../../services/planning-session.service';
import { PlanningChatService } from '../../services/planning-chat.service';
import { JobPollingService } from '../../services/job-polling.service';
import { ClientService } from '../../services/client.service';
import { SESSION_STATUS_MAP, Client, PlanningSession, ResearchResult } from '../../models/account-planning.model';
import { SessionChatComponent, ChatMessage } from './components/session-chat/session-chat.component';
import { ClientSidebarComponent } from './components/client-sidebar/client-sidebar.component';
import { ConfirmationCardComponent } from './components/confirmation-card/confirmation-card.component';
import { SearchProgressComponent } from './components/search-progress/search-progress.component';
import { DashboardShellComponent } from './components/dashboard/dashboard-shell.component';

@Component({
  selector: 'app-planning-session',
  standalone: true,
  imports: [
    FormsModule, UpperCasePipe, MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatProgressBarModule, MatProgressSpinnerModule,
    MatChipsModule, SessionChatComponent, ClientSidebarComponent,
    ConfirmationCardComponent, SearchProgressComponent, DashboardShellComponent,
  ],
  templateUrl: './planning-session.component.html',
  styleUrl: './planning-session.component.scss',
})
export class PlanningSessionComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sessionService = inject(PlanningSessionService);
  private readonly chatService = inject(PlanningChatService);
  private readonly pollingService = inject(JobPollingService);
  private readonly clientService = inject(ClientService);

  readonly session = this.sessionService.currentSession;
  readonly streamingContent = this.chatService.streamingContent;
  readonly isStreaming = this.chatService.isStreaming;
  readonly currentJob = this.pollingService.currentJob;
  readonly isPolling = this.pollingService.isPolling;

  readonly client = signal<Client | null>(null);
  readonly isReturningClient = signal(false);
  readonly researchResults = signal<ResearchResult[]>([]);
  readonly showFocusSelector = signal(false);
  readonly clientSessions = signal<PlanningSession[]>([]);
  private autoStarted = false;
  private sessionId = '';

  readonly isConversationalState = computed(() => {
    const s = this.session();
    if (!s) return true;
    return ['Queued', 'QuickSearching', 'QuickSearchDone', 'AwaitingConfirmation', 'DeepSearching', 'AwaitingLinkedInInput'].includes(s.status);
  });

  constructor() {
    // Auto-save chat history to localStorage
    effect(() => {
      const history = this.chatHistory();
      if (history.length > 0) this.saveChatHistory();
    });

    // Watch for job completion → reload session + load results
    effect(() => {
      const job = this.currentJob();
      if (job && (job.status === 'Completed' || job.status === 'Failed') && this.sessionId) {
        this.sessionService.getById(this.sessionId).subscribe(session => {
          if (session.status === 'AwaitingReview' || session.status === 'AwaitingFocus'
            || session.status === 'UnderRevision' || session.status === 'Approved') {
            this.loadResults();
          }
        });
      }
    });
  }

  readonly statusInfo = computed(() => {
    const s = this.session();
    if (!s) return null;
    return SESSION_STATUS_MAP[s.status] ?? null;
  });

  // Form inputs
  linkedInInput = '';
  focusCompanyType = '';
  focusContactRole = '';
  regenerateLanguage = '';

  readonly chatHistory = signal<ChatMessage[]>([]);

  private get chatStorageKey(): string {
    return `chat_history_${this.sessionId}`;
  }

  private saveChatHistory(): void {
    if (!this.sessionId) return;
    localStorage.setItem(this.chatStorageKey, JSON.stringify(this.chatHistory()));
  }

  private restoreChatHistory(): void {
    if (!this.sessionId) return;
    const stored = localStorage.getItem(this.chatStorageKey);
    if (stored) {
      try {
        this.chatHistory.set(JSON.parse(stored));
      } catch { /* ignore corrupt data */ }
    }
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.sessionId = id;
    this.restoreChatHistory();

    this.sessionService.getById(id).pipe(
      switchMap(session => this.clientService.getById(session.clientId).pipe(
        tap(client => {
          this.client.set(client);
          // Load all sessions for this client (for version selector)
          this.sessionService.loadByClient(client.id).subscribe(sessions => {
            this.clientSessions.set(sessions);
            this.isReturningClient.set(sessions.length > 1);
          });
          // Auto-start chat if session is new and no restored history
          if (session.status === 'Queued' && !this.autoStarted && this.chatHistory().length === 0) {
            this.autoStarted = true;
            setTimeout(() => this.sendAutoGreeting(session, client), 100);
          }
          // Load results if session already has investigation data
          if (['AwaitingReview', 'AwaitingFocus', 'GeneratingPortfolio',
               'UnderRevision', 'Approved'].includes(session.status)) {
            this.loadResults();
          }
        })
      ))
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.pollingService.reset();
    this.chatService.stopStream();
  }

  /** Envía el primer mensaje automático con los datos del cliente */
  private sendAutoGreeting(session: PlanningSession, client: Client): void {
    const message = this.isReturningClient()
      ? `Actualizar investigación de ${client.name}`
      : `Inicio Account Planning para ${client.name}`;

    this.chatService.sendMessage(
      'IntentExtractionAgent',
      session.conversationSessionId,
      message,
      this.buildClientMetadata(client)
    ).subscribe({
      complete: () => {
        const response = this.chatService.streamingContent();
        this.chatHistory.update(h => [...h, {
          role: 'assistant' as const,
          content: response
        }]);
        this.chatService.resetContent();

        // If the greeting itself triggers search (e.g., returning client flow)
        if (this.isSearchTrigger(response)) {
          this.triggerQuickSearch();
        }
      },
      error: (err) => {
        console.error('[PlanningSession] Auto-greeting failed:', err);
        this.chatService.resetContent();
      },
    });
  }

  sendChat(message: string): void {
    const s = this.session();
    const c = this.client();
    if (!s || !message.trim()) return;

    this.chatHistory.update(h => [...h, { role: 'user' as const, content: message }]);

    this.chatService.sendMessage(
      'IntentExtractionAgent',
      s.conversationSessionId,
      message,
      c ? this.buildClientMetadata(c) : {}
    ).subscribe({
      complete: () => {
        const response = this.chatService.streamingContent();
        this.chatHistory.update(h => [...h, {
          role: 'assistant' as const,
          content: response
        }]);
        this.chatService.resetContent();

        // Detect if agent signaled to start the search
        if (this.isSearchTrigger(response)) {
          this.triggerQuickSearch();
        }
      },
    });
  }

  /** Detects if the agent's response signals that the search should start */
  private isSearchTrigger(response: string): boolean {
    const lower = response.toLowerCase();
    return lower.includes('iniciando la búsqueda') || lower.includes('iniciando la busqueda');
  }

  /** Triggers the quick search flow: transition state → call QuickResearchAgent → save result */
  private triggerQuickSearch(): void {
    const s = this.session();
    const c = this.client();
    if (!s || !c) return;

    // 1. Transition to QuickSearching
    this.sessionService.startQuickSearch(s.id, s.userIntent).pipe(
      switchMap(() => {
        // 2. Call QuickResearchAgent via SSE
        return this.chatService.sendMessage(
          'QuickResearchAgent',
          s.conversationSessionId,
          `Genera un resumen rápido de ${c.name} para confirmar que es el cliente correcto.`,
          this.buildClientMetadata(c)
        );
      })
    ).subscribe({
      complete: () => {
        const summary = this.chatService.streamingContent();
        this.chatService.resetContent();

        // 3. Save summary and transition to AwaitingConfirmation
        this.sessionService.completeQuickSearch(s.id, summary).subscribe();
      },
    });
  }

  confirmClient(): void {
    const s = this.session();
    if (!s) return;

    this.sessionService.confirmClient(s.id).subscribe(result => {
      this.pollingService.startPolling(result.jobId);
    });
  }

  submitLinkedIn(): void {
    const s = this.session();
    if (!s || !this.linkedInInput.trim()) return;

    this.sessionService.submitLinkedIn(s.id, this.linkedInInput).subscribe();
    this.linkedInInput = '';
  }

  setFocus(): void {
    const s = this.session();
    if (!s || !this.focusCompanyType.trim() || !this.focusContactRole.trim()) return;

    this.sessionService.setFocus(s.id, {
      companyType: this.focusCompanyType,
      contactRole: this.focusContactRole,
    }).subscribe(result => {
      this.pollingService.startPolling(result.jobId);
    });
  }

  approve(): void {
    const s = this.session();
    if (!s) return;
    this.sessionService.approve(s.id).subscribe();
  }

  regenerate(): void {
    const s = this.session();
    if (!s) return;

    this.sessionService.regenerate(s.id, {
      language: this.regenerateLanguage || undefined,
    }).subscribe(result => {
      this.pollingService.startPolling(result.jobId);
    });
  }

  retry(): void {
    const s = this.session();
    if (!s) return;

    this.sessionService.retry(s.id).subscribe(result => {
      this.pollingService.startPolling(result.jobId);
    });
  }

  private loadResults(): void {
    if (!this.sessionId) return;
    this.sessionService.getResults(this.sessionId).subscribe(results => {
      this.researchResults.set(results);
    });
  }

  goBack(): void {
    this.router.navigate(['/account-planning']);
  }

  onDefineFocus(): void {
    this.showFocusSelector.set(true);
    setTimeout(() => {
      document.getElementById('focus-selector')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  rejectClient(): void {
    const s = this.session();
    if (!s) return;
    // Transition back to Queued, then send message to agent
    this.sessionService.rejectQuickSearch(s.id).subscribe(() => {
      this.sendChat('No es la empresa correcta. ¿Puedes buscar otra?');
    });
  }

  onViewPreviousResults(): void {
    const sessions = this.clientSessions();
    const completed = sessions.find(s =>
      ['AwaitingReview', 'AwaitingFocus', 'UnderRevision', 'Approved'].includes(s.status)
      && s.id !== this.sessionId
    );
    if (completed) {
      this.router.navigate(['/account-planning/sessions', completed.id]);
    }
  }

  startNewInvestigation(): void {
    const c = this.client();
    if (!c) return;
    this.sessionService.create(c.id).subscribe(session => {
      this.router.navigate(['/account-planning/sessions', session.id]);
    });
  }

  switchSession(sessionId: string): void {
    if (sessionId !== this.sessionId) {
      this.router.navigate(['/account-planning/sessions', sessionId]);
    }
  }

  private buildClientMetadata(client: Client): Record<string, string> {
    return {
      clientName: client.name,
      clientIndustry: client.industry,
      clientCountry: client.country,
      clientWebsite: client.website ?? '',
      clientLinkedIn: client.linkedInUrl ?? '',
      clientDescription: client.description ?? '',
    };
  }
}
