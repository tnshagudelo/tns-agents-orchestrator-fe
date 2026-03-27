import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ClipboardService {
  private readonly _copiedId = signal<string | null>(null);
  readonly copiedId = this._copiedId.asReadonly();

  async copy(text: string, id: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this._copiedId.set(id);
      setTimeout(() => {
        if (this._copiedId() === id) {
          this._copiedId.set(null);
        }
      }, 2000);
    } catch {
      // Fallback para navegadores sin Clipboard API
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this._copiedId.set(id);
      setTimeout(() => this._copiedId.set(null), 2000);
    }
  }

  isCopied(id: string): boolean {
    return this._copiedId() === id;
  }
}
