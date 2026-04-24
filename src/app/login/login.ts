import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/guard/auth/auth';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    NgIf
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  username = '';
  password = '';
  error = '';

  constructor(
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.redirectBasedOnRole();
    }
  }

  login() {
    const success = this.auth.login(this.username, this.password);

    if (!success) {
      this.error = 'Invalid login';
      return;
    }

    this.redirectBasedOnRole();
  }

  // Add this method to handle role-based redirection
  private redirectBasedOnRole() {
    const role = this.auth.getRole();

    switch(role) {
      case 'admin':
        this.router.navigate(['/account-select']);  // Admin goes to menu
        break;
      case 'user':
        this.router.navigate(['/user']);
        break;
      case 'viewer':
        this.router.navigate(['/viewer']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }
}
