import { Component, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MarkdownComponent } from 'ngx-markdown';

@Component({
  selector: 'app-confirmation-card',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatDividerModule, MarkdownComponent],
  templateUrl: './confirmation-card.component.html',
  styleUrl: './confirmation-card.component.scss',
})
export class ConfirmationCardComponent {
  /** Resumen del quick search (markdown) */
  readonly summary = input.required<string>();
  /** Nombre del cliente */
  readonly clientName = input<string>('');

  readonly confirmed = output<void>();
  readonly rejected = output<void>();
}
