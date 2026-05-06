import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private authService: AuthService
    ) { }

    canActivate(route: ActivatedRouteSnapshot) {
        if (this.authService.isLoggedIn()) {
            // Check if route is restricted by role
            const expectedRole = route.data['role'];
            if (expectedRole && !this.authService.isAdmin()) {
                this.router.navigate(['/']);
                return false;
            }
            return true;
        }

        // Not logged in so redirect to login page
        this.router.navigate(['/login']);
        return false;
    }
}
