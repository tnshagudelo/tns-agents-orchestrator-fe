import { Component, inject, input, output, signal, ViewChild, ElementRef, AfterViewChecked, OnInit, effect } from '@angular/core';
import mermaid from 'mermaid';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MarkdownModule } from 'ngx-markdown';
import { ProposalChatService } from '../../services/proposal-chat.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { RagReference } from '../../models/proposal.model';

export interface ChatPanelMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  references?: RagReference[];
}

@Component({
  selector: 'app-proposal-chat-panel',
  standalone: true,
  imports: [
    DatePipe, FormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatProgressSpinnerModule, MatChipsModule, MarkdownModule,
  ],
  template: `
    <div class="chat-panel">
      <div class="messages" #messagesContainer>
        @if (messages().length === 0) {
          <div class="empty-chat">
            <mat-icon>psychology</mat-icon>
            <span>Describe lo que necesitas refinar en esta propuesta.</span>
            <div class="quick-chips">
              @for (s of suggestions; track s) {
                <button mat-stroked-button class="quick-chip" (click)="useSuggestion(s)">{{ s }}</button>
              }
            </div>
          </div>
        }

        @for (msg of messages(); track msg.id) {
          <div class="message" [class.message-user]="msg.role === 'user'" [class.message-agent]="msg.role === 'assistant'">
            <div class="msg-avatar">
              <mat-icon>{{ msg.role === 'user' ? 'person' : 'psychology' }}</mat-icon>
            </div>
            <div class="msg-bubble">
              @if (msg.role === 'assistant') {
                <markdown [data]="msg.content" class="md-content"></markdown>
                @if (msg.isStreaming) {
                  <span class="cursor">▌</span>
                  <div class="rag-indicator">
                    <mat-icon class="rag-spin">sync</mat-icon>
                    <span>Consultando lineamientos de arquitectura...</span>
                  </div>
                }
                @if (msg.references && msg.references.length > 0) {
                  <div class="rag-references">
                    <button class="refs-toggle" (click)="toggleRefs(msg.id)">
                      <mat-icon>auto_stories</mat-icon>
                      <span>{{ isRefsVisible(msg.id) ? 'Ocultar' : 'Ver' }} lineamientos consultados</span>
                      <span class="refs-count">{{ msg.references.length }}</span>
                      <mat-icon class="chevron" [class.rotated]="isRefsVisible(msg.id)">expand_more</mat-icon>
                    </button>
                    @if (isRefsVisible(msg.id)) {
                      <div class="refs-list">
                        @for (ref of msg.references; track ref.fileName) {
                          <div class="ref-item">
                            <div class="ref-header">
                              <mat-icon class="ref-icon">description</mat-icon>
                              <span class="ref-filename">{{ ref.fileName }}</span>
                              <span class="ref-score" [class]="getScoreClass(ref.relevance)">
                                {{ (ref.relevance * 100).toFixed(0) }}% relevante
                              </span>
                            </div>
                            <p class="ref-excerpt">"{{ ref.excerpt }}"</p>
                            <span class="ref-category">{{ ref.category }}</span>
                          </div>
                        }
                      </div>
                    }
                  </div>
                }
              } @else {
                <p>{{ msg.content }}</p>
              }
              <span class="msg-time">{{ msg.timestamp | date:'HH:mm' }}</span>
            </div>
          </div>
        }

        @if (chatService.isStreaming() && lastIsUser()) {
          <div class="message message-agent">
            <div class="msg-avatar"><mat-icon>psychology</mat-icon></div>
            <div class="msg-bubble thinking">
              <mat-progress-spinner diameter="14" mode="indeterminate"></mat-progress-spinner>
              <span>Analizando...</span>
            </div>
          </div>
        }

        <div #messagesEnd></div>
      </div>

      <div class="input-area">
        <mat-form-field appearance="outline" class="input-field">
          <textarea matInput [(ngModel)]="inputText" [disabled]="chatService.isStreaming()"
            (keydown)="onKey($event)" rows="2"
            placeholder="Refina la propuesta o haz una pregunta...">
          </textarea>
        </mat-form-field>
        <button mat-fab color="primary" class="send-btn"
          (click)="send()" [disabled]="chatService.isStreaming() || !inputText.trim()">
          <mat-icon>send</mat-icon>
        </button>
      </div>

      @if (showSaveIteration()) {
        <div class="save-bar">
          <span>Respuesta completa.</span>
          <button mat-raised-button color="accent" (click)="saveAsIteration()">
            <mat-icon>save</mat-icon> Guardar como iteración
          </button>
        </div>
      }
    </div>
  `,
  styleUrl: './proposal-chat-panel.component.scss',
})
export class ProposalChatPanelComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesEnd') private messagesEnd!: ElementRef;
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  proposalId = input.required<string>();
  projectName = input.required<string>();
  saveIteration = output<string>();

  protected readonly chatService = inject(ProposalChatService);
  private readonly notifications = inject(NotificationService);

  protected messages = signal<ChatPanelMessage[]>([]);
  protected inputText = '';
  private shouldScroll = false;
  private shouldRenderMermaid = false;
  private lastCompletedContent = '';
  private expandedRefs = signal<Set<string>>(new Set());

  protected showSaveIteration = signal(false);

  readonly suggestions = [
    'Ajusta el equipo para un plazo más corto',
    'Evalúa el nivel de riesgo del proyecto',
    'Agrega módulo de reportes',
  ];

  constructor() {
    // Reaccionar al cambio de proposalId: resetear y cargar mensajes del nuevo id
    effect(() => {
      this.proposalId(); // track dependency
      this.messages.set([]);
      this.lastCompletedContent = '';
      this.showSaveIteration.set(false);
      this.inputText = '';
      this.loadMessages();
    });
  }

  ngOnInit(): void {
    mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });
  }

  // ── Persistencia por propuesta en sessionStorage ──────────────────────────

  private get storageKey(): string {
    return `chat_msgs_${this.proposalId()}`;
  }

  private saveMessages(): void {
    const serializable = this.messages()
      .filter(m => !m.isStreaming)
      .map(m => ({ ...m, timestamp: m.timestamp.toISOString() }));
    sessionStorage.setItem(this.storageKey, JSON.stringify(serializable));
  }

  private loadMessages(): void {
    try {
      const raw = sessionStorage.getItem(this.storageKey);
      if (!raw) return;
      const parsed = (JSON.parse(raw) as Array<ChatPanelMessage & { timestamp: string }>)
        .map(m => ({ ...m, timestamp: new Date(m.timestamp), isStreaming: false }));
      this.messages.set(parsed);
      this.shouldScroll = true;
      this.shouldRenderMermaid = true;
    } catch {
      sessionStorage.removeItem(this.storageKey);
    }
  }

  protected lastIsUser() {
    const msgs = this.messages();
    return msgs.length > 0 && msgs[msgs.length - 1].role === 'user';
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.messagesEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
      this.shouldScroll = false;
    }
    if (this.shouldRenderMermaid) {
      this.shouldRenderMermaid = false;
      this.renderMermaidDivs();
    }
  }

  private renderMermaidDivs(): void {
    const container: HTMLElement = this.messagesContainer?.nativeElement;
    if (!container) return;
    const divs = Array.from(
      container.querySelectorAll<HTMLElement>('.mermaid:not([data-mermaid-processed])')
    );
    if (!divs.length) return;
    divs.forEach(el => {
      // textContent auto-decodes HTML entities (e.g. --&gt; → -->)
      const decoded = el.textContent ?? '';
      el.textContent = decoded;
      el.removeAttribute('data-processed'); // ensure mermaid re-processes
      el.setAttribute('data-mermaid-processed', 'true');
    });
    mermaid.run({ nodes: divs }).catch(() => {/* suppress parse errors */});
  }

  useSuggestion(text: string): void {
    this.inputText = text;
    this.send();
  }

  send(): void {
    const text = this.inputText.trim();
    if (!text || this.chatService.isStreaming()) return;

    this.inputText = '';
    this.showSaveIteration.set(false);
    this.addMsg('user', text);
    this.saveMessages(); // persiste el mensaje del usuario inmediatamente

    const agentMsg = this.addMsg('assistant', '');
    agentMsg.isStreaming = true;

    this.chatService.sendMessage(this.proposalId(), this.projectName(), text).subscribe({
      next: chunk => {
        agentMsg.content += chunk;
        this.messages.update(m => [...m]);
        this.shouldScroll = true;
      },
      error: () => {
        agentMsg.content = '⚠ Error al conectar con el agente.';
        agentMsg.isStreaming = false;
        this.messages.update(m => [...m]);
        this.notifications.error('Error al conectar con el agente');
        this.saveMessages(); // persiste el error como estado final
      },
      complete: () => {
        agentMsg.content = this.stripInternalMarkers(agentMsg.content);
        agentMsg.content = ProposalChatService.stripMetricsBlock(agentMsg.content);
        agentMsg.content = this.fixMermaidBlocks(agentMsg.content);
        agentMsg.isStreaming = false;
        agentMsg.references = this.chatService.currentReferences();
        this.lastCompletedContent = agentMsg.content;
        this.messages.update(m => [...m]);
        this.saveMessages(); // persiste la respuesta completa del agente
        this.showSaveIteration.set(true);
        this.shouldScroll = true;
        this.shouldRenderMermaid = true;
      },
    });
  }

  onKey(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  saveAsIteration(): void {
    this.saveIteration.emit(this.lastCompletedContent);
    this.showSaveIteration.set(false);
  }

  addExternalMessage(text: string): void {
    this.inputText = text;
    this.send();
  }

  private stripInternalMarkers(content: string): string {
    return content
      .replace(/##REFERENCES_START##[\s\S]*?##REFERENCES_END##/g, '')
      .replace(/##ITERATION_START##/g, '')
      .replace(/##ITERATION_END##/g, '')
      .trim();
  }

  private fixMermaidBlocks(content: string): string {
    content = content.replace(
      /```mermaid\s*([\s\S]*?)```/g,
      (_, block) => '```mermaid\n' + this.formatMermaidBlock(block) + '\n```'
    );
    const mermaidTypes = ['gantt', 'pie', 'timeline', 'sequenceDiagram', 'flowchart', 'graph'];
    mermaidTypes.forEach(type => {
      const regex = new RegExp(
        `(?<!\`\`\`mermaid[\\s\\S]*?)(${type}\\s+(?:title\\s+)?[^\\n\`]+(?:\\s+(?:dateFormat|section|title)[^\\n\`]+)*)`,
        'g'
      );
      content = content.replace(regex, match => {
        if (content.includes('```mermaid\n' + match)) return match;
        return '```mermaid\n' + this.formatMermaidBlock(match) + '\n```';
      });
    });
    return content;
  }

  private formatMermaidBlock(block: string): string {
    const keywords = [
      'dateFormat', 'axisFormat', 'todayMarker', 'section ', 'title ',
      'gantt', 'pie ', 'timeline', 'sequenceDiagram', 'flowchart', 'graph ',
    ];
    let result = block.trim();
    keywords.forEach(kw => {
      result = result.replace(new RegExp(`(?<!\\n)(${kw})`, 'g'), '\n$1');
    });
    result = result.replace(/\s+(["A-Za-záéíóú][^:]+\s*:[^\n]+)/g, '\n    $1');
    return result.split('\n').map((l: string) => l.trimEnd()).filter((l: string) => l.trim().length > 0).join('\n');
  }

  isRefsVisible(id: string): boolean {
    return this.expandedRefs().has(id);
  }

  toggleRefs(id: string): void {
    this.expandedRefs.update(set => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  getScoreClass(relevance: number): string {
    if (relevance >= 0.85) return 'score-high';
    if (relevance >= 0.65) return 'score-medium';
    return 'score-low';
  }

  private addMsg(role: 'user' | 'assistant', content: string): ChatPanelMessage {
    const msg: ChatPanelMessage = { id: crypto.randomUUID(), role, content, timestamp: new Date(), isStreaming: false };
    this.messages.update(m => [...m, msg]);
    this.shouldScroll = true;
    return msg;
  }
}
