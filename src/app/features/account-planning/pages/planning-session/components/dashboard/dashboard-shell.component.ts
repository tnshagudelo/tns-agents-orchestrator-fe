import { Component, input, output, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MarkdownComponent } from 'ngx-markdown';
import { Client, ResearchResult } from '../../../../models/account-planning.model';

interface DashboardSection {
  id: string;
  title: string;
  icon: string;
  expanded: boolean;
  content: string;
  preview: string;
}

@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [
    DatePipe, MatExpansionModule, MatIconModule, MatButtonModule,
    MatTooltipModule, MatDividerModule, MarkdownComponent,
  ],
  templateUrl: './dashboard-shell.component.html',
  styleUrl: './dashboard-shell.component.scss',
})
export class DashboardShellComponent {
  readonly client = input.required<Client>();
  readonly results = input.required<ResearchResult[]>();
  readonly sessionDate = input<Date | null>(null);

  readonly defineFocus = output<void>();

  readonly sections = computed<DashboardSection[]>(() => {
    const results = this.results();
    const deepResearch = results.find(r => r.category === 'deep-research');
    const analysis = results.find(r => r.category === 'analysis');

    return [
      {
        id: 'company',
        title: 'Ficha de empresa',
        icon: 'business',
        expanded: true,
        content: this.buildCompanyCard(),
        preview: this.client().industry + ' — ' + this.client().country,
      },
      {
        id: 'research',
        title: 'Investigación profunda',
        icon: 'travel_explore',
        expanded: true,
        content: deepResearch?.snippet ?? '_Sin resultados de investigación._',
        preview: deepResearch ? `${Math.round(deepResearch.snippet.length / 100)} párrafos` : 'Sin datos',
      },
      {
        id: 'analysis',
        title: 'Análisis estratégico',
        icon: 'analytics',
        expanded: true,
        content: analysis?.snippet ?? '_Sin análisis disponible._',
        preview: analysis ? 'Análisis generado' : 'Sin datos',
      },
    ];
  });

  readonly activeSectionId = signal<string | null>(null);

  scrollTo(sectionId: string): void {
    this.activeSectionId.set(sectionId);
    const el = document.getElementById('section-' + sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  copySection(content: string): void {
    navigator.clipboard.writeText(content).then(() => {
      // TODO: toast notification
    });
  }

  private buildCompanyCard(): string {
    const c = this.client();
    let md = `## ${c.name}\n\n`;
    md += `| Dato | Valor |\n|------|-------|\n`;
    md += `| **Sector** | ${c.industry} |\n`;
    md += `| **País** | ${c.country} |\n`;
    if (c.website) md += `| **Sitio web** | [${c.website}](${c.website}) |\n`;
    if (c.linkedInUrl) md += `| **LinkedIn** | [Ver perfil](${c.linkedInUrl}) |\n`;
    if (c.description) md += `\n${c.description}\n`;
    return md;
  }
}
