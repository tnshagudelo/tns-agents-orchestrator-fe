import { Component, ElementRef, ViewChild, input, output, computed, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MarkdownComponent } from 'ngx-markdown';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

@Component({
  selector: 'app-session-chat',
  standalone: true,
  imports: [
    FormsModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatTooltipModule, MarkdownComponent,
  ],
  templateUrl: './session-chat.component.html',
  styleUrl: './session-chat.component.scss',
})
export class SessionChatComponent {
  /** Historial de mensajes */
  readonly messages = input.required<ChatMessage[]>();
  /** Contenido parcial del streaming actual */
  readonly streamingContent = input<string>('');
  /** Si el agente está respondiendo */
  readonly isStreaming = input<boolean>(false);
  /** Nombre del cliente para el greeting */
  readonly clientName = input<string>('');
  /** Si es re-investigación */
  readonly isReturningClient = input<boolean>(false);
  /** Última fecha de investigación */
  readonly lastInvestigationDate = input<Date | null>(null);
  /** Ocultar el input de chat (cuando se pasa a otro paso del flujo) */
  readonly hideInput = input<boolean>(false);

  /** Emite el mensaje del usuario */
  readonly messageSent = output<string>();
  /** Emite cuando el usuario quiere confirmar el cliente */
  readonly clientConfirmed = output<void>();
  /** Emite cuando el usuario quiere ver resultados anteriores */
  readonly viewPreviousResults = output<void>();

  /** Mostrar el botón de confirmar */
  readonly showConfirmation = input<boolean>(false);

  chatInput = '';

  @ViewChild('chatContainer') private chatContainer!: ElementRef<HTMLDivElement>;

  /** Auto-scroll cuando cambian los mensajes o el streaming */
  constructor() {
    effect(() => {
      this.messages();
      this.streamingContent();
      this.scrollToBottom();
    });
  }

  readonly hasMessages = computed(() => this.messages().length > 0 || this.streamingContent());

  sendMessage(): void {
    const text = this.chatInput.trim();
    if (!text || this.isStreaming()) return;
    this.chatInput = '';
    this.messageSent.emit(text);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatContainer) {
        const el = this.chatContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    }, 50);
  }
}
