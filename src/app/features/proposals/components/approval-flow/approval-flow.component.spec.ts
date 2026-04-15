import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ApprovalFlowComponent } from './approval-flow.component';

describe('ApprovalFlowComponent', () => {
  it('renders steps and maps icon/label per status', async () => {
    TestBed.configureTestingModule({ imports: [ApprovalFlowComponent, NoopAnimationsModule] });
    const fixture = TestBed.createComponent(ApprovalFlowComponent);
    fixture.componentRef.setInput('steps', [
      { role: 'reviewer', userId: 'u1', userName: 'R', status: 'approved' },
      { role: 'approver', userId: 'u2', userName: 'A', status: 'pending' },
    ]);
    fixture.detectChanges();
    await fixture.whenStable();
    const cmp = fixture.componentInstance;
    expect(cmp.stepIcon('pending')).toBe('radio_button_unchecked');
    expect(cmp.stepIcon('approved')).toBe('check_circle');
    expect(cmp.stepIcon('rejected')).toBe('cancel');
    expect(cmp.stepIcon('changes_requested')).toBe('rate_review');
    expect(cmp.roleLabel('builder')).toBe('Autor');
    expect(cmp.roleLabel('reviewer')).toBe('Revisor');
    expect(cmp.roleLabel('approver')).toBe('Aprobador');
    expect(cmp.roleLabel('unknown')).toBe('unknown');
  });
});
