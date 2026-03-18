import { Component } from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../services/guard/auth/auth';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';

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
    // ✅ AUTO LOGIN AFTER REFRESH
    if (this.auth.isLoggedIn()) {
      const role = this.auth.getRole();
      this.router.navigate([`/${role}`]);
    }
  }

  login() {
    const success = this.auth.login(this.username, this.password);

    if (!success) {
      this.error = 'Invalid login';
      return;
    }

    const role = this.auth.getRole();
    this.router.navigate([`/${role}`]);
  }
}
