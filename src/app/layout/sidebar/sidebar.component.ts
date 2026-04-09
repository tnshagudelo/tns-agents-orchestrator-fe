import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatListModule, MatIconModule, MatDividerModule, MatTooltipModule],
  templateUrl: './sidebar.component.html',
  styles: [`
    .sidebar {
      display: flex;
      flex-direction: column;
      width: 240px;
      height: 100%;
      background: #da6ccf;
      color: white;
      transition: width 0.3s ease;
      overflow: hidden;

      &--collapsed { width: 64px; }
    }
    .sidebar-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 64px;
      padding: 0 16px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .logo-text {
      font-weight: 700;
      font-size: 0.95rem;
      white-space: nowrap;
      color: white;
    }
    mat-nav-list {
      padding: 8px 0;
      flex: 1;
    }
    .bottom-nav { flex: 0; }
    ::ng-deep .sidebar a.mat-mdc-list-item {
      color: rgba(255,255,255,0.7);
      border-radius: 8px;
      margin: 2px 8px;
      &:hover { background: rgba(255,255,255,0.1); color: white; }
      &.active-link { background: rgba(255,255,255,0.15); color: white; }
    }
    ::ng-deep .sidebar .mat-icon { color: inherit; }
  `],
})
export class SidebarComponent {
  collapsed = input(false);

  readonly navItems: NavItem[] = [
    { label: 'Account Planning', icon: 'business_center', route: '/account-planning' },
    { label: 'Agente PM', icon: 'hub', route: '/projectmanageragent' },
    { label: 'Propuestas', icon: 'description', route: '/proposals' },
    { label: 'Conocimiento', icon: 'psychology', route: '/knowledge' },
    { label: 'Guia Claude Code', icon: 'auto_stories', route: '/claude-framework' },
  ];
}
