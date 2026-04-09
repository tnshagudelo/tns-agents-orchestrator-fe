import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { AgentService } from '../../services/agent.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AgentCardComponent } from '../../components/agent-card/agent-card.component';
import { Agent, AgentStatus } from '../../../../shared/models';

@Component({
  selector: 'app-agent-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    AgentCardComponent,
  ],
  templateUrl: './agent-list.component.html',
  styles: [`
    .page-container { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 1.75rem; font-weight: 600; }
    .filters { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
    .filters mat-form-field { min-width: 200px; }
    .agents-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
    .empty-state { text-align: center; padding: 64px; color: rgba(0,0,0,0.4); }
    .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; }
    .loading-state { text-align: center; padding: 64px; }
  `],
})
export class AgentListComponent implements OnInit {
  protected readonly agentService = inject(AgentService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);

  searchTerm = '';
  statusFilter = '';

  get filteredAgents(): Agent[] {
    return this.agentService.agents().filter(agent => {
      const matchesSearch =
        !this.searchTerm ||
        agent.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        agent.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus =
        !this.statusFilter || agent.status === (this.statusFilter as AgentStatus);
      return matchesSearch && matchesStatus;
    });
  }

  ngOnInit(): void {
    this.agentService.loadAgents().subscribe({
      error: () => this.notifications.error('Failed to load agents'),
    });
  }

  createAgent(): void {
    this.router.navigate(['/agents/create']);
  }

  viewAgent(agent: Agent): void {
    this.router.navigate(['/agents', agent.id]);
  }

  editAgent(agent: Agent): void {
    this.router.navigate(['/agents', agent.id, 'edit']);
  }

  startAgent(id: string): void {
    this.agentService.startAgent(id).subscribe({
      next: () => this.notifications.success('Agent started'),
      error: () => this.notifications.error('Failed to start agent'),
    });
  }

  stopAgent(id: string): void {
    this.agentService.stopAgent(id).subscribe({
      next: () => this.notifications.success('Agent stopped'),
      error: () => this.notifications.error('Failed to stop agent'),
    });
  }

  deleteAgent(id: string): void {
    this.agentService.deleteAgent(id).subscribe({
      next: () => this.notifications.success('Agent deleted'),
      error: () => this.notifications.error('Failed to delete agent'),
    });
  }
}
