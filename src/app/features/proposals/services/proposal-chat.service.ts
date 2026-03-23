import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { RagReference } from '../models/proposal.model';

@Injectable({ providedIn: 'root' })
export class ProposalChatService {
  private readonly apiUrl = 'https://localhost:7292/api/agent/stream';
  private readonly sessions = new Map<string, string>();
  private currentAbortController: AbortController | null = null;

  private readonly _streamingContent = signal('');
  private readonly _isStreaming = signal(false);
  private readonly _currentReferences = signal<RagReference[]>([]);

  readonly streamingContent = this._streamingContent.asReadonly();
  readonly isStreaming = this._isStreaming.asReadonly();
  readonly currentReferences = this._currentReferences.asReadonly();

  constructor(private readonly auth: AuthService) {}

  sendMessage(proposalId: string, projectName: string, message: string): Observable<string> {
    if (!this.sessions.has(proposalId)) {
      this.sessions.set(proposalId, crypto.randomUUID());
    }
    const sessionId = this.sessions.get(proposalId)!;
    const token = this.auth.getToken() ?? '';

    this._streamingContent.set('');
    this._isStreaming.set(true);
    this._currentReferences.set([]);
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
          agent: 'ArchitectureAgent',
          metadata: { sessionId, projectName },
        }),
      }).then(response => {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let nextLineIsReferences = false;

        const read = () => {
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
              // Evento de error
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
                  console.warn('[ProposalChatService] Error parsing references', e);
                }
                continue;
              }

              // Resetear flag si la línea no es data:
              if (nextLineIsReferences) {
                nextLineIsReferences = false;
              }

              // Fin del stream
              if (line.includes('stream_complete')) {
                this._isStreaming.set(false);
                observer.complete();
                continue;
              }

              // Tokens de texto normales
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

  resetSession(proposalId: string): void {
    this.sessions.set(proposalId, crypto.randomUUID());
    this._streamingContent.set('');
  }
}
