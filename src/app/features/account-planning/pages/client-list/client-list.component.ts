import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ClientService } from '../../services/client.service';
import { PlanningSessionService } from '../../services/planning-session.service';
import { Client } from '../../models/account-planning.model';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [
    DatePipe, MatCardModule, MatButtonModule, MatIconModule, MatTableModule,
    MatMenuModule, MatProgressSpinnerModule,
  ],
  templateUrl: './client-list.component.html',
})
export class ClientListComponent implements OnInit {
  private readonly clientService = inject(ClientService);
  private readonly sessionService = inject(PlanningSessionService);
  private readonly router = inject(Router);

  readonly clients = this.clientService.clients;
  readonly isLoading = this.clientService.isLoading;

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
    if (confirm(`¿Eliminar el cliente "${client.name}"?`)) {
      this.clientService.remove(client.id).subscribe();
    }
  }
}
