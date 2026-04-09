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
    { label: 'Panel', icon: 'dashboard', route: '/dashboard' },
    { label: 'Agentes', icon: 'smart_toy', route: '/agents' },
    { label: 'Orquestación', icon: 'account_tree', route: '/orchestration' },
    { label: 'Monitoreo', icon: 'monitor_heart', route: '/monitoring' },
    { label: 'Agente PM', icon: 'hub', route: '/projectmanageragent' },
    { label: 'Propuestas', icon: 'description', route: '/proposals' },
    { label: 'Sesiones', icon: 'history', route: '/sessions' },
    { label: 'Conocimiento', icon: 'psychology', route: '/knowledge' },
    { label: 'Framework CC', icon: 'terminal', route: '/claude-framework' },
  ];
}
