import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy,
  viewChild,
  ElementRef,
  AfterViewChecked, }
from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
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
    DatePipe,
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
  templateUrl: './projectmanager-agent.component.html',
  styleUrl: './projectmanager-agent.component.scss',
})

export class ProjectManagerAgentComponent implements OnInit, OnDestroy, AfterViewChecked {

  private readonly messagesEnd = viewChild<ElementRef>('messagesEnd');
  private readonly messagesContainer = viewChild<ElementRef>('messagesContainer');

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
    const container: HTMLElement | undefined = this.messagesContainer()?.nativeElement;
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
      this.messagesEnd()?.nativeElement.scrollIntoView({ behavior: 'smooth' });
    } catch {}
  }
}
