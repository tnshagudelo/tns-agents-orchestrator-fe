import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class PlanningChatService {
  private readonly apiUrl = 'https://localhost:7292/api/agent/stream';
  private currentAbortController: AbortController | null = null;

  private readonly _streamingContent = signal('');
  private readonly _isStreaming = signal(false);

  readonly streamingContent = this._streamingContent.asReadonly();
  readonly isStreaming = this._isStreaming.asReadonly();

  constructor(private readonly auth: AuthService) {}

  /** Envía mensaje al agente conversacional (IntentExtraction o QuickResearch) */
  sendMessage(
    agent: 'IntentExtractionAgent' | 'QuickResearchAgent',
    sessionId: string,
    message: string,
    metadata: Record<string, string> = {}
  ): Observable<string> {
    const token = this.auth.getToken() ?? '';

    this._streamingContent.set('');
    this._isStreaming.set(true);
    this.currentAbortController = new AbortController();

    return new Observable(observer => {
      fetch(this.apiUrl, {
        method: 'POST',
        signal: this.currentAbortController!.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message,
          agent,
          metadata: { sessionId, ...metadata },
        }),
      }).then(response => {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        const read = (): void => {
          reader.read().then(({ done, value }) => {
            if (done) {
              this._isStreaming.set(false);
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

              if (line.includes('stream_complete')) {
                this._isStreaming.set(false);
                observer.complete();
                continue;
              }

              if (line.startsWith('data: ')) {
                const chunk = line.slice(6).replace(/\\n/g, '\n');
                this._streamingContent.update(c => c + chunk);
                observer.next(chunk);
              }
            }

            read();
          }).catch(err => {
            this._isStreaming.set(false);
            observer.error(err);
          });
        };

        read();
      }).catch(err => {
        this._isStreaming.set(false);
        observer.error(err);
      });
    });
  }

  stopStream(): void {
    this.currentAbortController?.abort();
    this._isStreaming.set(false);
  }

  resetContent(): void {
    this._streamingContent.set('');
  }
}
