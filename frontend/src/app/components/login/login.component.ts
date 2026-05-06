import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <h2>Welcome Back</h2>
          <p>Please enter your details to sign in.</p>
        </div>

        <form (ngSubmit)="onLogin()" #loginForm="ngForm">
          <div class="form-field">
            <label>Username</label>
            <input 
              type="text" 
              name="username" 
              [(ngModel)]="credentials.username" 
              placeholder="Enter your username"
              required>
          </div>

          <div class="form-field">
            <label>Password</label>
            <input 
              type="password" 
              name="password" 
              [(ngModel)]="credentials.password" 
              placeholder="••••••••"
              required>
          </div>

          <div class="error-box" *ngIf="error">
            {{ error }}
          </div>

          <button type="submit" class="btn-auth" [disabled]="loading || !loginForm.valid">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="auth-footer">
          <p>Don't have an account? <a routerLink="/register">Create one now</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      background: #f8fafc;
    }
    .auth-card {
      width: 100%;
      max-width: 440px;
      padding: 3rem;
      background: #ffffff;
      border-radius: 1.5rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      border: 1px solid #f1f5f9;
    }
    .auth-header { text-align: center; margin-bottom: 2.5rem; }
    .auth-header h2 { font-size: 1.875rem; font-weight: 800; color: #1e293b; margin-bottom: 0.5rem; letter-spacing: -0.025em; }
    .auth-header p { color: #64748b; font-size: 0.95rem; }
    
    .form-field { margin-bottom: 1.5rem; }
    .form-field label { display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 600; color: #334155; }
    .form-field input { 
      width: 100%; 
      padding: 0.8rem 1rem; 
      border-radius: 0.75rem; 
      border: 1px solid #e2e8f0; 
      font-size: 1rem;
      transition: all 0.2s;
    }
    .form-field input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
    
    .error-box { background: #fef2f2; color: #dc2626; padding: 0.75rem; border-radius: 0.5rem; font-size: 0.85rem; margin-bottom: 1.5rem; text-align: center; }
    
    .btn-auth { 
      width: 100%; 
      padding: 0.8rem; 
      background: #6366f1; 
      color: white; 
      border: none; 
      border-radius: 0.75rem; 
      font-weight: 700; 
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-auth:hover { background: #4f46e5; }
    .btn-auth:disabled { opacity: 0.6; cursor: not-allowed; }
    
    .auth-footer { text-align: center; margin-top: 2rem; color: #64748b; font-size: 0.9rem; }
    .auth-footer a { color: #6366f1; font-weight: 700; text-decoration: none; }
    .auth-footer a:hover { text-decoration: underline; }
  `]
})
export class LoginComponent {
  credentials = { username: '', password: '' };
  loading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.loading = true;
    this.error = '';
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        if (response.user.role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Invalid credentials';
        this.loading = false;
      }
    });
  }
}
