import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  template: `
    <div class="callback-container">
      <p>Iniciando sesión...</p>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      color: white;
      font-family: sans-serif;
      background: linear-gradient(160deg, #0d0d1a 0%, #1a1a2e 40%, #16213e 70%, #0f3460 100%);
    }
  `],
})
export class AuthCallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.authService.loginWithToken(token);
      this.router.navigate(['/account-planning']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }
}
