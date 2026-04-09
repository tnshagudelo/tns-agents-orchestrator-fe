import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MarkdownComponent } from 'ngx-markdown';
import { switchMap, tap } from 'rxjs';
import { PlanningSessionService } from '../../services/planning-session.service';
import { PlanningChatService } from '../../services/planning-chat.service';
import { JobPollingService } from '../../services/job-polling.service';
import { ClientService } from '../../services/client.service';
import { SESSION_STATUS_MAP, Client } from '../../models/account-planning.model';

@Component({
  selector: 'app-planning-session',
  standalone: true,
  imports: [
    FormsModule, UpperCasePipe, MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatProgressBarModule, MatChipsModule,
    MatDividerModule, MarkdownComponent,
  ],
  templateUrl: './planning-session.component.html',
  styleUrl: './planning-session.component.scss',
})
export class PlanningSessionComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
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
  private autoStarted = false;

  readonly statusInfo = computed(() => {
    const s = this.session();
    if (!s) return null;
    return SESSION_STATUS_MAP[s.status] ?? null;
  });

  chatInput = '';
  linkedInInput = '';
  focusCompanyType = '';
  focusContactRole = '';
  regenerateLanguage = '';

  readonly chatHistory = signal<{ role: string; content: string }[]>([]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;

    // Cargar sesión → cargar cliente → auto-iniciar chat si es sesión nueva
    this.sessionService.getById(id).pipe(
      switchMap(session => this.clientService.getById(session.clientId).pipe(
        tap(client => {
          this.client.set(client);
          // Si la sesión es nueva (Queued) y no hemos auto-iniciado, enviar primer mensaje
          if (session.status === 'Queued' && !this.autoStarted) {
            this.autoStarted = true;
            this.sendAutoGreeting(client);
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
  private sendAutoGreeting(client: Client): void {
    const s = this.session();
    if (!s) return;

    const message = `Inicio Account Planning para ${client.name}`;

    this.chatService.sendMessage(
      'IntentExtractionAgent',
      s.conversationSessionId,
      message,
      this.buildClientMetadata(client)
    ).subscribe({
      complete: () => {
        this.chatHistory.update(h => [...h, {
          role: 'assistant',
          content: this.chatService.streamingContent()
        }]);
        this.chatService.resetContent();
      },
    });
  }

  sendChat(): void {
    const s = this.session();
    const c = this.client();
    if (!s || !this.chatInput.trim()) return;

    const message = this.chatInput.trim();
    this.chatInput = '';

    this.chatHistory.update(h => [...h, { role: 'user', content: message }]);

    this.chatService.sendMessage(
      'IntentExtractionAgent',
      s.conversationSessionId,
      message,
      c ? this.buildClientMetadata(c) : {}
    ).subscribe({
      complete: () => {
        this.chatHistory.update(h => [...h, {
          role: 'assistant',
          content: this.chatService.streamingContent()
        }]);
        this.chatService.resetContent();
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
