import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMarkdown } from 'ngx-markdown';
import { provideHttpClient } from '@angular/common/http';
import { SessionChatComponent } from './session-chat.component';

function setup() {
  const fixture = TestBed.createComponent(SessionChatComponent);
  fixture.componentRef.setInput('messages', []);
  fixture.detectChanges();
  return fixture;
}

describe('SessionChatComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SessionChatComponent, NoopAnimationsModule],
      providers: [provideHttpClient(), provideMarkdown()],
    });
  });
  it('hasMessages false when empty and no streaming', () => {
    const fixture = setup();
    expect(fixture.componentInstance.hasMessages()).toBeFalsy();
  });

  it('sendMessage emits trimmed text and clears input', () => {
    const fixture = setup();
    const events: string[] = [];
    fixture.componentInstance.messageSent.subscribe((t: string) => events.push(t));
    fixture.componentInstance.chatInput = '  hi  ';
    fixture.componentInstance.sendMessage();
    expect(events).toEqual(['hi']);
    expect(fixture.componentInstance.chatInput).toBe('');
  });

  it('sendMessage ignores empty', () => {
    const fixture = setup();
    const events: string[] = [];
    fixture.componentInstance.messageSent.subscribe((t: string) => events.push(t));
    fixture.componentInstance.chatInput = '   ';
    fixture.componentInstance.sendMessage();
    expect(events).toEqual([]);
  });

  it('onKeydown Enter triggers send; Shift+Enter does not', () => {
    const fixture = setup();
    const events: string[] = [];
    fixture.componentInstance.messageSent.subscribe((t: string) => events.push(t));
    fixture.componentInstance.chatInput = 'hi';
    const ev1 = new KeyboardEvent('keydown', { key: 'Enter' });
    fixture.componentInstance.onKeydown(ev1);
    expect(events).toEqual(['hi']);

    fixture.componentInstance.chatInput = 'bye';
    const ev2 = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true });
    fixture.componentInstance.onKeydown(ev2);
    expect(events).toEqual(['hi']);
  });
});
