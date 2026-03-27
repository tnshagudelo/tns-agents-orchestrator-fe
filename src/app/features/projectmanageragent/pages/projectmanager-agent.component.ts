import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked, }
from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MarkdownModule } from 'ngx-markdown';
import { NotificationService } from '../../../core/services/notification.service';
import { AgentChatService, ChatMessage } from '../services/agent-chat.service';
import mermaid from 'mermaid';

@Component({
  selector: 'app-project-manager-agent',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MarkdownModule,
  ],
  template: `
    <div class="page-container">

      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <mat-icon class="agent-icon">psychology</mat-icon>
          <div>
            <h1>Project Manager Agent</h1>
            <span class="subtitle">Estimación inteligente de proyectos</span>
          </div>
        </div>
        <div class="header-actions">
          <mat-chip-set>
            <mat-chip [class]="isLoading() ? 'chip-thinking' : 'chip-ready'">
              <mat-icon matChipAvatar>{{ isLoading() ? 'hourglass_top' : 'check_circle' }}</mat-icon>
              {{ isLoading() ? 'Analizando...' : 'Listo' }}
            </mat-chip>
          </mat-chip-set>
          <button
            mat-stroked-button
            (click)="resetChat()"
            [disabled]="isLoading()"
            matTooltip="Iniciar nueva estimación">
            <mat-icon>add</mat-icon> Nueva estimación
          </button>
        </div>
      </div>

      <!-- Chat container -->
      <mat-card class="chat-card">
        <mat-card-content class="chat-content">

          <!-- Messages -->
          <div class="messages-container" #messagesContainer>

            <!-- Empty state -->
            @if (messages().length === 0) {
              <div class="empty-state">
                <mat-icon class="empty-icon">chat_bubble_outline</mat-icon>
                <h3>¿En qué proyecto trabajamos hoy?</h3>
                <p>Describe tu proyecto y te ayudo a estimar equipo, fases y cronograma.</p>
                <div class="suggestions">
                  <button
                    mat-stroked-button
                    *ngFor="let s of suggestions"
                    (click)="useSuggestion(s)">
                    {{ s }}
                  </button>
                </div>
              </div>
            }

            <!-- Message list -->
            @for (msg of messages(); track msg.id) {
              <div [class]="'message message--' + msg.role">

                <!-- Avatar -->
                <div class="message-avatar">
                  <mat-icon>{{ msg.role === 'user' ? 'person' : 'psychology' }}</mat-icon>
                </div>

                <!-- Bubble -->
                <div class="message-bubble">
                  @if (msg.role === 'assistant') {
                    <!-- Markdown para respuestas del agente — renderiza tablas y listas -->
                    <markdown [data]="msg.content" class="markdown-content"></markdown>
                    @if (msg.isStreaming) {
                      <span class="cursor">▌</span>
                      <div class="rag-indicator">
                        <mat-icon class="rag-spin">sync</mat-icon>
                        <span>Consultando base de conocimiento...</span>
                      </div>
                    }
                    @if (msg.references && msg.references.length > 0) {
                      <div class="rag-references">
                        <button class="refs-toggle" (click)="toggleRefs(msg.id)">
                          <mat-icon>auto_stories</mat-icon>
                          <span>{{ isRefsVisible(msg.id) ? 'Ocultar' : 'Ver' }} referencias consultadas</span>
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
                    <p class="user-text">{{ msg.content }}</p>
                  }
                  <span class="message-time">{{ msg.timestamp | date:'HH:mm' }}</span>
                </div>

              </div>
            }

            <!-- Typing indicator -->
            @if (isLoading() && lastMessageIsUser()) {
              <div class="message message--assistant">
                <div class="message-avatar">
                  <mat-icon>psychology</mat-icon>
                </div>
                <div class="message-bubble typing-bubble">
                  <mat-progress-spinner diameter="16" mode="indeterminate"></mat-progress-spinner>
                  <span class="typing-text">Analizando tu solicitud...</span>
                </div>
              </div>
            }

            <div #messagesEnd></div>
          </div>

          <!-- Input -->
          <div class="input-container">
            <mat-form-field appearance="outline" class="input-field">
              <mat-label>Describe tu proyecto o responde la pregunta del agente</mat-label>
              <textarea
                matInput
                [(ngModel)]="inputText"
                [disabled]="isLoading()"
                (keydown)="onKeydown($event)"
                rows="2"
                placeholder="Ej: Necesito un sistema de facturación para 500 usuarios...">
              </textarea>
              <mat-hint>Enter para enviar · Shift+Enter para nueva línea</mat-hint>
            </mat-form-field>

            <button
              mat-fab
              color="primary"
              (click)="send()"
              [disabled]="isLoading() || !inputText.trim()"
              matTooltip="Enviar mensaje"
              class="send-button">
              <mat-icon>send</mat-icon>
            </button>
          </div>

        </mat-card-content>
      </mat-card>

    </div>
  `,
  styleUrl: './projectmanager-agent.component.scss',
})

export class ProjectManagerAgentComponent implements OnInit, OnDestroy, AfterViewChecked {

   @ViewChild('messagesEnd') private messagesEnd!: ElementRef;
   @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  protected readonly chatService     = inject(AgentChatService);
  private readonly notifications     = inject(NotificationService);

  protected messages  = signal<ChatMessage[]>([]);
  protected isLoading = signal(false);
  protected inputText = '';

  protected lastMessageIsUser = computed(() => {
    const msgs = this.messages();
    return msgs.length > 0 && msgs[msgs.length - 1].role === 'user';
  });

  protected suggestions = [
    'Sistema de facturación para 500 usuarios',
    'App móvil de delivery con pagos',
    'Portal de gestión de RRHH con nómina',
  ];

  private shouldScroll = false;
  private shouldRenderMermaid = false;
  private expandedRefs = signal<Set<string>>(new Set());

  ngOnInit(): void {
    mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
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
      const decoded = el.textContent ?? '';
      el.textContent = decoded;
      el.removeAttribute('data-processed');
      el.setAttribute('data-mermaid-processed', 'true');
    });
    mermaid.run({ nodes: divs }).catch(() => {});
  }

  ngOnDestroy(): void {}

  protected send(): void {
    const text = this.inputText.trim();
    if (!text || this.isLoading()) return;

    this.inputText = '';
    this.addMessage('user', text);

    // Placeholder del agente — se llena con los tokens SSE
    const assistantMsg = this.addMessage('assistant', '');
    assistantMsg.isStreaming = true;
    this.isLoading.set(true);

    // Token JWT — reemplaza con tu AuthService
    const jwtToken = 'JWT_TOKEN';

    this.chatService.sendMessage(text, 'Mi Proyecto', jwtToken).subscribe({
      next: (chunk) => {
        assistantMsg.content += chunk;
        // Fuerza re-render del signal con nuevo array
        this.messages.update(msgs => [...msgs]);
        this.shouldScroll = true;
      },
      error: () => {
        assistantMsg.content     = '⚠ Error al procesar la solicitud. Intenta nuevamente.';
        assistantMsg.isStreaming = false;
        this.messages.update(msgs => [...msgs]);
        this.isLoading.set(false);
        this.notifications.error('Error al conectar con el agente');
      },
      complete: () => {
        assistantMsg.content     = this.fixMermaidBlocks(assistantMsg.content);
        assistantMsg.isStreaming = false;
        assistantMsg.references  = this.chatService.currentReferences();
        this.messages.update(msgs => [...msgs]);
        this.isLoading.set(false);
        this.shouldScroll = true;
        this.shouldRenderMermaid = true;
      },
    });
  }

  protected useSuggestion(text: string): void {
    this.inputText = text;
    this.send();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  protected resetChat(): void {
    this.messages.set([]);
    this.chatService.resetSession();
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

  private fixMermaidBlocks(content: string): string {
  // Caso 1: tiene backticks pero todo en una línea — arregla saltos de línea
  content = content.replace(
    /```mermaid\s*([\s\S]*?)```/g,
    (_, block) => '```mermaid\n' + this.formatMermaidBlock(block) + '\n```'
  );

  // Caso 2: no tiene backticks — detecta por keywords y los envuelve
  const mermaidTypes = ['gantt', 'pie', 'timeline', 'sequenceDiagram', 'flowchart', 'graph'];

  mermaidTypes.forEach(type => {
    // Busca el keyword fuera de un bloque de código existente
    const regex = new RegExp(
      `(?<!\`\`\`mermaid[\\s\\S]*?)(${type}\\s+(?:title\\s+)?[^\\n\`]+(?:\\s+(?:dateFormat|section|title)[^\\n\`]+)*)`,
      'g'
    );

    content = content.replace(regex, (match) => {
      // Si ya está dentro de backticks, no lo toques
      if (content.includes('```mermaid\n' + match)) return match;
      return '```mermaid\n' + this.formatMermaidBlock(match) + '\n```';
    });
  });

  return content;
}

private formatMermaidBlock(block: string): string {
  // Palabras clave que deben ir en su propia línea
  const keywords = [
    'dateFormat', 'axisFormat', 'todayMarker',
    'section ', 'title ', 'gantt', 'pie ', 'timeline',
    'sequenceDiagram', 'flowchart', 'graph '
  ];

  let result = block.trim();

  // Agrega salto de línea antes de cada keyword
  keywords.forEach(kw => {
    result = result.replace(
      new RegExp(`(?<!\\n)(${kw})`, 'g'),
      '\n$1'
    );
  });

  // Cada entrada con : también va en su propia línea (tareas del gantt, pie, timeline)
  result = result.replace(/\s+(["A-Za-záéíóú][^:]+\s*:[^\n]+)/g, '\n    $1');

  // Limpia líneas vacías y espacios
  return result
    .split('\n')
    .map((l: string) => l.trimEnd())
    .filter((l: string) => l.trim().length > 0)
    .join('\n');
}

  private addMessage(role: 'user' | 'assistant', content: string): ChatMessage {
    const msg: ChatMessage = {
      id:          crypto.randomUUID(),
      role,
      content,
      timestamp:   new Date(),
      isStreaming: false,
    };

    this.messages.update(msgs => [...msgs, msg]);
    this.shouldScroll = true;
    return msg;
  }

  private scrollToBottom(): void {
    try {
      this.messagesEnd?.nativeElement.scrollIntoView({ behavior: 'smooth' });
    } catch {}
  }
}
