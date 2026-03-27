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
  styles: [`
    .page-container {
      padding: 24px;
      height: calc(100vh - 64px);
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-sizing: border-box;
    }

    /* Header — mismo patrón que MonitoringDashboard */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .agent-icon {
      font-size: 2.5rem;
      width: 2.5rem;
      height: 2.5rem;
      color: #3f51b5;
    }

    .page-header h1 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 600;
      line-height: 1.2;
    }

    .subtitle {
      font-size: 0.85rem;
      color: rgba(0,0,0,0.5);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .chip-ready { --mdc-chip-label-text-color: #2e7d32; }
    .chip-thinking { --mdc-chip-label-text-color: #e65100; }

    /* Chat card — ocupa todo el espacio restante */
    .chat-card {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-height: 0;
    }

    .chat-card mat-card-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 0;
      overflow: hidden;
      min-height: 0;
    }

    .chat-content {
      height: 100%;
    }

    /* Messages */
    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-height: 0;
    }

    /* Empty state */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 12px;
      color: rgba(0,0,0,0.4);
      text-align: center;
    }

    .empty-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      opacity: 0.3;
    }

    .empty-state h3 {
      margin: 0;
      font-size: 1.2rem;
      color: rgba(0,0,0,0.6);
    }

    .empty-state p {
      margin: 0;
      font-size: 0.9rem;
    }

    .suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
      margin-top: 8px;
    }

    .suggestions button {
      font-size: 0.8rem;
    }

    /* Message row */
    .message {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      animation: fadeIn 0.2s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .message--user {
      flex-direction: row-reverse;
    }

    /* Avatar */
    .message-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: #e8eaf6;
    }

    .message--user .message-avatar {
      background: #3f51b5;
      color: white;
    }

    .message-avatar mat-icon {
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
    }

    /* Bubble */
    .message-bubble {
      max-width: 75%;
      background: #f5f5f5;
      border-radius: 4px 16px 16px 16px;
      padding: 12px 16px;
      position: relative;
    }

    .message--user .message-bubble {
      background: #3f51b5;
      color: white;
      border-radius: 16px 4px 16px 16px;
    }

    .user-text {
      margin: 0;
      font-size: 0.95rem;
      line-height: 1.5;
    }

    /* Markdown dentro del bubble del agente */
    .markdown-content {
      font-size: 0.95rem;
      line-height: 1.6;
    }

    .markdown-content ::ng-deep h2 {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 16px 0 8px;
      color: #1a237e;
      border-bottom: 1px solid #e8eaf6;
      padding-bottom: 4px;
    }

    .markdown-content ::ng-deep h3 {
      font-size: 1rem;
      font-weight: 600;
      margin: 12px 0 6px;
    }

    .markdown-content ::ng-deep table {
      border-collapse: collapse;
      width: 100%;
      margin: 12px 0;
      font-size: 0.85rem;
    }

    .markdown-content ::ng-deep th {
      background: #e8eaf6;
      padding: 8px 12px;
      text-align: left;
      font-weight: 600;
      border: 1px solid #c5cae9;
    }

    .markdown-content ::ng-deep td {
      padding: 6px 12px;
      border: 1px solid #e0e0e0;
    }

    .markdown-content ::ng-deep tr:nth-child(even) td {
      background: #fafafa;
    }

    .markdown-content ::ng-deep ul,
    .markdown-content ::ng-deep ol {
      padding-left: 20px;
      margin: 8px 0;
    }

    .markdown-content ::ng-deep li {
      margin: 4px 0;
    }

    .markdown-content ::ng-deep strong {
      color: #1a237e;
    }

    .markdown-content ::ng-deep blockquote {
      border-left: 3px solid #3f51b5;
      margin: 8px 0;
      padding: 4px 12px;
      background: #f5f5f5;
      border-radius: 0 4px 4px 0;
    }

    /* Cursor parpadeante mientras el agente escribe */
    .cursor {
      display: inline-block;
      animation: blink 0.8s infinite;
      color: #3f51b5;
      font-weight: bold;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0; }
    }

    .message-time {
      display: block;
      font-size: 0.7rem;
      color: rgba(0,0,0,0.35);
      margin-top: 6px;
      text-align: right;
    }

    .message--user .message-time {
      color: rgba(255,255,255,0.6);
    }

    /* Typing indicator */
    .typing-bubble {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
    }

    .typing-text {
      font-size: 0.85rem;
      color: rgba(0,0,0,0.5);
    }

    /* Input area */
    .input-container {
      display: flex;
      align-items: flex-end;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid rgba(0,0,0,0.1);
      flex-shrink: 0;
    }

    .input-field {
      flex: 1;
    }

    .send-button {
      flex-shrink: 0;
      margin-bottom: 20px;
    }

    /* ── RAG Indicator (durante streaming) ── */
    .rag-indicator {
      display: flex; align-items: center; gap: 5px;
      font-size: 11px; color: rgba(0,0,0,0.45); margin-top: 6px; opacity: 0.8;
      mat-icon { font-size: 13px; width: 13px; height: 13px; animation: spin 1.5s linear infinite; }
    }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    /* ── RAG References block ── */
    .rag-references {
      margin-top: 12px;
      border-top: 0.5px solid rgba(0,0,0,0.12);
      padding-top: 10px;
    }

    .refs-toggle {
      display: flex; align-items: center; gap: 6px;
      background: none; border: none; cursor: pointer; padding: 4px 0;
      font-size: 12px; color: rgba(0,0,0,0.5); width: 100%; text-align: left;
      transition: color 0.15s;
      &:hover { color: #3f51b5; }
      mat-icon { font-size: 15px; width: 15px; height: 15px; }
      .refs-count {
        background: #e8eaf6; color: #3f51b5;
        font-size: 10px; padding: 1px 6px; border-radius: 10px; font-weight: 500;
      }
      .chevron { margin-left: auto; transition: transform 0.2s; &.rotated { transform: rotate(180deg); } }
    }

    .refs-list {
      display: flex; flex-direction: column; gap: 8px; margin-top: 8px;
      animation: slideDown 0.2s ease;
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .ref-item {
      background: rgba(255,255,255,0.6); border: 0.5px solid rgba(0,0,0,0.1);
      border-left: 3px solid #3f51b5; border-radius: 6px; padding: 8px 10px;
    }

    .ref-header {
      display: flex; align-items: center; gap: 6px; margin-bottom: 4px;
      .ref-icon { font-size: 13px; width: 13px; height: 13px; color: #3f51b5; }
      .ref-filename { font-size: 11px; font-weight: 500; color: rgba(0,0,0,0.75); flex: 1; }
      .ref-score {
        font-size: 10px; padding: 1px 7px; border-radius: 10px; font-weight: 500;
        &.score-high   { background: #EAF3DE; color: #3B6D11; }
        &.score-medium { background: #FAEEDA; color: #854F0B; }
        &.score-low    { background: #F1EFE8; color: #5F5E5A; }
      }
    }

    .ref-excerpt {
      font-size: 11px; color: rgba(0,0,0,0.5); font-style: italic;
      line-height: 1.5; margin: 4px 0;
      display: -webkit-box; -webkit-line-clamp: 2;
      -webkit-box-orient: vertical; overflow: hidden;
    }

    .ref-category {
      font-size: 10px; background: #e8eaf6; color: #3f51b5;
      padding: 1px 7px; border-radius: 10px;
    }
  `],
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
