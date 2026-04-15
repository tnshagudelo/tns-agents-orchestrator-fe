import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

function setup(data: ConfirmDialogData) {
  TestBed.configureTestingModule({
    imports: [ConfirmDialogComponent, NoopAnimationsModule],
    providers: [{ provide: MAT_DIALOG_DATA, useValue: data }],
  });
  const fixture = TestBed.createComponent(ConfirmDialogComponent);
  fixture.detectChanges();
  return fixture;
}

describe('ConfirmDialogComponent', () => {
  it('renders title and message', async () => {
    const fixture = setup({ title: 'T', message: 'M' });
    await fixture.whenStable();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('T');
    expect(text).toContain('M');
  });

  it('renders icon when provided', async () => {
    const fixture = setup({ title: 'T', message: 'M', icon: 'delete', color: 'warn' });
    await fixture.whenStable();
    const iconEl = (fixture.nativeElement as HTMLElement).querySelector('mat-icon');
    expect(iconEl).toBeTruthy();
  });

  it('uses default button labels when not supplied', async () => {
    const fixture = setup({ title: 'T', message: 'M' });
    await fixture.whenStable();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Cancelar');
    expect(text).toContain('Confirmar');
  });

  it('uses custom button labels when provided', async () => {
    const fixture = setup({ title: 'T', message: 'M', confirmText: 'OK', cancelText: 'Nope' });
    await fixture.whenStable();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('OK');
    expect(text).toContain('Nope');
  });
});
