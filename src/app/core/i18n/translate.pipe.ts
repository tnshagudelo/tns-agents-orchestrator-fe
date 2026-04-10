import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from './translation.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(TranslationService);

  transform(key: string, params?: Record<string, string>): string {
    // Read version signal to trigger re-evaluation on language change
    this.i18n.version();
    return this.i18n.get(key, params);
  }
}
