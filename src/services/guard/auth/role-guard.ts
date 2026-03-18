import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {

    const expectedRole = route.data['role'];
    const currentRole = this.auth.getRole();

    // Not logged in
    if (!currentRole) {
      this.router.navigate(['/']);
      return false;
    }

    // Wrong role
    if (currentRole !== expectedRole) {
      this.router.navigate([`/${currentRole}`]);
      return false;
    }

    return true;
  }
}
