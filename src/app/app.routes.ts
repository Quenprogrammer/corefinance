import { Routes } from '@angular/router';
import { RoleGuard } from '../services/guard/auth/role-guard';
import {AuthGuard} from '@angular/fire/auth-guard';

export const routes: Routes = [

  {
    path: 'account-select',
    loadComponent: () => import('../account-select/account-select').then(m => m.AccountSelect),
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
    path: 'deleteAllDATA',
    loadComponent: () => import('./menu/delete-all-optimized/delete-all-optimized').then(m => m.DeleteAllOptimizedComponent),
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

  {path: 'edashboard', loadComponent: () => import('../cashbookAccounts/ExpenseAccounts/edashboard/edashboard').then(m => m.Edashboard), canActivate: [RoleGuard], data: { role: 'admin' }},
  {path: 'eAddTRANSACTION', loadComponent: () => import('../cashbookAccounts/ExpenseAccounts/eaddtransactions/eaddtransactions').then(m => m.Eaddtransactions), canActivate: [RoleGuard], data: { role: 'admin' }},
  {path: 'eTRANSACTIONs', loadComponent: () => import('../cashbookAccounts/ExpenseAccounts/etransactions/etransactions').then(m => m.Etransactions), canActivate: [RoleGuard], data: { role: 'admin' }},
  {path: 'eMonthlyAnalysis', loadComponent: () => import('../cashbookAccounts/ExpenseAccounts/emonthlyanalysis/emonthlyanalysis').then(m => m.Emonthlyanalysis), canActivate: [RoleGuard], data: { role: 'admin' }},
  {path: 'ePayment-Transactions', loadComponent: () => import('../cashbookAccounts/ExpenseAccounts/epaymentcategories/epaymentcategories').then(m => m.Epaymentcategories), canActivate: [RoleGuard], data: { role: 'admin' }},
  {path: 'eReceipt-Transactions', loadComponent: () => import('../cashbookAccounts/ExpenseAccounts/ereciept-categories/ereciept-categories').then(m => m.ErecieptCategories), canActivate: [RoleGuard], data: { role: 'admin' }},
  {path: 'eExportData', loadComponent: () => import('../cashbookAccounts/ExpenseAccounts/eexportdata/eexportdata').then(m => m.Eexportdata), canActivate: [RoleGuard], data: { role: 'admin' }},
  {path: 'eReceiptTransactions', loadComponent: () => import('../cashbookAccounts/ExpenseAccounts/eexportdata/eexportdata').then(m => m.Eexportdata), canActivate: [RoleGuard], data: { role: 'admin' }},
  {path: 'erecieptLedger', loadComponent: () => import('../cashbookAccounts/ExpenseAccounts/ereciept-ledger/ereciept-ledger').then(m => m.ErecieptLedger), canActivate: [RoleGuard], data: { role: 'admin' }},
  {path: 'epaymentLedger', loadComponent: () => import('../cashbookAccounts/ExpenseAccounts/epayment-ledger/epayment-ledger').then(m => m.EpaymentLedger), canActivate: [RoleGuard], data: { role: 'admin' }},
    {path: 'eDeleteAllData', loadComponent: () => import('../cashbookAccounts/ExpenseAccounts/eexportdata/eexportdata').then(m => m.Eexportdata), canActivate: [RoleGuard], data: { role: 'admin' }},





  {
    path: 'idashboard',
    loadComponent: () => import('../cashbookAccounts/incomeAccount/idashboard/idashboard').then(m => m.Idashboard ),
    canActivate: [RoleGuard],
    data: { role: 'admin' }
  },

{path: 'iAddTRANSACTION', loadComponent: () => import('../cashbookAccounts/incomeAccount/iaddtransactions/iaddtransactions').then(m => m.Iaddtransactions), canActivate: [RoleGuard], data: { role: 'admin' }},
{path: 'iTRANSACTIONs', loadComponent: () => import('../cashbookAccounts/incomeAccount/itransactions/itransactions').then(m => m.Itransactions), canActivate: [RoleGuard], data: { role: 'admin' }},
{path: 'iMonthlyAnalysis', loadComponent: () => import('../cashbookAccounts/incomeAccount/imonthlyanalysis/imonthlyanalysis').then(m => m.Imonthlyanalysis), canActivate: [RoleGuard], data: { role: 'admin' }},
{path: 'iPayment-Transactions', loadComponent: () => import('../cashbookAccounts/incomeAccount/ipaymentcategories/ipaymentcategories').then(m => m.Ipaymentcategories), canActivate: [RoleGuard], data: { role: 'admin' }},
{path: 'iReceipt-Transactions', loadComponent: () => import('../cashbookAccounts/incomeAccount/ireciept-categories/ireciept-categories').then(m => m.IrecieptCategories), canActivate: [RoleGuard], data: { role: 'admin' }},
{path: 'irecieptLedger', loadComponent: () => import('../cashbookAccounts/incomeAccount/ireciept-ledger/ireciept-ledger').then(m => m.IrecieptLedger), canActivate: [RoleGuard], data: { role: 'admin' }},
{path: 'ipaymentLedger', loadComponent: () => import('../cashbookAccounts/incomeAccount/ipayment-ledger/ipayment-ledger').then(m => m.IpaymentLedger), canActivate: [RoleGuard], data: { role: 'admin' }},



  {
    path: 'sdashboard',
    loadComponent: () => import('../cashbookAccounts/SavingsAccounts/sdashboard/sdashboard').then(m => m.Sdashboard),
    canActivate: [RoleGuard],
    data: { role: 'admin' }
  },
  {path: 'sAddTRANSACTION', loadComponent: () => import('../cashbookAccounts/SavingsAccounts/saddtransactions/saddtransactions').then(m => m.Saddtransactions), canActivate: [RoleGuard], data: { role: 'admin' }},
  {path: 'sTRANSACTIONs', loadComponent: () => import('../cashbookAccounts/SavingsAccounts/stransactions/stransactions').then(m => m.Stransactions), canActivate: [RoleGuard], data: { role: 'admin' }},
  {path: 'sMonthlyAnalysis', loadComponent: () => import('../cashbookAccounts/SavingsAccounts/smonthlyanalysis/smonthlyanalysis').then(m => m.Smonthlyanalysis), canActivate: [RoleGuard], data: { role: 'admin' }},
  {path: 'sPayment-Transactions', loadComponent: () => import('../cashbookAccounts/SavingsAccounts/spaymentcategories/spaymentcategories').then(m => m.Spaymentcategories), canActivate: [RoleGuard], data: { role: 'admin' }},
  {path: 'sReceipt-Transactions', loadComponent: () => import('../cashbookAccounts/SavingsAccounts/sreciept-categories/sreciept-categories').then(m => m.SrecieptCategories), canActivate: [RoleGuard], data: { role: 'admin' }},
  {path: 'srecieptLedger', loadComponent: () => import('../cashbookAccounts/SavingsAccounts/sreciept-ledger/sreciept-ledger').then(m => m.SrecieptLedger), canActivate: [RoleGuard], data: { role: 'admin' }},
  {path: 'spaymentLedger', loadComponent: () => import('../cashbookAccounts/SavingsAccounts/spayment-ldger/spayment-ldger').then(m => m.SpaymentLdger), canActivate: [RoleGuard], data: { role: 'admin' }},






  {
    path: 'pdashboard',
    loadComponent: () => import('../cashbookAccounts/personal/pdashboard/pdashboard').then(m => m.Pdashboard),
    canActivate: [RoleGuard],
    data: { role: 'admin' }
  },
  {path: 'pAddTRANSACTION', loadComponent: () => import('../cashbookAccounts/personal/paddtransactions/paddtransactions').then(m => m.Paddtransactions), canActivate: [RoleGuard], data: { role: 'admin' }},
  {path: 'pTRANSACTIONs', loadComponent: () => import('../cashbookAccounts/personal/ptransactions/ptransactions').then(m => m.Ptransactions), canActivate: [RoleGuard], data: { role: 'admin' }},
  {path: 'pMonthlyAnalysis', loadComponent: () => import('../cashbookAccounts/personal/pmonthlyanalysis/pmonthlyanalysis').then(m => m.Pmonthlyanalysis), canActivate: [RoleGuard], data: { role: 'admin' }},
  {path: 'pPayment-Transactions', loadComponent: () => import('../cashbookAccounts/personal/paymentcategories/paymentcategories').then(m => m.Paymentcategories), canActivate: [RoleGuard], data: { role: 'admin' }},
  {path: 'pReceipt-Transactions', loadComponent: () => import('../cashbookAccounts/personal/preciept-categories/preciept-categories').then(m => m.PrecieptCategories), canActivate: [RoleGuard], data: { role: 'admin' }},
  {path: 'precieptLedger', loadComponent: () => import('../cashbookAccounts/personal/preciept-ledger/preciept-ledger').then(m => m.PrecieptLedger), canActivate: [RoleGuard], data: { role: 'admin' }},
  {path: 'ppaymentLedger', loadComponent: () => import('../cashbookAccounts/personal/ppayment-ledger/ppayment-ledger').then(m => m.PpaymentLedger), canActivate: [RoleGuard], data: { role: 'admin' }},














  {
    path: '',
    loadComponent: () => import('./login/login').then(m => m.Login),

  },

  {
    path: '**',
    redirectTo: ''
  }

];
