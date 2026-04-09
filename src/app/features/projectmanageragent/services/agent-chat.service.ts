import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { RagReference } from '../../proposals/models/proposal.model';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  references?: RagReference[];
}

@Injectable({ providedIn: 'root' })
export class AgentChatService {

  private readonly apiUrl = 'https://localhost:7292/api/agent/stream';
  private sessionId: string = crypto.randomUUID();

  private readonly _currentReferences = signal<RagReference[]>([]);
  readonly currentReferences = this._currentReferences.asReadonly();

  /**
   * Manda un mensaje al agente y devuelve un Observable
   * que emite tokens a medida que llegan del SSE.
   */
  sendMessage(message: string, projectName: string, token: string): Observable<string> {
    this._currentReferences.set([]);

    return new Observable(observer => {

      // SSE requiere POST con body — usamos fetch porque
      // EventSource nativo solo soporta GET
      fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: message,
          agent:   'ProjectManagerAgent',
          metadata: {
            sessionId:   this.sessionId,
            projectName: projectName
          }
        })
      }).then(response => {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let nextLineIsReferences = false;

        const read = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              observer.complete();
              return;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              if (line.startsWith('event: error')) {
                observer.error(line);
                continue;
              }

              // Marca que la siguiente línea data: contiene referencias RAG
              if (line.startsWith('event: references')) {
                nextLineIsReferences = true;
                continue;
              }

              // Parsear referencias RAG
              if (line.startsWith('data: ') && nextLineIsReferences) {
                nextLineIsReferences = false;
                try {
                  const refs: RagReference[] = JSON.parse(line.slice(6));
                  this._currentReferences.set(refs);
                } catch (e) {
                  console.warn('[AgentChatService] Error parsing references', e);
                }
                continue;
              }

              if (line.startsWith('data: ') && !line.includes('stream_complete')) {
                // Restaura los saltos de línea que escapamos en el backend
                const token = line.slice(6).replace(/\\n/g, '\n');
                observer.next(token);
              }

              if (line.includes('stream_complete')) {
                observer.complete();
              }

              // Resetear flag si la línea no es data:
              if (nextLineIsReferences) {
                nextLineIsReferences = false;
              }
            }

            read();
          });
        };

        read();
      }).catch(err => observer.error(err));
    });
  }

  /** Inicia una conversación nueva */
  resetSession(): void {
    this.sessionId = crypto.randomUUID();
    this._currentReferences.set([]);
  }
}
