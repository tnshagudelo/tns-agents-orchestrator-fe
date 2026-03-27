import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatCardModule } from '@angular/material/card';
import { AgentService } from '../../services/agent.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-agent-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSliderModule,
    MatCardModule,
  ],
  templateUrl: './agent-create.component.html',
  styles: [`
    .page-container { padding: 24px; }
    .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 1.75rem; }
    .form-card { max-width: 800px; }
    .form-row { display: flex; gap: 16px; flex-wrap: wrap; }
    .form-row mat-form-field { flex: 1; min-width: 200px; }
    .full-width { width: 100%; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px; }
    h3 { margin: 16px 0 8px; }
  `],
})
export class AgentCreateComponent {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  protected readonly agentService = inject(AgentService);
  private readonly notifications = inject(NotificationService);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    type: ['llm', Validators.required],
    description: ['', Validators.required],
    model: [''],
    config: this.fb.group({
      systemPrompt: [''],
      maxTokens: [2048],
      temperature: [0.7],
    }),
  });

  back(): void {
    this.router.navigate(['/agents']);
  }

  submit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    this.agentService
      .createAgent({
        name: value.name!,
        type: value.type as 'llm',
        description: value.description!,
        model: value.model ?? undefined,
        config: {
          systemPrompt: value.config.systemPrompt ?? undefined,
          maxTokens: value.config.maxTokens ?? undefined,
          temperature: value.config.temperature ?? undefined,
        },
      })
      .subscribe({
        next: agent => {
          this.notifications.success('Agent created successfully');
          this.router.navigate(['/agents', agent.id]);
        },
        error: () => this.notifications.error('Failed to create agent'),
      });
  }
}
