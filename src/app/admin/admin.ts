import {Component, ElementRef, signal, ViewChild} from '@angular/core';
import {AuthService} from '../../services/guard/auth/auth';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {CurrencyPipe, DatePipe, DecimalPipe, NgClass, NgForOf, NgIf, SlicePipe} from '@angular/common';
import { Chart, registerables } from 'chart.js';
import {FormsModule} from '@angular/forms';
import {Dashboard} from './dashboard/dashboard';
 @Component({
  selector: 'app-admin',
   imports: [
     RouterLink,
     NgForOf,
     CurrencyPipe,
     DatePipe,
     FormsModule,
     NgIf,
     RouterLinkActive,
     DecimalPipe,
     NgClass,
     SlicePipe,
     Dashboard,


   ],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin {
  constructor(private auth: AuthService, private router: Router) {}

  logout() {
    this.auth.logout();
    this.router.navigate(['/']); // back to login
  }




   activeTab = signal<number>(0);
   selectedYear = new Date().getFullYear();
   setActiveTab(index: number) {
     this.activeTab.set(index);

     // Reload data when switching to certain tabs
     if (index === 2) {

     } else if (index === 3) {

     }
   }
   tabs = [
     { label: 'Monthly Report', icon: 'bi bi-calendar-month', badge: '' },
     { label: 'Transaction Chart', icon: 'bi bi-graph-up', badge: '' },
     { label: 'Category Analysis', icon: 'bi bi-pie-chart', badge: '' },
     { label: 'Year Comparison', icon: 'bi bi-calendar-range', badge: '' },
     { label: 'Export & Reports', icon: 'bi bi-download', badge: '' }
   ];


}
