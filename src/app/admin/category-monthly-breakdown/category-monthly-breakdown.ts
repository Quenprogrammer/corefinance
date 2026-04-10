import { Component, input, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CashbookService } from '../../core/services/cashbook.service';
import { CategoryAnalysis, TransactionType, CashbookEntry } from '../../core/model/cashbook.model';

@Component({
  selector: 'app-category-monthly-breakdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="monthly-breakdown-card mb-5" [class.receipt-card]="transactionType() === 'receipt'"
         [class.payment-card]="transactionType() === 'payment'">

      <!-- Header -->
      <div class="card-header-modern">
        <div class="header-content">
          <div class="header-icon">
            <i class="bi" [ngClass]="transactionType() === 'receipt' ? 'bi-calendar-check' : 'bi-calendar-x'"></i>
          </div>
          <div class="header-text">
            <h5 class="card-title">{{ title() }}</h5>
            <p class="card-subtitle">Monthly breakdown by category (January - December {{ year() }})</p>
          </div>
          <div class="header-stats">
            <div class="stat-chip">
              <i class="bi bi-grid-3x3-gap-fill"></i>
              <span>{{ categories().length }} Categories</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card-body-modern">
        <!-- Year Selector -->
        <div class="year-selector">
          <label class="year-label">Select Year:</label>
          <select class="year-select" [value]="year()" (change)="onYearChange($event)">
            <option *ngFor="let y of availableYears" [value]="y">{{ y }}</option>
          </select>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading()" class="loading-container">
          <div class="loading-spinner">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="loading-text">Loading {{ transactionType() === 'receipt' ? 'receipt' : 'payment' }} data...</p>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="error()" class="error-container">
          <div class="error-icon">
            <i class="bi bi-exclamation-triangle-fill"></i>
          </div>
          <h6>Error Loading Data</h6>
          <p>{{ error() }}</p>
          <button class="retry-btn" (click)="loadData()">
            <i class="bi bi-arrow-repeat"></i> Retry
          </button>
        </div>

        <!-- Content - Only show when not loading and no error -->
        <ng-container *ngIf="!isLoading() && !error()">
          <!-- Monthly Breakdown Table -->
          <div class="table-wrapper" *ngIf="monthlyData().length > 0; else noData">
            <table class="breakdown-table">
              <thead>
              <tr class="header-row">
                <th class="category-header">Category</th>
                <th *ngFor="let month of months" class="month-header">
                  {{ month.short }}
                  <span class="month-full">{{ month.name }}</span>
                </th>
                <th class="total-header">Total</th>
              </tr>
              </thead>
              <tbody>
              <tr *ngFor="let categoryData of monthlyData(); let i = index" class="category-row"
                  [style.animation-delay]="i * 0.03 + 's'">

                <!-- Category Name -->
                <td class="category-cell">
                  <div class="category-info">
                      <span class="category-badge" [style.background]="getCategoryColor(categoryData.category)">
                        {{ getCategoryInitial(categoryData.category) }}
                      </span>
                    <span class="category-name">{{ categoryData.category }}</span>
                  </div>
                </td>

                <!-- Monthly Amounts -->
                <td *ngFor="let monthAmount of categoryData.monthlyAmounts"
                    class="amount-cell"
                    [class.has-amount]="monthAmount > 0"
                    [class.receipt-amount-cell]="transactionType() === 'receipt'"
                    [class.payment-amount-cell]="transactionType() === 'payment'">
                  <div class="amount-wrapper" *ngIf="monthAmount > 0">
                    <span class="currency-symbol">₦</span>
                    <span class="amount-value">{{ monthAmount | number:'1.0-0' }}</span>
                  </div>
                  <span class="no-amount" *ngIf="monthAmount === 0">-</span>
                </td>

                <!-- Total Amount -->
                <td class="total-cell">
                  <div class="total-wrapper"
                       [class.receipt-total]="transactionType() === 'receipt'"
                       [class.payment-total]="transactionType() === 'payment'">
                    <i class="bi" [ngClass]="transactionType() === 'receipt' ? 'bi-arrow-down-circle' : 'bi-arrow-up-circle'"></i>
                    <span class="total-value">{{ categoryData.total | number:'1.2-2' }}</span>
                  </div>
                </td>
              </tr>
              </tbody>

              <!-- Footer with Monthly Totals -->
              <tfoot>
              <tr class="footer-row">
                <td class="footer-label">Monthly Total</td>
                <td *ngFor="let monthlyTotal of monthlyTotals()" class="footer-amount-cell">
                  <div class="footer-amount-wrapper" *ngIf="monthlyTotal > 0">
                    <span class="currency-symbol">₦</span>
                    <span class="amount-value">{{ monthlyTotal | number:'1.0-0' }}</span>
                  </div>
                  <span class="no-amount" *ngIf="monthlyTotal === 0">-</span>
                </td>
                <td class="grand-total-cell">
                  <div class="grand-total-wrapper">
                    <i class="bi bi-calculator"></i>
                    <span class="grand-total-value">{{ getGrandTotal() | number:'1.2-2' }}</span>
                  </div>
                </td>
              </tr>
              </tfoot>
            </table>
          </div>

          <!-- No Data State -->
          <ng-template #noData>
            <div class="no-data-container">
              <div class="no-data-icon">
                <i class="bi bi-inbox"></i>
              </div>
              <h6>No Data Available</h6>
              <p>No {{ transactionType() === 'receipt' ? 'receipt' : 'payment' }} records found for {{ year() }}</p>
            </div>
          </ng-template>

          <!-- Summary Cards -->
          <div class="summary-cards" *ngIf="monthlyData().length > 0">
            <div class="summary-card">
              <div class="summary-icon" [class.receipt-icon]="transactionType() === 'receipt'"
                   [class.payment-icon]="transactionType() === 'payment'">
                <i class="bi bi-pie-chart"></i>
              </div>
              <div class="summary-info">
                <label>Top Category</label>
                <span class="summary-value">{{ getTopCategory()?.category ?? 'N/A' }}</span>
                <small>{{ (getTopCategory()?.total ?? 0) | number:'1.2-2' }}</small>
              </div>
            </div>

            <div class="summary-card">
              <div class="summary-icon" [class.receipt-icon]="transactionType() === 'receipt'"
                   [class.payment-icon]="transactionType() === 'payment'">
                <i class="bi bi-calendar-month"></i>
              </div>
              <div class="summary-info">
                <label>Peak Month</label>
                <span class="summary-value">{{ getPeakMonth()?.name ?? 'N/A' }}</span>
                <small>{{ (getPeakMonth()?.amount ?? 0) | number:'1.2-2' }}</small>
              </div>
            </div>

            <div class="summary-card">
              <div class="summary-icon" [class.receipt-icon]="transactionType() === 'receipt'"
                   [class.payment-icon]="transactionType() === 'payment'">
                <i class="bi bi-graph-up"></i>
              </div>
              <div class="summary-info">
                <label>Average Monthly</label>
                <span class="summary-value">{{ getAverageMonthly() | number:'1.2-2' }}</span>
                <small>per month</small>
              </div>
            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .monthly-breakdown-card {
      background: white;
      border-radius: 1.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .monthly-breakdown-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    /* Header Styles */
    .card-header-modern {
      padding: 1.5rem;
      position: relative;
      overflow: hidden;
    }

    .receipt-card .card-header-modern {
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
    }

    .payment-card .card-header-modern {
      background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 1rem;
      position: relative;
      z-index: 1;
    }

    .header-icon {
      background: rgba(255, 255, 255, 0.2);
      width: 50px;
      height: 50px;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .header-icon i {
      font-size: 1.5rem;
      color: white;
    }

    .header-text {
      flex: 1;
    }

    .card-title {
      margin: 0;
      color: white;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .card-subtitle {
      margin: 0.25rem 0 0;
      color: rgba(255, 255, 255, 0.9);
      font-size: 0.875rem;
    }

    .header-stats {
      background: rgba(255, 255, 255, 0.15);
      padding: 0.5rem 1rem;
      border-radius: 2rem;
    }

    .stat-chip {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: white;
      font-weight: 500;
    }

    /* Year Selector */
    .year-selector {
      padding: 1rem 1.5rem;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .year-label {
      font-weight: 600;
      color: #374151;
    }

    .year-select {
      padding: 0.5rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      background: white;
      font-weight: 500;
      cursor: pointer;
    }

    /* Table Styles */
    .table-wrapper {
      overflow-x: auto;
      max-height: 500px;
      overflow-y: auto;
    }

    .breakdown-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      font-size: 0.875rem;
    }

    .breakdown-table thead {
      position: sticky;
      top: 0;
      z-index: 10;
      background: white;
    }

    .breakdown-table th {
      padding: 1rem;
      font-weight: 600;
      color: #4b5563;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: #f9fafb;
      border-bottom: 2px solid #e5e7eb;
      text-align: center;
    }

    .category-header {
      text-align: left;
      min-width: 200px;
    }

    .month-header {
      min-width: 80px;
      position: relative;
    }

    .month-full {
      display: none;
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: #1f2937;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.7rem;
      white-space: nowrap;
      z-index: 20;
    }

    .month-header:hover .month-full {
      display: block;
    }

    .total-header {
      min-width: 120px;
      background: #f3f4f6;
    }

    /* Category Row */
    .category-row {
      border-bottom: 1px solid #f3f4f6;
      transition: all 0.2s ease;
      animation: slideIn 0.4s ease-out backwards;
    }

    .category-row:hover {
      background: #f9fafb;
    }

    .breakdown-table td {
      padding: 0.75rem 1rem;
      vertical-align: middle;
    }

    .category-cell {
      background: white;
      position: sticky;
      left: 0;
      z-index: 5;
    }

    .category-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .category-badge {
      width: 32px;
      height: 32px;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.75rem;
      color: white;
    }

    .category-name {
      font-weight: 500;
      color: #1f2937;
    }

    /* Amount Cells */
    .amount-cell {
      text-align: center;
    }

    .amount-wrapper {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      font-weight: 600;
    }

    .receipt-amount-cell .amount-wrapper {
      background: #f0fdf4;
      color: #059669;
    }

    .payment-amount-cell .amount-wrapper {
      background: #fef2f2;
      color: #dc2626;
    }

    .currency-symbol {
      font-size: 0.7rem;
    }

    .amount-value {
      font-family: 'Courier New', monospace;
      font-weight: 700;
    }

    .no-amount {
      color: #d1d5db;
      font-weight: 500;
    }

    /* Total Cell */
    .total-cell {
      background: #fef3c7;
      text-align: right;
    }

    .total-wrapper {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.75rem;
      border-radius: 0.5rem;
      font-weight: 700;
    }

    .receipt-total {
      background: #10b981;
      color: white;
    }

    .payment-total {
      background: #ef4444;
      color: white;
    }

    /* Footer */
    .footer-row {
      background: #f9fafb;
      border-top: 2px solid #e5e7eb;
      font-weight: 600;
      position: sticky;
      bottom: 0;
    }

    .footer-label {
      font-weight: 700;
      color: #111827;
      background: #f9fafb;
    }

    .footer-amount-cell {
      text-align: center;
      background: #f9fafb;
    }

    .footer-amount-wrapper {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      background: #e5e7eb;
      color: #374151;
      font-weight: 600;
    }

    .grand-total-cell {
      background: #fef3c7;
      text-align: right;
    }

    .grand-total-wrapper {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.75rem;
      border-radius: 0.5rem;
      background: #f59e0b;
      color: white;
      font-weight: 700;
    }

    /* Summary Cards */
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      padding: 1.5rem;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
    }

    .summary-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: white;
      border-radius: 1rem;
      transition: all 0.2s ease;
    }

    .summary-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .summary-icon {
      width: 48px;
      height: 48px;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .receipt-icon {
      background: #f0fdf4;
      color: #059669;
    }

    .payment-icon {
      background: #fef2f2;
      color: #dc2626;
    }

    .summary-icon i {
      font-size: 1.5rem;
    }

    .summary-info {
      flex: 1;
    }

    .summary-info label {
      font-size: 0.7rem;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .summary-value {
      display: block;
      font-size: 1rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0.25rem 0;
    }

    .summary-info small {
      font-size: 0.7rem;
      color: #9ca3af;
    }

    /* Animations */
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-10px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .month-header {
        min-width: 70px;
      }
    }

    @media (max-width: 768px) {
      .card-header-modern {
        padding: 1rem;
      }

      .breakdown-table th,
      .breakdown-table td {
        padding: 0.5rem;
      }

      .category-header {
        min-width: 150px;
      }

      .summary-cards {
        grid-template-columns: 1fr;
      }
    }

    /* Scrollbar */
    .table-wrapper::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    .table-wrapper::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    .table-wrapper::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }

    /* Loading State Styles */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      min-height: 300px;
    }

    .loading-spinner {
      text-align: center;
    }

    .spinner-border {
      width: 3rem;
      height: 3rem;
      border-width: 0.25rem;
    }

    .loading-text {
      margin-top: 1rem;
      color: #6b7280;
      font-size: 0.875rem;
    }

    /* Error State Styles */
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      min-height: 300px;
      text-align: center;
    }

    .error-icon {
      font-size: 3rem;
      color: #ef4444;
      margin-bottom: 1rem;
    }

    .error-container h6 {
      color: #dc2626;
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0.5rem 0;
    }

    .error-container p {
      color: #6b7280;
      margin-bottom: 1.5rem;
    }

    .retry-btn {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      border: none;
      padding: 0.5rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }

    .retry-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    /* No Data State Styles */
    .no-data-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      min-height: 300px;
      text-align: center;
    }

    .no-data-icon {
      font-size: 4rem;
      color: #d1d5db;
      margin-bottom: 1rem;
    }

    .no-data-container h6 {
      color: #374151;
      font-size: 1rem;
      font-weight: 600;
      margin: 0.5rem 0;
    }

    .no-data-container p {
      color: #9ca3af;
      font-size: 0.875rem;
    }
  `]
})
export class CategoryMonthlyBreakdownComponent {
  private cashbookService = inject(CashbookService);

  transactionType = input.required<TransactionType>();
  title = input.required<string>();
  year = input<number>(new Date().getFullYear());

  // Loading & Error signals
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  availableYears: number[] = [];
  allEntries: CashbookEntry[] = [];

  months = [
    { name: 'January', short: 'Jan', number: 1 },
    { name: 'February', short: 'Feb', number: 2 },
    { name: 'March', short: 'Mar', number: 3 },
    { name: 'April', short: 'Apr', number: 4 },
    { name: 'May', short: 'May', number: 5 },
    { name: 'June', short: 'Jun', number: 6 },
    { name: 'July', short: 'Jul', number: 7 },
    { name: 'August', short: 'Aug', number: 8 },
    { name: 'September', short: 'Sep', number: 9 },
    { name: 'October', short: 'Oct', number: 10 },
    { name: 'November', short: 'Nov', number: 11 },
    { name: 'December', short: 'Dec', number: 12 }
  ];

  monthlyData = signal<CategoryMonthlyData[]>([]);
  monthlyTotals = signal<number[]>([]);
  categories = computed(() => this.monthlyData().map(d => d.category));

  constructor() {
    // Generate available years (last 5 years)
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 2; i <= currentYear + 2; i++) {
      this.availableYears.push(i);
    }

    effect(() => {
      this.loadData();
    });
  }

  loadData() {
    this.isLoading.set(true);
    this.error.set(null);

    // Get all entries from service and process them
    this.cashbookService.getEntriesByYear(this.year()).subscribe({
      next: (entries: CashbookEntry[]) => {
        this.allEntries = entries;
        this.processMonthlyData();
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading entries:', error);
        this.error.set('Failed to load data. Please check your connection and try again.');
        this.isLoading.set(false);
      }
    });
  }

  onYearChange(event: any) {
    const newYear = parseInt(event.target.value, 10);
    // Force reload with new year
    this.loadData();
  }

  processMonthlyData() {
    const filteredEntries = this.allEntries.filter(
      e => e.transactionType === this.transactionType() && e.year === this.year()
    );

    // Group by category
    const categoryMap = new Map<string, CategoryMonthlyData>();

    filteredEntries.forEach(entry => {
      const category = this.transactionType() === 'receipt'
        ? entry.receiptCategory!
        : entry.paymentCategory!;

      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          category,
          monthlyAmounts: new Array(12).fill(0),
          total: 0
        });
      }

      const categoryData = categoryMap.get(category)!;
      const monthIndex = entry.month - 1;
      categoryData.monthlyAmounts[monthIndex] += entry.amount;
      categoryData.total += entry.amount;
    });

    // Convert to array and sort by total
    const monthlyDataArray = Array.from(categoryMap.values())
      .sort((a, b) => b.total - a.total);

    this.monthlyData.set(monthlyDataArray);

    // Calculate monthly totals
    const totals = new Array(12).fill(0);
    monthlyDataArray.forEach(categoryData => {
      categoryData.monthlyAmounts.forEach((amount, index) => {
        totals[index] += amount;
      });
    });

    this.monthlyTotals.set(totals);
  }

  getGrandTotal(): number {
    return this.monthlyTotals().reduce((sum, total) => sum + total, 0);
  }

  getTopCategory(): CategoryMonthlyData | undefined {
    return this.monthlyData()[0];
  }

  getPeakMonth(): { name: string; amount: number } | null {
    const totals = this.monthlyTotals();
    if (totals.length === 0) return null;

    const maxAmount = Math.max(...totals);
    const maxIndex = totals.indexOf(maxAmount);

    return {
      name: this.months[maxIndex].name,
      amount: maxAmount
    };
  }

  getAverageMonthly(): number {
    const grandTotal = this.getGrandTotal();
    return grandTotal / 12;
  }

  getCategoryColor(category: string): string {
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
      '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
      '#F97316', '#6366F1', '#14B8A6', '#A855F7'
    ];
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash % colors.length)];
  }

  getCategoryInitial(category: string): string {
    return category.charAt(0).toUpperCase();
  }
}


interface CategoryMonthlyData {
  category: string;
  monthlyAmounts: number[];
  total: number;
}
