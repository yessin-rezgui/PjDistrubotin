import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="app-header" *ngIf="!isAdminPage">
      <nav class="nav-container">
        <a routerLink="/" class="logo">StellarTickets</a>
        
        <div class="nav-links">
          <a routerLink="/events" routerLinkActive="active">Events</a>
          <a *ngIf="authService.isLoggedIn()" routerLink="/scanner" routerLinkActive="active">Scanner</a>
          <a *ngIf="authService.isAdmin()" routerLink="/admin" routerLinkActive="active">Admin</a>
        </div>

        <div class="auth-group">
          <ng-container *ngIf="authService.currentUser$ | async as user; else guest">
            <span class="user-name">Hello, {{ user.username }}</span>
            <button class="btn-logout" (click)="authService.logout()">Logout</button>
          </ng-container>
          <ng-template #guest>
            <a routerLink="/login" class="link-login">Login</a>
            <a routerLink="/register" class="btn-register">Sign Up</a>
          </ng-template>
        </div>
      </nav>
    </header>
    
    <main class="page-content" [class.admin-mode]="isAdminPage">
      <router-outlet></router-outlet>
    </main>

    <footer class="app-footer" *ngIf="!isAdminPage">
      <p>&copy; 2026 StellarTickets. All rights reserved.</p>
    </footer>
  `,
  styles: [`
    .app-header { background: #fff; border-bottom: 1px solid #eee; padding: 1rem 0; position: sticky; top: 0; z-index: 100; }
    .nav-container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; display: flex; justify-content: space-between; align-items: center; }
    .logo { font-size: 1.5rem; font-weight: 800; color: #6366f1; text-decoration: none; letter-spacing: -1px; }
    
    .nav-links { display: flex; gap: 2rem; }
    .nav-links a { text-decoration: none; color: #64748b; font-weight: 600; transition: color 0.2s; }
    .nav-links a:hover, .nav-links a.active { color: #6366f1; }
    
    .auth-group { display: flex; align-items: center; gap: 1.5rem; }
    .user-name { font-size: 0.9rem; color: #475569; font-weight: 500; }
    .btn-logout { background: none; border: 1px solid #e2e8f0; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; color: #64748b; }
    
    .link-login { text-decoration: none; color: #64748b; font-weight: 600; }
    .btn-register { background: #6366f1; color: white; text-decoration: none; padding: 0.6rem 1.2rem; border-radius: 0.6rem; font-weight: 600; }
    
    .page-content { min-height: calc(100vh - 160px); }
    .page-content.admin-mode { min-height: 100vh; }
    .app-footer { text-align: center; padding: 3rem; color: #94a3b8; font-size: 0.9rem; border-top: 1px solid #eee; }
  `]
})
export class AppComponent {
  isAdminPage = false;

  constructor(public authService: AuthService, private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isAdminPage = event.url.startsWith('/admin');
    });
  }
}
