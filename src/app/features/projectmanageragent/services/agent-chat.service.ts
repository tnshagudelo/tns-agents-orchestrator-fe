import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ChatMessage {  
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AgentChatService {

  private readonly apiUrl = 'https://localhost:7292/api/agent/stream';
  private sessionId: string = crypto.randomUUID();

  /**
   * Manda un mensaje al agente y devuelve un Observable
   * que emite tokens a medida que llegan del SSE.
   */
  sendMessage(message: string, projectName: string, token: string): Observable<string> {
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
              }

              if (line.startsWith('data: ') && !line.includes('stream_complete')) {
                // Restaura los saltos de línea que escapamos en el backend
                const token = line.slice(6).replace(/\\n/g, '\n');
                observer.next(token);
              }

              if (line.includes('stream_complete')) {
                observer.complete();
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
  }
}