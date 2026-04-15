import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AgentCardComponent } from './agent-card.component';

const agent = { id: 'a1', name: 'Agent', description: 'd', status: 'running', model: 'gpt-4' };

describe('AgentCardComponent', () => {
  it('renders agent info', async () => {
    TestBed.configureTestingModule({ imports: [AgentCardComponent, NoopAnimationsModule] });
    const fixture = TestBed.createComponent(AgentCardComponent);
    fixture.componentRef.setInput('agent', agent);
    fixture.detectChanges();
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Agent');
  });

  it('emits outputs when triggered imperatively', () => {
    TestBed.configureTestingModule({ imports: [AgentCardComponent, NoopAnimationsModule] });
    const fixture = TestBed.createComponent(AgentCardComponent);
    fixture.componentRef.setInput('agent', agent);
    const events: string[] = [];
    fixture.componentInstance.view.subscribe(() => events.push('view'));
    fixture.componentInstance.start.subscribe(() => events.push('start'));
    fixture.componentInstance.stop.subscribe(() => events.push('stop'));
    fixture.componentInstance.edit.subscribe(() => events.push('edit'));
    fixture.componentInstance.delete.subscribe(() => events.push('delete'));
    fixture.componentInstance.view.emit(agent as never);
    fixture.componentInstance.start.emit('a1');
    fixture.componentInstance.stop.emit('a1');
    fixture.componentInstance.edit.emit(agent as never);
    fixture.componentInstance.delete.emit('a1');
    expect(events).toEqual(['view', 'start', 'stop', 'edit', 'delete']);
  });
});
