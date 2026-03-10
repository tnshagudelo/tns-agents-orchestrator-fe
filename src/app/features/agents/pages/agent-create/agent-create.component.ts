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
  template: `
    <div class="page-container">
      <div class="page-header">
        <button mat-icon-button (click)="back()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Create Agent</h1>
      </div>

      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Name</mat-label>
                <input matInput formControlName="name" placeholder="Agent name" />
                @if (form.get('name')?.hasError('required')) {
                  <mat-error>Name is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Type</mat-label>
                <mat-select formControlName="type">
                  <mat-option value="llm">LLM</mat-option>
                  <mat-option value="tool">Tool</mat-option>
                  <mat-option value="orchestrator">Orchestrator</mat-option>
                  <mat-option value="retriever">Retriever</mat-option>
                  <mat-option value="custom">Custom</mat-option>
                </mat-select>
                @if (form.get('type')?.hasError('required')) {
                  <mat-error>Type is required</mat-error>
                }
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3" placeholder="Describe the agent's purpose"></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Model</mat-label>
              <input matInput formControlName="model" placeholder="e.g. gpt-4o, claude-3-opus" />
            </mat-form-field>

            <div formGroupName="config">
              <h3>Configuration</h3>
              <mat-form-field appearance="outline">
                <mat-label>System Prompt</mat-label>
                <textarea matInput formControlName="systemPrompt" rows="4" placeholder="System prompt for the agent"></textarea>
              </mat-form-field>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Max Tokens</mat-label>
                  <input matInput type="number" formControlName="maxTokens" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Temperature (0–2)</mat-label>
                  <input matInput type="number" step="0.1" min="0" max="2" formControlName="temperature" />
                </mat-form-field>
              </div>
            </div>

            <div class="form-actions">
              <button mat-stroked-button type="button" (click)="back()">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
                Create Agent
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
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
