import { Routes } from '@angular/router';
import { RoleGuard } from '../services/guard/auth/role-guard';
import {AuthGuard} from '@angular/fire/auth-guard';

export const routes: Routes = [

  {
    path: 'admin',
    loadComponent: () => import('./admin/admin').then(m => m.Admin),
    canActivate: [RoleGuard],
    data: { role: 'admin' }
  },

  {
    path: 'user',
    loadComponent: () => import('./user/user').then(m => m.User),
    canActivate: [RoleGuard],
    data: { role: 'user' }
  },

  {
    path: 'viewer',
    loadComponent: () => import('./viewer/viewer').then(m => m.Viewer),
    canActivate: [RoleGuard],
    data: { role: 'viewer' }
  },

  // 👇 default route (login page recommended)
  {
    path: '',
    loadComponent: () => import('./login/login').then(m => m.Login)
  },

  // 👇 optional: wildcard (redirect unknown routes)

  {
    path: '',
    loadComponent: () => import('./login/login').then(m => m.Login),
    canActivate: [AuthGuard]
  },

  {
    path: '**',
    redirectTo: ''
  }

];
