import { Routes } from '@angular/router';

export const routes: Routes = [
  {path: 'admin', loadComponent: () => import('./admin/admin').then(_ => _.Admin)},
  {path: 'user', loadComponent: () => import('../app/user/user').then(_ => _.User)},
  {path: 'viewer', loadComponent: () => import('../app/viewer/viewer').then(_ => _.Viewer)},
  {path: '', loadComponent: () => import('../app/viewer/viewer').then(_ => _.Viewer)},

];
