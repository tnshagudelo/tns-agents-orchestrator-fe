import { Component, OnInit, Pipe, PipeTransform, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { ClientService } from '../../services/client.service';
import { PlanningSessionService } from '../../services/planning-session.service';
import { Client } from '../../models/account-planning.model';
import { RelativeTimePipe } from '../../../../shared/pipes/relative-time.pipe';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Pipe({ name: 'stripProtocol', standalone: true })
export class StripProtocolPipe implements PipeTransform {
  transform(url: string): string {
    return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  }
}

const AVATAR_COLORS = [
  '#4f46e5', '#7c3aed', '#db2777', '#ea580c',
  '#0891b2', '#059669', '#d97706', '#6366f1',
  '#2563eb', '#9333ea', '#c026d3', '#e11d48',
];

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [
    FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule,
    MatMenuModule, MatProgressSpinnerModule, MatFormFieldModule, MatInputModule,
    MatTooltipModule, RelativeTimePipe, StripProtocolPipe,
  ],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.scss',
})
export class ClientListComponent implements OnInit {
  private readonly clientService = inject(ClientService);
  private readonly sessionService = inject(PlanningSessionService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly clients = this.clientService.clients;
  readonly isLoading = this.clientService.isLoading;
  readonly searchTerm = signal('');

  readonly filteredClients = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.clients();
    return this.clients().filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.industry.toLowerCase().includes(term) ||
      c.country.toLowerCase().includes(term)
    );
  });

  readonly displayedColumns = ['name', 'industry', 'country', 'updatedAt', 'actions'];

  ngOnInit(): void {
    this.clientService.loadAll().subscribe();
  }

  createClient(): void {
    this.router.navigate(['/account-planning/clients/new']);
  }

  editClient(client: Client): void {
    this.router.navigate(['/account-planning/clients', client.id, 'edit']);
  }

  startPlanning(client: Client): void {
    this.sessionService.create(client.id).subscribe(session => {
      this.router.navigate(['/account-planning/sessions', session.id]);
    });
  }

  deleteClient(client: Client): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar cliente',
        message: `¿Estás seguro de que deseas eliminar "${client.name}"? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        color: 'warn',
        icon: 'warning',
      },
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.clientService.remove(client.id).subscribe();
      }
    });
  }

  getAvatarColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  }
}
