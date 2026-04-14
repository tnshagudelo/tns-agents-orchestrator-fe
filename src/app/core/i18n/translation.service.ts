import { Injectable, signal } from '@angular/core';
import ES from '../../../assets/i18n/es.json';
import EN from '../../../assets/i18n/en.json';

export type AppLanguage = 'es' | 'en';

const STORAGE_KEY = 'app_language';

const TRANSLATIONS: Record<AppLanguage, Record<string, unknown>> = {
  es: ES,
  en: EN,
};

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly _currentLang = signal<AppLanguage>(this.loadStoredLang());
  private _flatTranslations: Record<string, string>;

  /** Reactive signal so pipes re-evaluate on language change */
  readonly currentLang = this._currentLang.asReadonly();

  /** Increments on each language change — pipes read this to re-evaluate */
  readonly version = signal(0);

  constructor() {
    this._flatTranslations = this.flatten(TRANSLATIONS[this._currentLang()]);
  }

  setLanguage(lang: AppLanguage): void {
    if (lang === this._currentLang()) return;
    this._currentLang.set(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    this._flatTranslations = this.flatten(TRANSLATIONS[lang]);
    this.version.update(v => v + 1);
  }

  get(key: string, params?: Record<string, string>): string {
    let value = this._flatTranslations[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        value = value.replace(`{{${k}}}`, v);
      }
    }
    return value;
  }

  private flatten(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(result, this.flatten(value as Record<string, unknown>, fullKey));
      } else {
        result[fullKey] = String(value);
      }
    }
    return result;
  }

  private loadStoredLang(): AppLanguage {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'es') return stored;
    return 'es';
  }
}
