import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CommentThreadComponent } from './comment-thread.component';

const comment = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 'c',
  authorId: 'u',
  authorName: 'U',
  authorRole: 'builder' as const,
  body: 'hi',
  iterationVersion: 1,
  createdAt: new Date(),
  ...overrides,
});

function setup(comments: ReturnType<typeof comment>[], filterIteration: number | null = null) {
  TestBed.configureTestingModule({ imports: [CommentThreadComponent, NoopAnimationsModule] });
  const fixture = TestBed.createComponent(CommentThreadComponent);
  fixture.componentRef.setInput('comments', comments);
  fixture.componentRef.setInput('filterIteration', filterIteration);
  fixture.detectChanges();
  return fixture;
}

describe('CommentThreadComponent', () => {
  it('filteredComments returns all when filter null', () => {
    const fixture = setup([comment({ iterationVersion: 1 }), comment({ iterationVersion: 2 })]);
    expect(fixture.componentInstance.filteredComments()).toHaveLength(2);
  });

  it('filteredComments filters by iteration when set', () => {
    const fixture = setup([comment({ iterationVersion: 1 }), comment({ iterationVersion: 2 })], 2);
    expect(fixture.componentInstance.filteredComments()).toHaveLength(1);
  });

  it('submitComment emits trimmed text and resets field', () => {
    const fixture = setup([]);
    const events: string[] = [];
    fixture.componentInstance.addComment.subscribe((v: string) => events.push(v));
    fixture.componentInstance.newComment = '  hello  ';
    fixture.componentInstance.submitComment();
    expect(events).toEqual(['hello']);
    expect(fixture.componentInstance.newComment).toBe('');
  });

  it('submitComment ignores empty text', () => {
    const fixture = setup([]);
    const events: string[] = [];
    fixture.componentInstance.addComment.subscribe((v: string) => events.push(v));
    fixture.componentInstance.newComment = '   ';
    fixture.componentInstance.submitComment();
    expect(events).toEqual([]);
  });

  it('submitComment skips when shift+enter is pressed', () => {
    const fixture = setup([]);
    const events: string[] = [];
    fixture.componentInstance.addComment.subscribe((v: string) => events.push(v));
    fixture.componentInstance.newComment = 'hi';
    const ev = new KeyboardEvent('keydown', { shiftKey: true });
    fixture.componentInstance.submitComment(ev);
    expect(events).toEqual([]);
    expect(fixture.componentInstance.newComment).toBe('hi');
  });
});
