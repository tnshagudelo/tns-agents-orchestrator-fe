import { Component, computed, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/auth/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  moduleKey: string;
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
  private readonly authService = inject(AuthService);
  collapsed = input(false);

  private readonly allNavItems: NavItem[] = [
    { label: 'Inicio', icon: 'home', route: '/home', moduleKey: 'home' },
    { label: 'Account Planning', icon: 'business_center', route: '/account-planning', moduleKey: 'account-planning' },
    { label: 'Agente PM', icon: 'hub', route: '/projectmanageragent', moduleKey: 'projectmanageragent' },
    { label: 'Propuestas', icon: 'description', route: '/proposals', moduleKey: 'proposals' },
    { label: 'Conocimiento', icon: 'psychology', route: '/knowledge', moduleKey: 'knowledge' },
    { label: 'Como trabajamos', icon: 'handshake', route: '/how-we-work', moduleKey: 'how-we-work' },
    { label: 'Metodologia Dev', icon: 'auto_stories', route: '/dev-methodology', moduleKey: 'dev-methodology' },
  ];

  private readonly bottomItems: NavItem[] = [
    { label: 'Configuracion', icon: 'settings', route: '/settings', moduleKey: 'settings' },
    { label: 'Seguridad', icon: 'shield', route: '/security', moduleKey: 'security' },
  ];

  readonly navItems = computed(() => {
    const modules = this.authService.currentUser()?.modules;
    if (!modules || modules.length === 0) return this.allNavItems;
    return this.allNavItems.filter(item => modules.includes(item.moduleKey));
  });

  readonly bottomNavItems = computed(() => {
    const modules = this.authService.currentUser()?.modules;
    if (!modules || modules.length === 0) return [];
    return this.bottomItems.filter(item => modules.includes(item.moduleKey));
  });
}
