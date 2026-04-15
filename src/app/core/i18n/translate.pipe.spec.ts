import { TestBed } from '@angular/core/testing';
import { TranslatePipe } from './translate.pipe';
import { TranslationService } from './translation.service';

describe('TranslatePipe', () => {
  let pipe: TranslatePipe;
  let i18n: TranslationService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [TranslatePipe, TranslationService] });
    pipe = TestBed.inject(TranslatePipe);
    i18n = TestBed.inject(TranslationService);
  });

  it('delegates to TranslationService.get', () => {
    const spy = vi.spyOn(i18n, 'get').mockReturnValue('ok');
    expect(pipe.transform('key')).toBe('ok');
    expect(spy).toHaveBeenCalledWith('key', undefined);
  });

  it('forwards params', () => {
    const spy = vi.spyOn(i18n, 'get').mockReturnValue('hi');
    pipe.transform('key', { name: 'A' });
    expect(spy).toHaveBeenCalledWith('key', { name: 'A' });
  });

  it('reads the version signal (for change detection)', () => {
    const spy = vi.spyOn(i18n, 'version');
    pipe.transform('key');
    expect(spy).toHaveBeenCalled();
  });
});
