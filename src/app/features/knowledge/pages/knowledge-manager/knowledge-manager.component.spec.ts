import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { KnowledgeManagerComponent } from './knowledge-manager.component';

describe('KnowledgeManagerComponent', () => {
  let httpMock: HttpTestingController;

  const flushInit = () => {
    httpMock.expectOne(r => r.url.endsWith('/api/knowledge/status')).flush({
      success: true, data: { exists: true, vectorCount: 0 },
    });
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [KnowledgeManagerComponent, NoopAnimationsModule],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads status on init', () => {
    const fixture = TestBed.createComponent(KnowledgeManagerComponent);
    fixture.detectChanges();
    flushInit();
    expect(true).toBe(true);
  });

  it('onDragOver/onDragLeave toggle isDragActive', () => {
    const fixture = TestBed.createComponent(KnowledgeManagerComponent);
    fixture.detectChanges();
    flushInit();
    const cmp = fixture.componentInstance as unknown as {
      isDragActive: { (): boolean };
      onDragOver: (e: DragEvent) => void;
      onDragLeave: (e: DragEvent) => void;
    };
    const ev = { preventDefault: vi.fn(), stopPropagation: vi.fn() } as unknown as DragEvent;
    cmp.onDragOver(ev);
    expect(cmp.isDragActive()).toBe(true);
    cmp.onDragLeave(ev);
    expect(cmp.isDragActive()).toBe(false);
  });

  it('processFiles via onDrop filters by extension', () => {
    const fixture = TestBed.createComponent(KnowledgeManagerComponent);
    fixture.detectChanges();
    flushInit();
    const cmp = fixture.componentInstance as unknown as {
      onDrop: (e: DragEvent) => void;
      pendingFiles: { (): unknown[] };
    };
    const md = new File(['x'], 'a.md');
    const exe = new File(['x'], 'b.exe');
    const ev = { preventDefault: vi.fn(), stopPropagation: vi.fn(), dataTransfer: { files: [md, exe] } } as unknown as DragEvent;
    cmp.onDrop(ev);
    expect(cmp.pendingFiles()).toHaveLength(1);
  });

  it('removeFile removes by id; clearList empties', () => {
    const fixture = TestBed.createComponent(KnowledgeManagerComponent);
    fixture.detectChanges();
    flushInit();
    const cmp = fixture.componentInstance as unknown as {
      pendingFiles: { (): { id: string }[]; set: (v: unknown) => void };
      removeFile: (id: string) => void;
      clearList: () => void;
    };
    cmp.pendingFiles.set([{ id: 'a' }, { id: 'b' }]);
    cmp.removeFile('a');
    expect(cmp.pendingFiles()).toHaveLength(1);
    cmp.clearList();
    expect(cmp.pendingFiles()).toEqual([]);
  });

  it('uploadFiles no-ops when none pending or already ingesting', () => {
    const fixture = TestBed.createComponent(KnowledgeManagerComponent);
    fixture.detectChanges();
    flushInit();
    const cmp = fixture.componentInstance as unknown as { uploadFiles: () => void };
    cmp.uploadFiles();
    httpMock.verify();
  });

  it('uploadFiles success path updates state and reloads status', () => {
    const fixture = TestBed.createComponent(KnowledgeManagerComponent);
    fixture.detectChanges();
    flushInit();
    const cmp = fixture.componentInstance as unknown as {
      pendingFiles: { (): unknown[]; set: (v: unknown) => void };
      uploadFiles: () => void;
    };
    const f = new File(['x'], 'a.md');
    cmp.pendingFiles.set([{ file: f, id: '1', status: 'pending' }]);
    cmp.uploadFiles();
    httpMock.expectOne(r => r.url.endsWith('/api/knowledge/ingest'))
      .flush({ success: true, data: { filesProcessed: 1, chunksIndexed: 2 } });
    httpMock.expectOne(r => r.url.endsWith('/api/knowledge/status'))
      .flush({ success: true, data: { exists: true, vectorCount: 2 } });
  });

  it('uploadFiles backend failure marks files as error', () => {
    const fixture = TestBed.createComponent(KnowledgeManagerComponent);
    fixture.detectChanges();
    flushInit();
    const cmp = fixture.componentInstance as unknown as {
      pendingFiles: { (): { status: string; error?: string }[]; set: (v: unknown) => void };
      uploadFiles: () => void;
    };
    cmp.pendingFiles.set([{ file: new File(['x'], 'a.md'), id: '1', status: 'pending' }]);
    cmp.uploadFiles();
    httpMock.expectOne(r => r.url.endsWith('/api/knowledge/ingest'))
      .flush({ success: false, error: 'oops' });
    expect(cmp.pendingFiles()[0].status).toBe('error');
  });

  it('uploadFiles network error marks files as error', () => {
    const fixture = TestBed.createComponent(KnowledgeManagerComponent);
    fixture.detectChanges();
    flushInit();
    const cmp = fixture.componentInstance as unknown as {
      pendingFiles: { (): { status: string }[]; set: (v: unknown) => void };
      uploadFiles: () => void;
    };
    cmp.pendingFiles.set([{ file: new File(['x'], 'a.md'), id: '1', status: 'pending' }]);
    cmp.uploadFiles();
    httpMock.expectOne(r => r.url.endsWith('/api/knowledge/ingest')).error(new ProgressEvent('err'));
    expect(cmp.pendingFiles()[0].status).toBe('error');
  });

  it('search ignores empty query, hits endpoint when present', () => {
    const fixture = TestBed.createComponent(KnowledgeManagerComponent);
    fixture.detectChanges();
    flushInit();
    const cmp = fixture.componentInstance as unknown as {
      searchQuery: { set: (v: string) => void };
      search: () => void;
      useSuggestion: (t: string) => void;
    };
    cmp.searchQuery.set('');
    cmp.search();
    httpMock.verify();

    cmp.useSuggestion('foo');
    httpMock.expectOne(r => r.url.endsWith('/api/knowledge/search'))
      .flush({ success: true, data: { items: [] } });
  });

  it('confirmDeleteCollection / cancelDelete toggle flag', () => {
    const fixture = TestBed.createComponent(KnowledgeManagerComponent);
    fixture.detectChanges();
    flushInit();
    const cmp = fixture.componentInstance as unknown as {
      showDeleteConfirm: { (): boolean };
      confirmDeleteCollection: () => void;
      cancelDelete: () => void;
    };
    cmp.confirmDeleteCollection();
    expect(cmp.showDeleteConfirm()).toBe(true);
    cmp.cancelDelete();
    expect(cmp.showDeleteConfirm()).toBe(false);
  });

  it('deleteCollection success and error paths', () => {
    const fixture = TestBed.createComponent(KnowledgeManagerComponent);
    fixture.detectChanges();
    flushInit();
    const cmp = fixture.componentInstance as unknown as {
      deleteCollection: () => void;
      showDeleteConfirm: { (): boolean };
    };
    cmp.deleteCollection();
    httpMock.expectOne(r => r.url.endsWith('/api/knowledge/collection')).flush({ success: true });
    httpMock.expectOne(r => r.url.endsWith('/api/knowledge/status')).flush({ success: true, data: { exists: true, vectorCount: 0 } });
    expect(cmp.showDeleteConfirm()).toBe(false);

    cmp.deleteCollection();
    httpMock.expectOne(r => r.url.endsWith('/api/knowledge/collection')).error(new ProgressEvent('err'));
    expect(cmp.showDeleteConfirm()).toBe(false);
  });

  it('helpers: scoreBadgeClass / formatSize / truncate / fileIcon / statusLabel', () => {
    const fixture = TestBed.createComponent(KnowledgeManagerComponent);
    fixture.detectChanges();
    flushInit();
    const cmp = fixture.componentInstance as unknown as {
      scoreBadgeClass: (s: number) => string;
      formatSize: (b: number) => string;
      truncate: (t: string, max?: number) => string;
      fileIcon: (n: string) => string;
      statusLabel: (s: string) => string;
    };
    expect(cmp.scoreBadgeClass(0.9)).toBe('high');
    expect(cmp.scoreBadgeClass(0.7)).toBe('medium');
    expect(cmp.scoreBadgeClass(0.1)).toBe('low');
    expect(cmp.formatSize(500)).toBe('500 B');
    expect(cmp.formatSize(2048)).toBe('2.0 KB');
    expect(cmp.formatSize(2 * 1024 * 1024)).toBe('2.0 MB');
    expect(cmp.truncate('abc', 10)).toBe('abc');
    expect(cmp.truncate('abcdefghij', 5)).toBe('abcde...');
    expect(cmp.fileIcon('a.pdf')).toBe('picture_as_pdf');
    expect(cmp.fileIcon('a.docx')).toBe('draft');
    expect(cmp.fileIcon('a.md')).toBe('description');
    expect(cmp.fileIcon('a.txt')).toBe('article');
    expect(cmp.statusLabel('pending')).toBe('Pendiente');
    expect(cmp.statusLabel('success')).toBe('✓ Indexado');
  });
});
