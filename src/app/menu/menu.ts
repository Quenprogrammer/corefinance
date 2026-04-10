import {Component, HostListener, inject, signal} from '@angular/core';

import {DashboardStatsComponent} from '../admin/dashboard/dashboard-stats/dashboard-stats';
import {LoadingSpinnerComponent} from '../core/shared/components/loading-spinner/loading-spinner';
import {NgForOf, NgIf} from '@angular/common';
 import {CashbookService} from '../core/services/cashbook.service';
import {

  FilterCriteria,

  TransactionType
} from '../core/model/cashbook.model';
interface menuItems {
  icon:string;
  name: string;
  link?: string;


}
@Component({
  selector: 'app-menu',
  imports: [

    DashboardStatsComponent,
    LoadingSpinnerComponent,
    NgIf,

  ],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class Menu {
  private cashbookService = inject(CashbookService);

  // State
  selectedYear = new Date().getFullYear();
  selectedMonth = 0;
  selectedType: 'all' | TransactionType = 'all';
  searchTerm = '';
  selectedCategory = '';

  // Data
  years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);
  months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];


  // Signals from service
  loading = this.cashbookService.loading;
  error = this.cashbookService.error;
  filteredEntries = this.cashbookService.filteredEntries;
  stats = this.cashbookService.dashboardStats;

  ngOnInit() {
    console.log('Current selected year:', this.selectedYear);
    this.applyFilters();
  }

  applyFilters() {
    const filter: FilterCriteria = {
      year: this.selectedYear,
      month: this.selectedMonth === 0 ? undefined : this.selectedMonth,
      transactionType: this.selectedType,
      searchTerm: this.searchTerm || undefined,
      category: this.selectedCategory || undefined
    };
    this.cashbookService.setFilter(filter);
  }



  exportData() {
    const csv = this.cashbookService.exportToCSV(this.filteredEntries());
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cashbook_${this.selectedYear}_${this.selectedMonth || 'all'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  printReport() {
    this.cashbookService.printReport(this.filteredEntries(), this.stats());
  }

  clearError() {
    // Clear error in service (you might want to add this method)
  }



  tabs = [
    { label: 'Dashboard', icon: 'bi bi-calendar-month', badge: '' },
    { label: 'Transactions', icon: 'bi bi-graph-up', badge: '' },
    { label: 'Add Transactions', icon: 'bi bi-pie-chart', badge: '' },
    { label: 'Monthly Analysis', icon: 'bi bi-calendar-range', badge: '' },
    { label: 'Export & Reports', icon: 'bi bi-download', badge: '' },
    { label: 'Categories by Month', icon: 'bi bi-download', badge: '' }
  ];
  // Add these to your component
  mobileMenuOpen = signal<boolean>(false);


  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

// Close dropdown when clicking outside (optional)
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.mobile-tabs-header')) {
      this.closeMobileMenu();
    }
  }
}
