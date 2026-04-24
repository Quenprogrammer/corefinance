import {Component, OnInit, OnDestroy, inject, signal, Input} from '@angular/core';
import {CommonModule, DecimalPipe, NgForOf, NgIf} from '@angular/common';
import { Firestore, collection, collectionData, query, orderBy } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import {CashbookEntry, CategoryAnalysis} from '../../../app/core/model/cashbook.model';

@Component({
  selector: 'app-epayment-ledger',
  imports: [
    DecimalPipe,
    NgIf,
    NgForOf
  ],
  template: `
    <!-- Receipt Analysis Card -->

    <!-- Payment Analysis Card -->
    <div class="analysis-card payment-card ">
      <div class="card-header-modern">
        <div class="header-content">
          <div class="header-icon">
            <i class="bi bi-credit-card"></i>
          </div>
          <div class="header-text">
            <h5 class="card-title">Payment Analysis by Category</h5>
            <p class="card-subtitle">Expense categories breakdown</p>
          </div>
          <div class="header-stats" *ngIf="paymentAnalysis().length > 0">
            <div class="stat-chip">
              <i class="bi bi-pie-chart"></i>
              <span>{{ paymentAnalysis().length }} Categories</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-cards" *ngIf="paymentAnalysis().length > 0">
        <div class="stat-card-item">
          <div class="stat-icon payment-icon">
            <i class="bi bi-calculator-fill"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Total Payments</span>
            <span class="stat-value">₦{{ getTotalPaymentAmount() | number:'1.2-2' }}</span>
          </div>
        </div>

        <div class="stat-card-item">
          <div class="stat-icon payment-icon">
            <i class="bi bi-receipt"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Total Transactions</span>
            <span class="stat-value">{{ getTotalPaymentCount() }}</span>
          </div>
        </div>

        <div class="stat-card-item">
          <div class="stat-icon payment-icon">
            <i class="bi bi-star-fill"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Top Category</span>
            <span class="stat-value">{{ getTopPaymentCategory()?.category || 'N/A' }}</span>
            <small class="stat-sub">{{ getTopPaymentCategory()?.amount | number:'1.2-2' }}</small>
          </div>
        </div>

        <div class="stat-card-item">
          <div class="stat-icon payment-icon">
            <i class="bi bi-graph-up"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Average Payment</span>
            <span class="stat-value">₦{{ getAveragePaymentAmount() | number:'1.2-2' }}</span>
          </div>
        </div>
      </div>

      <div class="card-body-modern">
        <div class="table-wrapper">
          <table class="analysis-table">
            <thead>
            <tr>
              <th class="category-col">Category</th>
              <th class="amount-col">Amount</th>
              <th class="percentage-col">Distribution</th>
              <th class="count-col">Transactions</th>
            </tr>
            </thead>
            <tbody>
            <tr *ngFor="let item of paymentAnalysis(); let i = index" class="analysis-row"
                [style.animation-delay]="i * 0.05 + 's'">
              <td class="category-cell">
                <div class="category-wrapper">
                    <span class="category-badge" [style.background]="getCategoryColor(item.category)">
                      {{ getCategoryInitial(item.category) }}
                    </span>
                  <span class="category-name">{{ item.category }}</span>
                </div>
              </td>
              <td class="amount-cell">
                <div class="amount-display payment-amount">
                  <i class="bi bi-arrow-up-circle"></i>
                  <span class="amount-value">{{ item.amount | number:'1.2-2' }}</span>
                </div>
              </td>
              <td class="percentage-cell">
                <div class="progress-container">
                  <div class="progress-bar-modern payment-progress" [style.width.%]="item.percentage">
                    <span class="percentage-label">{{ item.percentage | number:'1.1-1' }}%</span>
                  </div>
                </div>
              </td>
              <td class="count-cell">
                <div class="count-badge">
                  <i class="bi bi-file-text"></i>
                  <span>{{ item.count }}</span>
                </div>
              </td>
            </tr>

            <!-- Empty State -->
            <tr *ngIf="paymentAnalysis().length === 0 && !loading()">
              <td colspan="4" class="empty-state">
                <div class="empty-content">
                  <i class="bi bi-folder-x"></i>
                  <p>No data available</p>
                  <small>No payment transactions found</small>
                </div>
              </td>
            </tr>

            <!-- Loading State -->
            <tr *ngIf="loading()">
              <td colspan="4" class="empty-state">
                <div class="empty-content">
                  <div class="spinner"></div>
                  <p>Loading payment data...</p>
                </div>
              </td>
            </tr>
            </tbody>
            <tfoot *ngIf="paymentAnalysis().length > 0">
            <tr class="footer-row">
              <td class="footer-label">Total</td>
              <td class="footer-amount">
                <strong>{{ getTotalPaymentAmount() | number:'1.2-2' }}</strong>
              </td>
              <td class="footer-percentage">100%</td>
              <td class="footer-count">
                <strong>{{ getTotalPaymentCount() }}</strong>
              </td>
            </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .analysis-card {
      background: white;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      overflow: hidden;
      transition: all 0.3s ease;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .analysis-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }

    .mt-4 {
      margin-top: 1.5rem;
    }

    /* Header Styles */
    .card-header-modern {
      padding: 1.25rem 1.5rem;
      position: relative;
      overflow: hidden;
    }

    .receipt-card .card-header-modern {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }

    .payment-card .card-header-modern {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    }

    .card-header-modern::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
      pointer-events: none;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 1rem;
      position: relative;
      z-index: 1;
      flex-wrap: wrap;
    }

    .header-icon {
      background: rgba(255, 255, 255, 0.2);
      width: 48px;
      height: 48px;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
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
      font-size: 1.125rem;
      font-weight: 600;
      letter-spacing: -0.025em;
    }

    .card-subtitle {
      margin: 0.25rem 0 0 0;
      color: rgba(255, 255, 255, 0.9);
      font-size: 0.75rem;
    }

    .header-stats {
      background: rgba(255, 255, 255, 0.15);
      padding: 0.375rem 1rem;
      border-radius: 2rem;
      backdrop-filter: blur(10px);
    }

    .stat-chip {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: white;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .stat-chip i {
      font-size: 0.875rem;
    }

    /* Statistics Cards */
    .stats-cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      padding: 1.5rem;
      background: #f8fafc;
      border-bottom: 1px solid #e5e7eb;
    }

    .stat-card-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: white;
      border-radius: 1rem;
      transition: all 0.2s ease;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .stat-card-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .receipt-icon {
      background: #f0fdf4;
      color: #059669;
    }

    .payment-icon {
      background: #fef2f2;
      color: #dc2626;
    }

    .stat-info {
      flex: 1;
    }

    .stat-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      font-weight: 500;
      display: block;
    }

    .stat-value {
      display: block;
      font-size: 1.125rem;
      font-weight: 700;
      color: #1e293b;
      margin-top: 0.25rem;
      font-family: 'Courier New', monospace;
    }

    .stat-sub {
      font-size: 0.65rem;
      color: #9ca3af;
      margin-top: 0.125rem;
      display: block;
    }

    /* Body Styles */
    .card-body-modern {
      padding: 0;
      flex: 1;
    }

    .table-wrapper {
      overflow-x: auto;
      max-height: 400px;
      overflow-y: auto;
    }

    .analysis-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      font-size: 0.875rem;
    }

    .analysis-table thead {
      position: sticky;
      top: 0;
      z-index: 10;
      background: white;
    }

    .analysis-table th {
      padding: 1rem 1rem;
      font-weight: 600;
      color: #4b5563;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: #f9fafb;
      border-bottom: 2px solid #e5e7eb;
    }

    .category-col {
      text-align: left;
    }

    .amount-col, .percentage-col, .count-col {
      text-align: right;
    }

    .analysis-row {
      border-bottom: 1px solid #f3f4f6;
      transition: all 0.2s ease;
      animation: fadeInUp 0.4s ease-out backwards;
    }

    .analysis-row:hover {
      background: #f9fafb;
      transform: translateX(4px);
    }

    .analysis-table td {
      padding: 1rem;
      vertical-align: middle;
    }

    /* Category Cell */
    .category-wrapper {
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
      text-transform: uppercase;
    }

    .category-name {
      font-weight: 500;
      color: #1f2937;
    }

    /* Amount Cell */
    .amount-cell {
      text-align: right;
    }

    .amount-display {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.25rem 0.75rem;
      border-radius: 0.5rem;
      font-weight: 600;
    }

    .receipt-amount {
      background: #f0fdf4;
      color: #059669;
    }

    .payment-amount {
      background: #fef2f2;
      color: #dc2626;
    }

    .amount-display i {
      font-size: 0.875rem;
    }

    .amount-value {
      font-family: 'Courier New', monospace;
      font-weight: 700;
    }

    /* Progress Bar */
    .percentage-cell {
      text-align: right;
      min-width: 150px;
    }

    .progress-container {
      background: #f3f4f6;
      border-radius: 0.5rem;
      overflow: hidden;
      position: relative;
    }

    .progress-bar-modern {
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 0.75rem;
      transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .progress-bar-modern::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%);
      animation: shimmer 2s infinite;
    }

    .receipt-progress {
      background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
    }

    .payment-progress {
      background: linear-gradient(90deg, #ef4444 0%, #f87171 100%);
    }

    .percentage-label {
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
      position: relative;
      z-index: 1;
    }

    /* Count Cell */
    .count-cell {
      text-align: right;
    }

    .count-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: #f3f4f6;
      padding: 0.25rem 0.75rem;
      border-radius: 0.5rem;
      font-weight: 500;
    }

    .count-badge i {
      color: #6b7280;
      font-size: 0.875rem;
    }

    /* Footer */
    .footer-row {
      background: #f9fafb;
      border-top: 2px solid #e5e7eb;
      font-weight: 600;
    }

    .footer-label {
      font-weight: 700;
      color: #111827;
    }

    .footer-amount, .footer-percentage, .footer-count {
      text-align: right;
      font-weight: 700;
    }

    .footer-amount {
      color: #059669;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 3rem !important;
    }

    .empty-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .empty-content i {
      font-size: 3rem;
      color: #d1d5db;
    }

    .empty-content p {
      margin: 0;
      font-weight: 500;
      color: #6b7280;
    }

    .empty-content small {
      color: #9ca3af;
      font-size: 0.75rem;
    }

    /* Loading Spinner */
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e2e8f0;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Animations */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes shimmer {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .stats-cards {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .card-header-modern {
        padding: 1rem;
      }

      .header-icon {
        width: 40px;
        height: 40px;
      }

      .card-title {
        font-size: 1rem;
      }

      .stats-cards {
        grid-template-columns: 1fr;
        gap: 0.75rem;
        padding: 1rem;
      }

      .stat-card-item {
        padding: 0.75rem;
      }

      .stat-icon {
        width: 40px;
        height: 40px;
        font-size: 1rem;
      }

      .stat-value {
        font-size: 1rem;
      }

      .analysis-table th,
      .analysis-table td {
        padding: 0.75rem;
      }

      .progress-container {
        min-width: 100px;
      }

      .progress-bar-modern {
        height: 28px;
      }
    }

    /* Print Styles */
    @media print {
      .analysis-card {
        box-shadow: none;
        break-inside: avoid;
      }

      .stats-cards {
        break-inside: avoid;
      }

      .progress-bar-modern {
        background: #ddd !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .header-icon, .stat-chip {
        background: rgba(0,0,0,0.1) !important;
      }
    }

    /* Custom Scrollbar */
    .table-wrapper::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    .table-wrapper::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    .table-wrapper::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }

    .table-wrapper::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
  `]
})
export class EpaymentLedger implements OnDestroy, OnInit{
  private firestore = inject(Firestore);
  private entriesSubscription: Subscription | null = null;
  @Input() collectionData: string = 'expense';
  loading = signal<boolean>(false);
  private allEntries = signal<CashbookEntry[]>([]);

  receiptAnalysis = signal<CategoryAnalysis[]>([]);
  paymentAnalysis = signal<CategoryAnalysis[]>([]);

  ngOnInit() {
    this.loadEntries();
  }

  ngOnDestroy() {
    if (this.entriesSubscription) {
      this.entriesSubscription.unsubscribe();
    }
  }

  loadEntries() {
    this.loading.set(true);

    const cashbookCollection = collection(this.firestore, this.collectionData);
    const q = query(cashbookCollection, orderBy('date', 'desc'));

    this.entriesSubscription = collectionData(q, { idField: 'id' }).subscribe({
      next: (entries: any[]) => {
        this.allEntries.set(entries as CashbookEntry[]);
        this.processAnalysis();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading entries:', error);
        this.loading.set(false);
      }
    });
  }

  processAnalysis() {
    // Process Receipt Analysis
    const receiptEntries = this.allEntries().filter(e => e.transactionType === 'receipt');
    const receiptTotal = receiptEntries.reduce((sum, e) => sum + e.amount, 0);

    const receiptCategoryMap = new Map<string, { amount: number; count: number; transactions: CashbookEntry[] }>();

    receiptEntries.forEach(entry => {
      const category = entry.receiptCategory!;
      if (receiptCategoryMap.has(category)) {
        const existing = receiptCategoryMap.get(category)!;
        existing.amount += entry.amount;
        existing.count++;
        existing.transactions.push(entry);
      } else {
        receiptCategoryMap.set(category, {
          amount: entry.amount,
          count: 1,
          transactions: [entry]
        });
      }
    });

    const receiptAnalysisData = Array.from(receiptCategoryMap.entries())
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        percentage: receiptTotal > 0 ? (data.amount / receiptTotal) * 100 : 0,
        count: data.count,
        transactions: data.transactions
      }))
      .sort((a, b) => b.amount - a.amount);

    this.receiptAnalysis.set(receiptAnalysisData);

    // Process Payment Analysis
    const paymentEntries = this.allEntries().filter(e => e.transactionType === 'payment');
    const paymentTotal = paymentEntries.reduce((sum, e) => sum + e.amount, 0);

    const paymentCategoryMap = new Map<string, { amount: number; count: number; transactions: CashbookEntry[] }>();

    paymentEntries.forEach(entry => {
      const category = entry.paymentCategory!;
      if (paymentCategoryMap.has(category)) {
        const existing = paymentCategoryMap.get(category)!;
        existing.amount += entry.amount;
        existing.count++;
        existing.transactions.push(entry);
      } else {
        paymentCategoryMap.set(category, {
          amount: entry.amount,
          count: 1,
          transactions: [entry]
        });
      }
    });

    const paymentAnalysisData = Array.from(paymentCategoryMap.entries())
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        percentage: paymentTotal > 0 ? (data.amount / paymentTotal) * 100 : 0,
        count: data.count,
        transactions: data.transactions
      }))
      .sort((a, b) => b.amount - a.amount);

    this.paymentAnalysis.set(paymentAnalysisData);
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
    const index = Math.abs(hash % colors.length);
    return colors[index];
  }

  getCategoryInitial(category: string): string {
    return category.charAt(0).toUpperCase();
  }

  // Receipt Methods
  getTotalReceiptAmount(): number {
    return this.receiptAnalysis().reduce((sum, item) => sum + item.amount, 0);
  }

  getTotalReceiptCount(): number {
    return this.receiptAnalysis().reduce((sum, item) => sum + item.count, 0);
  }

  getAverageReceiptAmount(): number {
    const total = this.getTotalReceiptAmount();
    const count = this.getTotalReceiptCount();
    return count > 0 ? total / count : 0;
  }

  getTopReceiptCategory(): CategoryAnalysis | undefined {
    if (this.receiptAnalysis().length === 0) return undefined;
    return this.receiptAnalysis().reduce((top, current) =>
        current.amount > top.amount ? current : top,
      this.receiptAnalysis()[0]
    );
  }

  // Payment Methods
  getTotalPaymentAmount(): number {
    return this.paymentAnalysis().reduce((sum, item) => sum + item.amount, 0);
  }

  getTotalPaymentCount(): number {
    return this.paymentAnalysis().reduce((sum, item) => sum + item.count, 0);
  }

  getAveragePaymentAmount(): number {
    const total = this.getTotalPaymentAmount();
    const count = this.getTotalPaymentCount();
    return count > 0 ? total / count : 0;
  }

  getTopPaymentCategory(): CategoryAnalysis | undefined {
    if (this.paymentAnalysis().length === 0) return undefined;
    return this.paymentAnalysis().reduce((top, current) =>
        current.amount > top.amount ? current : top,
      this.paymentAnalysis()[0]
    );
  }
}
