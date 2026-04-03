import { Component, input, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CashbookService } from '../../core/services/cashbook.service';
import { CategoryAnalysis, TransactionType } from '../../core/model/cashbook.model';

@Component({
  selector: 'app-category-analysis',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="analysis-card mb-5" [class.receipt-card]="transactionType() === 'receipt'"
         [class.payment-card]="transactionType() === 'payment'">
      <div class="card-header-modern">
        <div class="header-content">
          <div class="header-icon">
            <i class="bi" [ngClass]="transactionType() === 'receipt' ? 'bi-cash-stack' : 'bi-credit-card'"></i>
          </div>
          <div class="header-text">
            <h5 class="card-title">{{ title }}</h5>
            <p class="card-subtitle">
              {{ transactionType() === 'receipt' ? 'Income sources analysis' : 'Expense categories breakdown' }}
            </p>
          </div>
          <div class="header-stats" *ngIf="analysis().length > 0">
            <div class="stat-chip">
              <i class="bi bi-pie-chart"></i>
              <span>{{ analysis().length }} Categories</span>
            </div>
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
            <tr *ngFor="let item of analysis(); let i = index" class="analysis-row"
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
                <div class="amount-display"
                     [class.receipt-amount]="transactionType() === 'receipt'"
                     [class.payment-amount]="transactionType() === 'payment'">
                  <i class="bi"
                     [ngClass]="transactionType() === 'receipt' ? 'bi-arrow-down-circle' : 'bi-arrow-up-circle'"></i>
                  <span class="amount-value">{{ item.amount | number:'1.2-2' }}</span>
                </div>
              </td>
              <td class="percentage-cell">
                <div class="progress-container">
                  <div class="progress-bar-modern"
                       [class.receipt-progress]="transactionType() === 'receipt'"
                       [class.payment-progress]="transactionType() === 'payment'"
                       [style.width.%]="item.percentage">
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
            <tr *ngIf="analysis().length === 0">
              <td colspan="4" class="empty-state">
                <div class="empty-content">
                  <i class="bi bi-folder-x"></i>
                  <p>No data available</p>
                  <small>No {{ transactionType() === 'receipt' ? 'receipt' : 'payment' }} transactions found</small>
                </div>
              </td>
            </tr>
            </tbody>
            <tfoot *ngIf="analysis().length > 0">
            <tr class="footer-row">
              <td class="footer-label">Total</td>
              <td class="footer-amount">
                <strong>{{ getTotalAmount() | number:'1.2-2' }}</strong>
              </td>
              <td class="footer-percentage">100%</td>
              <td class="footer-count">
                <strong>{{ getTotalCount() }}</strong>
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
      border-radius: 1rem;
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

      .analysis-table th,
      .analysis-table td {
        padding: 0.75rem;
      }

      .progress-container {
        min-width: 120px;
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
export class CategoryAnalysisComponent {
  private cashbookService = inject(CashbookService);

  transactionType = input.required<TransactionType>();
  title = input.required<string>();

  analysis = signal<CategoryAnalysis[]>([]);

  constructor() {
    effect(() => {
      this.loadAnalysis();
    });
  }

  loadAnalysis() {
    this.cashbookService.getCategoryAnalysis(this.transactionType()).subscribe({
      next: (analysis) => {
        this.analysis.set(analysis);
      },
      error: (error) => {
        console.error('Error loading category analysis:', error);
      }
    });
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

  getTotalAmount(): number {
    return this.analysis().reduce((sum, item) => sum + item.amount, 0);
  }

  getTotalCount(): number {
    return this.analysis().reduce((sum, item) => sum + item.count, 0);
  }
}
