import { Component, input, output, computed } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { Client } from '../../../../models/account-planning.model';
import { RelativeTimePipe } from '../../../../../../shared/pipes/relative-time.pipe';

const AVATAR_COLORS = [
  '#4f46e5', '#7c3aed', '#db2777', '#ea580c',
  '#0891b2', '#059669', '#d97706', '#6366f1',
];

@Component({
  selector: 'app-client-sidebar',
  standalone: true,
  imports: [
    MatCardModule, MatIconModule, MatButtonModule,
    MatTooltipModule, MatDividerModule, RelativeTimePipe,
  ],
  templateUrl: './client-sidebar.component.html',
  styleUrl: './client-sidebar.component.scss',
})
export class ClientSidebarComponent {
  readonly client = input.required<Client>();
  readonly lastInvestigationDate = input<Date | null>(null);

  readonly viewPreviousResults = output<void>();

  showFullDescription = false;

  readonly avatarColor = computed(() => {
    const name = this.client().name;
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  });

  readonly initial = computed(() => this.client().name.charAt(0).toUpperCase());

  readonly hasInvestigation = computed(() => this.lastInvestigationDate() !== null);

  readonly truncatedDescription = computed(() => {
    const desc = this.client().description;
    if (!desc || desc.length <= 120) return desc ?? '';
    return desc.substring(0, 120) + '...';
  });

  readonly needsTruncation = computed(() => {
    const desc = this.client().description;
    return !!desc && desc.length > 120;
  });

  toggleDescription(): void {
    this.showFullDescription = !this.showFullDescription;
  }
}
