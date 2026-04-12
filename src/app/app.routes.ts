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
    path: 'add-transactions',
    loadComponent: () => import('./admin/cashbook-entry-form/cashbook-entry-form').then(m => m.CashbookEntryFormComponent),
    canActivate: [RoleGuard],
    data: { role: 'admin' }
  },
  {
    path: 'transactions',
    loadComponent: () => import('./menu/transactions').then(m => m.Transactions),
    canActivate: [RoleGuard],
    data: { role: 'admin' }
  },
  {
    path: 'exportData',
    loadComponent: () => import('./menu/export-excel').then(m => m.ExportExcel),
    canActivate: [RoleGuard],
    data: { role: 'admin' }
  },
  {
    path: 'payments-categories',
    loadComponent: () => import('./menu/payment-categories').then(m => m.PaymentCategories),
    canActivate: [RoleGuard],
    data: { role: 'admin' }
  },
  {
    path: 'receipts-categories',
    loadComponent: () => import('./menu/receipt-categories').then(m => m.ReceiptCategories),
    canActivate: [RoleGuard],
    data: { role: 'admin' }
  },
  {
    path: 'category-analysis',
    loadComponent: () => import('./menu/categories').then(m => m.Categories),
    canActivate: [RoleGuard],
    data: { role: 'admin' }
  },
  {
    path: 'category-Transactions-Details',
    loadComponent: () => import('./admin/category-transactions-detail/category-transactions-detail').then(m => m.CategoryTransactionsDetailComponent),
    canActivate: [RoleGuard],
    data: { role: 'admin' }
  },
  {
    path: 'ledger',
    loadComponent: () => import('./menu/categories').then(m => m.Categories),
    canActivate: [RoleGuard],
    data: { role: 'admin' }
  },
  {
    path: 'ledger2',
    loadComponent: () => import('./menu/ledger2').then(m => m.Ledger2),
    canActivate: [RoleGuard],
    data: { role: 'admin' }
  },

  {
    path: 'admin',
    loadComponent: () => import('./admin/admin').then(m => m.Admin),
    canActivate: [RoleGuard],
    data: { role: 'admin' }
  },
  {
    path: 'complain',
    loadComponent: () => import('./menu/system-complaint-form').then(m => m.SystemComplaintFormComponent),
    canActivate: [RoleGuard],
    data: { role: 'admin' }
  },
  {
    path: 'monthly-transactions-details',
    loadComponent: () => import('./menu/monthly-analysis').then(m => m.MonthlyAnalysis),
    canActivate: [RoleGuard],
    data: { role: 'admin' }
  },






  {
    path: 'menu',
    loadComponent: () => import('./menu/menu').then(m => m.Menu),
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


  // 👇 optional: wildcard (redirect unknown routes)

/*  {
    path: '',
    loadComponent: () => import('./login/login').then(m => m.Login),
    canActivate: [AuthGuard]
  },*/
  {
    path: '',
    loadComponent: () => import('./login/login').then(m => m.Login),

  },

  {
    path: '**',
    redirectTo: ''
  }

];
