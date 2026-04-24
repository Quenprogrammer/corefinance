import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private role: string | null = localStorage.getItem('role');

  login(username: string, password: string): boolean {

    if (username === 'admin' && password === 'admin123') {
      this.setRole('admin');
      return true;
    }

    if (username === 'user' && password === 'user123') {
      this.setRole('user');
      return true;
    }

    if (username === 'viewer' && password === 'viewer123') {
      this.setRole('viewer');
      return true;
    }

    return false;
  }

  // Add this method to get the route based on role
  getRouteForRole(): string {
    switch(this.role) {
      case 'admin':
        return '/account-select';  // Admin goes to menu
      case 'user':
        return '/user';
      case 'viewer':
        return '/viewer';
      default:
        return '/login';
    }
  }

  private setRole(role: string) {
    this.role = role;
    localStorage.setItem('role', role);
  }

  getRole(): string | null {
    return this.role;
  }

  isLoggedIn(): boolean {
    return this.role !== null;
  }

  logout() {
    this.role = null;
    localStorage.removeItem('role');
  }
}
