import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ClientSidebarComponent } from './client-sidebar.component';

function setup(client: Partial<Record<string, unknown>>, date: Date | null = null) {
  const fixture = TestBed.createComponent(ClientSidebarComponent);
  fixture.componentRef.setInput('client', client);
  fixture.componentRef.setInput('lastInvestigationDate', date);
  fixture.detectChanges();
  return fixture;
}

describe('ClientSidebarComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ClientSidebarComponent, NoopAnimationsModule] });
  });

  it('computes avatarColor from name', () => {
    expect(setup({ name: 'Acme' }).componentInstance.avatarColor()).toBeTruthy();
  });

  it('initial is uppercase first letter', () => {
    expect(setup({ name: 'acme' }).componentInstance.initial()).toBe('A');
  });

  it('hasInvestigation reflects date input', () => {
    expect(setup({ name: 'x' }).componentInstance.hasInvestigation()).toBe(false);
    expect(setup({ name: 'x' }, new Date()).componentInstance.hasInvestigation()).toBe(true);
  });

  it('truncatedDescription handles long/short/missing descriptions', () => {
    expect(setup({ name: 'x', description: 'short' }).componentInstance.truncatedDescription()).toBe('short');
    const long = setup({ name: 'x', description: 'a'.repeat(200) });
    expect(long.componentInstance.truncatedDescription().endsWith('...')).toBe(true);
    expect(long.componentInstance.needsTruncation()).toBe(true);
    expect(setup({ name: 'x' }).componentInstance.truncatedDescription()).toBe('');
  });

  it('toggleDescription flips state', () => {
    const fixture = setup({ name: 'x' });
    fixture.componentInstance.toggleDescription();
    expect(fixture.componentInstance.showFullDescription).toBe(true);
  });
});
