import { Routes } from '@angular/router';
import { LandingPageComponent } from './components/landing/landing.component';
import { ConcertListComponent } from './components/concert-list.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AdminDashboardComponent } from './components/adminspace/admin-dashboard.component';
import { ScannerComponent } from './components/scanner/scanner.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'events', component: ConcertListComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'scanner', component: ScannerComponent },
  { 
    path: 'admin', 
    component: AdminDashboardComponent, 
    canActivate: [AuthGuard], 
    data: { role: 'ADMIN' } 
  },
  { path: '**', redirectTo: '' }
];
