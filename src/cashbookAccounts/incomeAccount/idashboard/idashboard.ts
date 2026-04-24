import {Component, ElementRef, HostListener, inject, signal, ViewChild, OnInit, OnDestroy, input} from '@angular/core';
import { DashboardStats, FilterCriteria, TransactionType, CashbookEntry } from '../../../app/core/model/cashbook.model';
import { DashboardStatsComponent } from '../../../app/admin/dashboard/dashboard-stats/dashboard-stats';
import { LoadingSpinnerComponent } from '../../../app/core/shared/components/loading-spinner/loading-spinner';
import {NgIf, CommonModule, DecimalPipe} from '@angular/common';
import { Firestore, collection, collectionData, query, orderBy, where } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import {RouterLink} from '@angular/router';
@Component({
  selector: 'app-idashboard',
  imports: [
    DashboardStatsComponent,
    LoadingSpinnerComponent,
    NgIf,
    DecimalPipe,
    RouterLink
  ],
  templateUrl: './idashboard.html',
  styleUrl: './idashboard.scss',
})
export class Idashboard {
  private firestore = inject(Firestore);
  private entriesSubscription: Subscription | null = null;

  // State
  selectedYear = new Date().getFullYear();
  selectedMonth = 0;
  collectionData = 'income';
  selectedType: 'all' | TransactionType = 'all';
  searchTerm = '';
  selectedCategory = '';

  // Data arrays
  years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);
  months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  // State signals
  private allEntries = signal<CashbookEntry[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  filteredEntries = signal<CashbookEntry[]>([]);
  stats = signal<DashboardStats>({
    openingBalance: 0,
    totalReceipts: 0,
    totalPayments: 0,
    currentBalance: 0,
    receiptCount: 0,
    paymentCount: 0,
    averageTransaction: 0
  });

  // Mobile menu state
  mobileMenuOpen = signal<boolean>(false);

  ngOnInit() {
    console.log('Current selected year:', this.selectedYear);
    this.loadEntries();
  }

  ngOnDestroy() {
    if (this.entriesSubscription) {
      this.entriesSubscription.unsubscribe();
    }
  }

  formatDate(dateValue: any): Date | null {
    if (!dateValue) return null;

    if (typeof dateValue === 'object' && dateValue !== null && 'toDate' in dateValue) {
      return dateValue.toDate();
    }
    if (typeof dateValue === 'object' && dateValue !== null && 'seconds' in dateValue) {
      return new Date(dateValue.seconds * 1000);
    }
    if (dateValue instanceof Date) {
      return dateValue;
    }
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? null : date;
  }

  loadEntries() {
    this.loading.set(true);
    this.error.set(null);

    const cashbookCollection = collection(this.firestore, this.collectionData);
    const q = query(cashbookCollection, orderBy('date', 'desc'));

    this.entriesSubscription = collectionData(q, { idField: 'id' }).subscribe({
      next: (entries: any[]) => {
        this.allEntries.set(entries as CashbookEntry[]);
        this.applyFilters();
        this.calculateStats();
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading entries:', error);
        this.error.set(error.message);
        this.loading.set(false);
      }
    });
  }

  applyFilters() {
    let filtered = [...this.allEntries()];

    // Filter by year
    filtered = filtered.filter(e => e.year === this.selectedYear);

    // Filter by month
    if (this.selectedMonth !== 0) {
      filtered = filtered.filter(e => e.month === this.selectedMonth);
    }

    // Filter by transaction type
    if (this.selectedType !== 'all') {
      filtered = filtered.filter(e => e.transactionType === this.selectedType);
    }

    // Filter by search term
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        e.description.toLowerCase().includes(search) ||
        (e.receivedFrom?.toLowerCase().includes(search)) ||
        (e.paidTo?.toLowerCase().includes(search))
      );
    }

    // Filter by category
    if (this.selectedCategory) {
      filtered = filtered.filter(e => {
        const category = e.transactionType === 'receipt' ? e.receiptCategory : e.paymentCategory;
        return category === this.selectedCategory;
      });
    }

    this.filteredEntries.set(filtered);
    this.calculateStats();
  }

  calculateStats() {
    const entries = this.filteredEntries();
    const receipts = entries.filter((e: CashbookEntry) => e.transactionType === 'receipt');
    const payments = entries.filter((e: CashbookEntry) => e.transactionType === 'payment');

    const totalReceipts = receipts.reduce((sum: number, e: CashbookEntry) => sum + e.amount, 0);
    const totalPayments = payments.reduce((sum: number, e: CashbookEntry) => sum + e.amount, 0);

    // Calculate current balance
    let balance = 0;
    entries.forEach((entry: CashbookEntry) => {
      if (entry.transactionType === 'receipt') {
        balance += entry.amount;
      } else {
        balance -= entry.amount;
      }
    });

    this.stats.set({
      openingBalance: 0,
      totalReceipts,
      totalPayments,
      currentBalance: balance,
      receiptCount: receipts.length,
      paymentCount: payments.length,
      averageTransaction: entries.length > 0 ? (totalReceipts + totalPayments) / entries.length : 0
    });
  }

  onYearChange() {
    this.applyFilters();
  }

  onMonthChange() {
    this.applyFilters();
  }

  onTypeChange() {
    this.applyFilters();
  }

  onSearchChange() {
    this.applyFilters();
  }

  onCategoryChange() {
    this.applyFilters();
  }

  exportData() {
    const entries = this.filteredEntries();

    if (entries.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = [
      'Date', 'Voucher No', 'Type', 'Description', 'NCOA Code', 'Bank',
      'Receipt No', 'Received From', 'DV No', 'Paid To', 'Amount', 'Balance'
    ];

    const rows = entries.map((entry: CashbookEntry) => {
      const date = this.formatDate(entry.date);
      const formattedDate = date ? date.toLocaleDateString() : '';

      return [
        formattedDate,
        entry.voucherNumber,
        entry.transactionType.toUpperCase(),
        entry.description,
        entry.ncoaCode,
        entry.bankAccount,
        entry.receiptNumber || '',
        entry.receivedFrom || '',
        entry.dvNumber || '',
        entry.paidTo || '',
        entry.amount,
        entry.balance || ''
      ];
    });

    const csvContent = [headers, ...rows].map((row: any[]) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cashbook_${this.selectedYear}_${this.selectedMonth || 'all'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  printReport() {
    const entries = this.filteredEntries();
    const currentStats = this.stats();

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const headers = [
      'Date', 'Voucher No', 'Type', 'Description', 'NCOA Code', 'Bank',
      'Receipt No', 'Received From', 'DV No', 'Paid To', 'Amount', 'Balance'
    ];

    const rows = entries.map((entry: CashbookEntry) => {
      const date = this.formatDate(entry.date);
      const formattedDate = date ? date.toLocaleDateString() : '';

      return [
        formattedDate,
        entry.voucherNumber,
        entry.transactionType.toUpperCase(),
        entry.description,
        entry.ncoaCode,
        entry.bankAccount,
        entry.receiptNumber || '',
        entry.receivedFrom || '',
        entry.dvNumber || '',
        entry.paidTo || '',
        entry.amount,
        entry.balance || ''
      ];
    });

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cashbook Report</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
          body { padding: 20px; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
            table { font-size: 12px; }
            .page-break { page-break-before: always; }
          }
          .header { text-align: center; margin-bottom: 30px; }
          .stats { margin-bottom: 20px; }
          .stats .card { margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Government Cashbook System</h2>
            <p>Report Generated: ${new Date().toLocaleString()}</p>
          </div>

          <div class="stats">
            <h4>Financial Summary</h4>
            <div class="row">
              <div class="col-md-3">
                <div class="card bg-primary text-white">
                  <div class="card-body">
                    <h6>Total Receipts</h6>
                    <h3>₦${currentStats.totalReceipts.toLocaleString()}</h3>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card bg-danger text-white">
                  <div class="card-body">
                    <h6>Total Payments</h6>
                    <h3>₦${currentStats.totalPayments.toLocaleString()}</h3>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card bg-success text-white">
                  <div class="card-body">
                    <h6>Current Balance</h6>
                    <h3>₦${currentStats.currentBalance.toLocaleString()}</h3>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card bg-info text-white">
                  <div class="card-body">
                    <h6>Total Transactions</h6>
                    <h3>${entries.length}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h4>Transaction Details</h4>
          <table class="table table-bordered">
            <thead>
              <tr>
                ${headers.map((h: string) => `<th>${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rows.map((row: any[]) => `<tr>${row.map((cell: any) => `<td>${cell}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  }

  clearError() {
    this.error.set(null);
  }

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

  clearFilters() {
    this.selectedYear = new Date().getFullYear();
    this.selectedMonth = 0;
    this.selectedType = 'all';
    this.searchTerm = '';
    this.selectedCategory = '';
    this.applyFilters();
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.mobile-tabs-header')) {
      this.closeMobileMenu();
    }
  }

  isChartVisible = false;

  @ViewChild('chartContainer') chartContainer!: ElementRef;

  ngAfterViewInit() {
    // Use Intersection Observer to detect when chart container is visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isChartVisible) {
          // Small delay to ensure container is fully rendered
          setTimeout(() => {
            this.isChartVisible = true;
          }, 100);
          observer.disconnect(); // Stop observing once chart is loaded
        }
      });
    }, { threshold: 0.1 });

    observer.observe(this.chartContainer.nativeElement);
  }

  menu=[
    {icon:"cashbook/1.png", name:"Add Transaction", link:"/iAddTRANSACTION"},

    {icon:"cashbook/3.png", name:"Payment Categories", link:"/iPayment-Transactions"},
    {icon:"cashbook/6.png", name:"Receipt Categories", link:"/iReceipt-Transactions"},
    {icon:"cashbook/11.png", name:"Transactions",link:"/iTRANSACTIONs" },
    {icon:"cashbook/14.svg", name:"Monthly Analysis", link:"/iMonthlyAnalysis"},
    {icon:"cashbook/8.png", name:"Payment Transactions", link:"/iPayment-Transactions"},
    {icon:"cashbook/9.png", name:"Receipt Transactions", link:"/iReceipt-Transactions"},
    {icon:"cashbook/13.svg", name:"Export To Excel", link:"/exportData"},
    {icon:"cashbook/12.png", name:"Report A problem" , link:"/complain"},
  ]
}
