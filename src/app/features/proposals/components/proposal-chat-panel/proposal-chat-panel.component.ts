import { Component, inject, input, output, signal, ViewChild, ElementRef, AfterViewChecked, OnInit } from '@angular/core';
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
  styles: [`
    .chat-panel { display: flex; flex-direction: column; height: 100%; min-height: 0; }

    .messages {
      flex: 1; overflow-y: auto; padding: 16px; display: flex;
      flex-direction: column; gap: 12px; min-height: 0;
    }

    .empty-chat {
      display: flex; flex-direction: column; align-items: center; gap: 12px;
      padding: 32px 16px; color: rgba(0,0,0,0.4); text-align: center;
      mat-icon { font-size: 3rem; width: 3rem; height: 3rem; opacity: 0.3; }
    }
    .quick-chips { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; }
    .quick-chip { font-size: 0.75rem; }

    .message { display: flex; gap: 8px; align-items: flex-start; animation: fadeIn 0.2s ease; }
    .message-user { flex-direction: row-reverse; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

    .msg-avatar {
      width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center;
      justify-content: center; flex-shrink: 0; background: #e8eaf6;
      mat-icon { font-size: 1rem; width: 1rem; height: 1rem; }
    }
    .message-user .msg-avatar { background: #2D1B6B; color: white; }

    .msg-bubble {
      max-width: 80%; background: #ede9fe; border: 1px solid #c4b5fd;
      border-radius: 4px 12px 12px 12px; padding: 10px 14px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      p { margin: 0; font-size: 0.88rem; line-height: 1.5; }
    }
    .message-user .msg-bubble {
      background: #2D1B6B; color: white; border: none;
      border-radius: 12px 4px 12px 12px;
      box-shadow: 0 1px 3px rgba(45,27,107,0.3);
    }

    .thinking { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: rgba(0,0,0,0.5); }

    .md-content { font-size: 0.88rem; line-height: 1.6; }
    .md-content ::ng-deep h2 { font-size: 1rem; font-weight: 600; margin: 12px 0 6px; color: #2D1B6B; }
    .md-content ::ng-deep table { border-collapse: collapse; width: 100%; font-size: 0.8rem; margin: 8px 0; }
    .md-content ::ng-deep th { background: #ede9fe; padding: 6px 10px; border: 1px solid #c4b5fd; }
    .md-content ::ng-deep td { padding: 4px 10px; border: 1px solid #e5e7eb; }
    .md-content ::ng-deep ul { padding-left: 18px; margin: 6px 0; }
    .md-content ::ng-deep li { margin: 3px 0; font-size: 0.85rem; }

    .cursor { display: inline-block; animation: blink 0.8s infinite; color: #2D1B6B; font-weight: bold; }
    @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }

    .msg-time { display: block; font-size: 0.65rem; color: rgba(0,0,0,0.35); margin-top: 4px; text-align: right; }
    .message-user .msg-time { color: rgba(255,255,255,0.6); }

    .input-area {
      display: flex; align-items: flex-end; gap: 8px; padding: 12px 16px;
      border-top: 1px solid rgba(0,0,0,0.08); flex-shrink: 0;
    }
    .input-field { flex: 1; }
    .send-btn { flex-shrink: 0; margin-bottom: 16px; width: 40px; height: 40px; }

    .save-bar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 16px; background: #f0fdf4; border-top: 1px solid #bbf7d0;
      font-size: 0.85rem; color: #166534;
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
      &:hover { color: #2D1B6B; }
      mat-icon { font-size: 15px; width: 15px; height: 15px; }
      .refs-count {
        background: #EEEDFE; color: #534AB7;
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
      border-left: 3px solid #7C3AED; border-radius: 6px; padding: 8px 10px;
    }

    .ref-header {
      display: flex; align-items: center; gap: 6px; margin-bottom: 4px;
      .ref-icon { font-size: 13px; width: 13px; height: 13px; color: #7C3AED; }
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
      font-size: 10px; background: #EEEDFE; color: #534AB7;
      padding: 1px 7px; border-radius: 10px;
    }
  `],
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
    'Reduce el presupuesto un 20%',
    'Agrega módulo de reportes',
  ];

  ngOnInit(): void {
    mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });
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
      },
      complete: () => {
        agentMsg.content = this.stripInternalMarkers(agentMsg.content);
        agentMsg.content = this.fixMermaidBlocks(agentMsg.content);
        agentMsg.isStreaming = false;
        agentMsg.references = this.chatService.currentReferences();
        this.lastCompletedContent = agentMsg.content;
        this.messages.update(m => [...m]);
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
    result = result.replace(/\s+(["A-Za-záéíóú][^:]+\s*:[^,\n]+)/g, '\n    $1');
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
