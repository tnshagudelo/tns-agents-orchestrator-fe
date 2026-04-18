import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { SecurityService, SecurityGroup, ModuleInfo } from '../../services/security.service';

@Component({
  selector: 'app-groups-page',
  standalone: true,
  imports: [
    FormsModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatChipsModule, MatSlideToggleModule,
    MatCheckboxModule, MatDividerModule,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h2>Grupos de seguridad</h2>
          <p class="subtitle">Administra los grupos y sus permisos de acceso a modulos.</p>
        </div>
        <a mat-stroked-button routerLink="../users"><mat-icon>people</mat-icon> Usuarios</a>
      </div>

      <!-- Create group form -->
      <mat-card class="form-card">
        <h3>Nuevo grupo</h3>
        <div class="form-row">
          <mat-form-field appearance="outline" class="field-name">
            <mat-label>Nombre</mat-label>
            <input matInput [(ngModel)]="newName" placeholder="Ej: Comercial" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="field-desc">
            <mat-label>Descripcion</mat-label>
            <input matInput [(ngModel)]="newDesc" placeholder="Descripcion del grupo" />
          </mat-form-field>
        </div>
        <div class="modules-select">
          <span class="modules-label">Modulos:</span>
          @for (m of availableModules(); track m.key) {
            <label class="module-check">
              <mat-checkbox [checked]="newModules.has(m.key)" (change)="toggleNewModule(m.key)">
                {{ m.label }}
              </mat-checkbox>
            </label>
          }
        </div>
        <button mat-raised-button color="primary" (click)="createGroup()" [disabled]="!newName.trim()">
          <mat-icon>add</mat-icon> Crear grupo
        </button>
      </mat-card>

      <!-- Groups list -->
      @for (g of groups(); track g.id) {
        <mat-card class="group-card" [class.inactive]="!g.isActive">
          @if (editingId() === g.id) {
            <!-- Edit mode -->
            <div class="group-edit">
              <div class="form-row">
                <mat-form-field appearance="outline" class="field-name">
                  <mat-label>Nombre</mat-label>
                  <input matInput [(ngModel)]="editName" />
                </mat-form-field>
                <mat-form-field appearance="outline" class="field-desc">
                  <mat-label>Descripcion</mat-label>
                  <input matInput [(ngModel)]="editDesc" />
                </mat-form-field>
                <mat-slide-toggle [(ngModel)]="editActive">Activo</mat-slide-toggle>
              </div>
              <div class="modules-select">
                <span class="modules-label">Modulos:</span>
                @for (m of availableModules(); track m.key) {
                  <label class="module-check">
                    <mat-checkbox [checked]="editModules.has(m.key)" (change)="toggleEditModule(m.key)">
                      {{ m.label }}
                    </mat-checkbox>
                  </label>
                }
              </div>
              <div class="edit-actions">
                <button mat-raised-button color="primary" (click)="saveEdit(g)">
                  <mat-icon>save</mat-icon> Guardar
                </button>
                <button mat-stroked-button (click)="cancelEdit()">Cancelar</button>
              </div>
            </div>
          } @else {
            <!-- View mode -->
            <div class="group-header">
              <div class="group-info">
                <strong>{{ g.name }}</strong>
                @if (!g.isActive) { <span class="badge badge--inactive">Inactivo</span> }
                @if (g.description) { <span class="group-desc">{{ g.description }}</span> }
              </div>
              <div class="group-actions">
                <button mat-icon-button (click)="startEdit(g)"><mat-icon>edit</mat-icon></button>
                <button mat-icon-button color="warn" (click)="deleteGroup(g.id)"><mat-icon>delete_outline</mat-icon></button>
              </div>
            </div>
            <div class="group-modules">
              @for (key of g.modules; track key) {
                <span class="module-chip">
                  <mat-icon>{{ getModuleIcon(key) }}</mat-icon> {{ getModuleLabel(key) }}
                </span>
              }
              @if (g.modules.length === 0) {
                <span class="no-modules">Sin modulos asignados</span>
              }
            </div>
          }
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .page { padding: 32px; max-width: 900px; margin: 0 auto; }
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;
      h2 { margin: 0 0 4px; font-size: 22px; font-weight: 600; color: #1a1a2e; }
      .subtitle { margin: 0; font-size: 13px; color: #888; }
    }
    .form-card, .group-card {
      border-radius: 12px !important;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06) !important;
      padding: 20px !important; margin-bottom: 12px;
    }
    .form-card h3 { margin: 0 0 16px; font-size: 15px; font-weight: 600; color: #555; }
    .form-row {
      display: flex; gap: 10px; align-items: flex-start; margin-bottom: 12px;
      .field-name { flex: 0 0 200px; }
      .field-desc { flex: 1; }
      ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }
    }
    .modules-select {
      display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 16px;
    }
    .modules-label { font-size: 13px; font-weight: 600; color: #555; margin-right: 4px; }
    .module-check { font-size: 13px; }
    .group-card { &.inactive { opacity: 0.5; } }
    .group-header {
      display: flex; justify-content: space-between; align-items: center;
      strong { font-size: 15px; color: #1a1a2e; }
      .group-desc { display: block; font-size: 12px; color: #888; margin-top: 2px; }
    }
    .group-info { display: flex; flex-direction: column; gap: 2px; }
    .group-actions { display: flex; gap: 2px; }
    .badge {
      display: inline-block; padding: 2px 8px; border-radius: 8px; font-size: 11px; font-weight: 500;
      &--inactive { background: #fef2f2; color: #dc2626; }
    }
    .group-modules {
      display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px;
    }
    .module-chip {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 4px 10px; border-radius: 8px;
      background: #f3e8ff; color: #7c3aed;
      font-size: 12px; font-weight: 500;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
    }
    .no-modules { font-size: 12px; color: #ccc; font-style: italic; }
    .edit-actions { display: flex; gap: 8px; margin-top: 8px; }
    .group-edit { display: flex; flex-direction: column; }
  `],
})
export class GroupsPageComponent implements OnInit {
  private readonly securityService = inject(SecurityService);

  readonly groups = this.securityService.groups;
  readonly availableModules = this.securityService.modules;

  newName = '';
  newDesc = '';
  newModules = new Set<string>(['home']);

  editingId = signal<string | null>(null);
  editName = '';
  editDesc = '';
  editActive = true;
  editModules = new Set<string>();

  ngOnInit(): void {
    this.securityService.loadGroups().subscribe();
    this.securityService.loadModules().subscribe();
  }

  toggleNewModule(key: string): void {
    this.newModules.has(key) ? this.newModules.delete(key) : this.newModules.add(key);
  }

  createGroup(): void {
    if (!this.newName.trim()) return;
    this.securityService.createGroup({
      name: this.newName.trim(),
      description: this.newDesc.trim() || undefined,
      modules: [...this.newModules],
    }).subscribe(() => {
      this.newName = '';
      this.newDesc = '';
      this.newModules = new Set(['home']);
    });
  }

  startEdit(g: SecurityGroup): void {
    this.editingId.set(g.id);
    this.editName = g.name;
    this.editDesc = g.description ?? '';
    this.editActive = g.isActive;
    this.editModules = new Set(g.modules);
  }

  toggleEditModule(key: string): void {
    this.editModules.has(key) ? this.editModules.delete(key) : this.editModules.add(key);
  }

  saveEdit(g: SecurityGroup): void {
    this.securityService.updateGroup(g.id, {
      name: this.editName.trim(),
      description: this.editDesc.trim() || undefined,
      isActive: this.editActive,
      modules: [...this.editModules],
    }).subscribe(() => this.editingId.set(null));
  }

  cancelEdit(): void { this.editingId.set(null); }

  deleteGroup(id: string): void {
    this.securityService.deleteGroup(id).subscribe();
  }

  getModuleLabel(key: string): string {
    return this.availableModules().find(m => m.key === key)?.label ?? key;
  }

  getModuleIcon(key: string): string {
    return this.availableModules().find(m => m.key === key)?.icon ?? 'extension';
  }
}
