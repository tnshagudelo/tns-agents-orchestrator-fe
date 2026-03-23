import {
  Component, inject, OnInit, signal, computed, ViewChild, ElementRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { KnowledgeService } from '../../services/knowledge.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { UploadedFile } from '../../models/knowledge.model';

@Component({
  selector: 'app-knowledge-manager',
  standalone: true,
  templateUrl: './knowledge-manager.component.html',
  styleUrl: './knowledge-manager.component.scss',
  imports: [
    FormsModule, DecimalPipe,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatListModule, MatProgressBarModule, MatProgressSpinnerModule,
    MatTooltipModule, MatDividerModule,
  ],
})
export class KnowledgeManagerComponent implements OnInit {
  @ViewChild('fileInput') private fileInput!: ElementRef<HTMLInputElement>;

  protected readonly knowledgeService = inject(KnowledgeService);
  private  readonly notifications     = inject(NotificationService);

  // ── Estado del componente ─────────────────────────────────────────────────
  protected pendingFiles      = signal<UploadedFile[]>([]);
  protected selectedCategory  = signal('gobierno-arquitectura');
  protected isDragActive      = signal(false);
  protected searchQuery       = signal('');
  protected showDeleteConfirm = signal(false);

  protected readonly pendingCount = computed(() =>
    this.pendingFiles().filter(f => f.status === 'pending').length,
  );
  protected readonly hasDoneFiles = computed(() =>
    this.pendingFiles().some(f => f.status === 'success' || f.status === 'error'),
  );

  readonly categories = [
    { value: 'gobierno-arquitectura', label: 'Gobierno de Arquitectura' },
    { value: 'integraciones',         label: 'Integraciones' },
    { value: 'seguridad',             label: 'Seguridad' },
    { value: 'general',               label: 'General' },
  ];

  readonly suggestions = [
    'tecnologías autorizadas',
    'nomenclatura tablas',
    'cómo integrar servicios',
    'seguridad APIs',
  ];

  // ── Ciclo de vida ─────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.knowledgeService.loadStatus();
  }

  // ── Drag & Drop ───────────────────────────────────────────────────────────
  onDragOver(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isDragActive.set(true);
  }

  onDragLeave(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isDragActive.set(false);
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isDragActive.set(false);
    if (e.dataTransfer?.files) {
      this.processFiles(Array.from(e.dataTransfer.files));
    }
  }

  onFileInput(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files) {
      this.processFiles(Array.from(input.files));
      input.value = '';
    }
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  // ── Gestión de archivos ───────────────────────────────────────────────────
  private processFiles(files: File[]): void {
    const allowed = files.filter(f => f.name.endsWith('.md') || f.name.endsWith('.txt'));
    const newFiles: UploadedFile[] = allowed.map(f => ({
      file: f,
      id: crypto.randomUUID(),
      status: 'pending',
    }));
    this.pendingFiles.update(list => [...list, ...newFiles]);
  }

  removeFile(id: string): void {
    this.pendingFiles.update(list => list.filter(f => f.id !== id));
  }

  clearList(): void {
    this.pendingFiles.set([]);
  }

  // ── Upload ────────────────────────────────────────────────────────────────
  uploadFiles(): void {
    const files = this.pendingFiles().filter(f => f.status === 'pending');
    if (!files.length || this.knowledgeService.isIngesting()) return;

    this.knowledgeService.isIngesting.set(true);
    this.pendingFiles.update(list =>
      list.map(f => f.status === 'pending' ? { ...f, status: 'uploading' as const } : f),
    );

    this.knowledgeService.ingestFiles(files.map(f => f.file), this.selectedCategory()).subscribe({
      next: r => {
        if (r.success && r.data) {
          this.pendingFiles.update(list =>
            list.map(f => f.status === 'uploading' ? { ...f, status: 'success' as const } : f),
          );
          this.knowledgeService.lastIngestionResult.set(r.data);
          this.notifications.success(
            `✓ ${r.data.filesProcessed} archivo(s) indexados, ${r.data.chunksIndexed} chunks creados`,
          );
          this.knowledgeService.loadStatus();
        } else {
          this.pendingFiles.update(list =>
            list.map(f => f.status === 'uploading'
              ? { ...f, status: 'error' as const, error: r.error ?? 'Error desconocido' }
              : f),
          );
          this.notifications.error(r.error ?? 'Error al indexar archivos');
        }
      },
      error: () => {
        this.pendingFiles.update(list =>
          list.map(f => f.status === 'uploading'
            ? { ...f, status: 'error' as const, error: 'Error de conexión' }
            : f),
        );
        this.notifications.error('Error al conectar con el servicio de conocimiento');
        this.knowledgeService.isIngesting.set(false);
      },
      complete: () => this.knowledgeService.isIngesting.set(false),
    });
  }

  // ── Búsqueda ──────────────────────────────────────────────────────────────
  search(): void {
    const q = this.searchQuery().trim();
    if (!q) return;
    this.knowledgeService.search(q).subscribe({
      error: () => this.notifications.error('Error al buscar en el índice'),
    });
  }

  useSuggestion(text: string): void {
    this.searchQuery.set(text);
    this.search();
  }

  // ── Colección ─────────────────────────────────────────────────────────────
  confirmDeleteCollection(): void {
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
  }

  deleteCollection(): void {
    this.knowledgeService.deleteCollection().subscribe({
      next: () => {
        this.notifications.success('Colección eliminada. El índice se ha reiniciado.');
        this.showDeleteConfirm.set(false);
        this.knowledgeService.loadStatus();
      },
      error: () => {
        this.notifications.error('Error al eliminar la colección');
        this.showDeleteConfirm.set(false);
      },
    });
  }

  // ── Helpers de presentación ───────────────────────────────────────────────
  scoreBadgeClass(score: number): string {
    if (score > 0.8) return 'high';
    if (score >= 0.6) return 'medium';
    return 'low';
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  truncate(text: string, max = 200): string {
    return text.length > max ? text.slice(0, max) + '...' : text;
  }

  fileIcon(name: string): string {
    return name.endsWith('.md') ? 'description' : 'article';
  }

  statusLabel(status: UploadedFile['status']): string {
    const map: Record<UploadedFile['status'], string> = {
      pending:   'Pendiente',
      uploading: 'Subiendo...',
      success:   '✓ Indexado',
      error:     '✗ Error',
    };
    return map[status];
  }
}
