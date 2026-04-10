import {Component, HostListener, inject, signal} from '@angular/core';
import {CashbookService} from '../core/services/cashbook.service';
import {
  CashbookEntry,
  FilterCriteria,
  PaymentCategory,
  ReceiptCategory,
  TransactionType
} from '../core/model/cashbook.model';
import {CashbookTableComponent} from '../core/shared/components/cashbook-table/cashbook-table';

@Component({
  selector: 'app-transactions',
  imports: [
    CashbookTableComponent
  ],
  template: `
    <app-cashbook-table
      [entries]="filteredEntries()"
      (deleteEntry)="onEntryDeleted($event)"
      (editEntry)="onEntryUpdated($event)">
    </app-cashbook-table>
  `,
  styles: [`

  `]
})
export class Transactions {
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


  // FIX: Add parameter for entry ID
  onEntryDeleted(entryId: string) {
    // Optional: Add confirmation dialog
    if (confirm('Are you sure you want to delete this entry?')) {
      this.cashbookService.deleteEntry(entryId).subscribe({
        next: () => {
          this.applyFilters();
          // Optional: Show success message
        },
        error: (error) => {
          console.error('Error deleting entry:', error);
          alert('Failed to delete entry. Please try again.');
        }
      });
    }
  }

  // FIX: Add parameter for entry
  onEntryUpdated(entry: CashbookEntry) {
    console.log('Edit entry:', entry);
    // Implement your edit logic here
    // You can open a modal or inline edit form
    // For now, just refresh the list
    this.applyFilters();
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
  // Add these methods to your component class
  hasActiveFilters(): boolean {
    return (this.selectedYear !== new Date().getFullYear()) ||
      (this.selectedMonth !== 0) ||
      (this.selectedType !== 'all') ||
      (this.searchTerm !== '') ||
      (this.selectedCategory !== '');
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.selectedYear !== new Date().getFullYear()) count++;
    if (this.selectedMonth !== 0) count++;
    if (this.selectedType !== 'all') count++;
    if (this.searchTerm !== '') count++;
    if (this.selectedCategory !== '') count++;
    return count;
  }

  activeTab = signal<number>(0);

  setActiveTab(index: number) {
    this.activeTab.set(index);

    // Reload data when switching to certain tabs
    if (index === 2) {

    } else if (index === 3) {

    }
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

  toggleMobileMenu() {
    this.mobileMenuOpen.set(!this.mobileMenuOpen());
  }

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
