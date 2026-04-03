import { Component, input, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CashbookService } from '../../core/services/cashbook.service';
import { MonthlySummary } from '../../core/model/cashbook.model';
import {MonthlyChartComponent} from '../monthly-chart/monthly-chart';

@Component({
  selector: 'app-monthly-report',
  standalone: true,
  imports: [CommonModule, MonthlyChartComponent],
  template: `
    <div class="report-container">
      <div class="report-card">  @if (monthlyReport().length > 0) {
        <app-monthly-chart [data]="monthlyReport()" />
      } Report Content -->
        <div class="report-body">
          <div class="table-wrapper">
            <table class="modern-table">
              <thead>
              <tr>
                <th class="month-col">Month</th>
                <th class="amount-col">Receipts</th>
                <th class="amount-col">Payments</th>
                <th class="amount-col">Net Balance</th>
                <th class="amount-col">Cumulative Balance</th>
              </tr>
              </thead>
              <tbody>
              <tr *ngFor="let item of monthlyReport(); trackBy: trackByMonth"
                  [class.highlight-positive]="item.balance > 0"
                  [class.highlight-negative]="item.balance < 0"
                  [class.highlight-zero]="item.balance === 0">
                <td class="month-cell">
                  <div class="month-badge">
                    <i class="bi" [ngClass]="{
                        'bi-calendar3': true
                      }"></i>
                    {{ item.monthName }}
                  </div>
                </td>
                <td class="amount-cell receipt-cell">
                  <div class="amount-wrapper">
                    <i class="bi bi-arrow-down-circle-fill receipt-icon"></i>
                    <span class="amount-value">{{ item.receipts | number:'1.2-2' }}</span>
                  </div>
                </td>
                <td class="amount-cell payment-cell">
                  <div class="amount-wrapper">
                    <i class="bi bi-arrow-up-circle-fill payment-icon"></i>
                    <span class="amount-value">{{ item.payments | number:'1.2-2' }}</span>
                  </div>
                </td>
                <td class="amount-cell balance-cell">
                  <div class="balance-wrapper" [ngClass]="{
                      'positive-balance': item.balance > 0,
                      'negative-balance': item.balance < 0,
                      'zero-balance': item.balance === 0
                    }">
                    <i class="bi" [ngClass]="{
                        'bi-arrow-up-circle-fill': item.balance > 0,
                        'bi-arrow-down-circle-fill': item.balance < 0,
                        'bi-dash-circle-fill': item.balance === 0
                      }"></i>
                    <span class="balance-value">{{ item.balance | number:'1.2-2' }}</span>
                  </div>
                </td>
                <td class="amount-cell cumulative-cell">
                  <div class="cumulative-wrapper">
                    <i class="bi bi-calculator-fill"></i>
                    <span class="cumulative-value">{{ getCumulativeBalance(item.month) | number:'1.2-2' }}</span>
                  </div>
                </td>
              </tr>

              <!-- Empty State -->
              <tr *ngIf="monthlyReport().length === 0">
                <td colspan="5" class="empty-state">
                  <div class="empty-content">
                    <i class="bi bi-calendar-x"></i>
                    <p>No data available for {{ year() }}</p>
                    <small>No transactions found for this year</small>
                  </div>
                </td>
              </tr>
              </tbody>
              <tfoot>
              <tr class="footer-row">
                <td class="footer-label">Total</td>
                <td class="footer-amount total-receipt">
                  <div class="total-wrapper">
                    <i class="bi bi-arrow-down-circle-fill"></i>
                    <strong>{{ totalReceipts() | number:'1.2-2' }}</strong>
                  </div>
                </td>
                <td class="footer-amount total-payment">
                  <div class="total-wrapper">
                    <i class="bi bi-arrow-up-circle-fill"></i>
                    <strong>{{ totalPayments() | number:'1.2-2' }}</strong>
                  </div>
                </td>
                <td class="footer-amount total-balance">
                  <div class="total-wrapper" [ngClass]="{
                      'positive': (totalReceipts() - totalPayments()) > 0,
                      'negative': (totalReceipts() - totalPayments()) < 0
                    }">
                    <i class="bi" [ngClass]="{
                        'bi-arrow-up-circle-fill': (totalReceipts() - totalPayments()) > 0,
                        'bi-arrow-down-circle-fill': (totalReceipts() - totalPayments()) < 0
                      }"></i>
                    <strong>{{ totalReceipts() - totalPayments() | number:'1.2-2' }}</strong>
                  </div>
                </td>
                <td class="footer-amount"></td>
              </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .report-container {
      padding: 1.5rem;
      background: #1e1e2e;
      min-height: 100vh;
    }

    .report-card {
      background: white;
      border-radius: 1rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      overflow: hidden;
      animation: slideInUp 0.4s ease-out;
    }

    /* Header Styles */
    .report-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 1.5rem;
      position: relative;
      overflow: hidden;
    }

    .report-header::before {
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

    .report-title {
      margin: 0;
      color: white;
      font-size: 1.25rem;
      font-weight: 600;
      letter-spacing: -0.025em;
    }

    .report-year {
      margin: 0.25rem 0 0 0;
      color: rgba(255, 255, 255, 0.9);
      font-size: 0.875rem;
    }

    .header-stats {
      background: rgba(255, 255, 255, 0.15);
      padding: 0.5rem 1rem;
      border-radius: 2rem;
      backdrop-filter: blur(10px);
    }

    .stat-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .stat-label {
      font-size: 0.625rem;
      color: rgba(255, 255, 255, 0.8);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-value {
      font-size: 1rem;
      font-weight: 600;
      color: white;
    }

    /* Table Styles */
    .report-body {
      padding: 0;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .modern-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      font-size: 0.875rem;
    }

    .modern-table thead {
      background: #f8fafc;
      border-bottom: 2px solid #e2e8f0;
    }

    .modern-table th {
      padding: 1rem 1rem;
      font-weight: 600;
      color: #1e293b;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: #f8fafc;
      border-bottom: 2px solid #e2e8f0;
    }

    .month-col {
      text-align: left;
    }

    .amount-col {
      text-align: right;
    }

    .modern-table tbody tr {
      border-bottom: 1px solid #f1f5f9;
      transition: all 0.2s ease;
    }

    .modern-table tbody tr:hover {
      background: #f8fafc;
      transform: translateX(4px);
    }

    .highlight-positive:hover {
      background: linear-gradient(90deg, #f0fdf4 0%, #ffffff 100%);
    }

    .highlight-negative:hover {
      background: linear-gradient(90deg, #fef2f2 0%, #ffffff 100%);
    }

    .modern-table td {
      padding: 1rem;
      vertical-align: middle;
    }

    /* Cell Styles */
    .month-cell {
      font-weight: 600;
      color: #1e293b;
    }

    .month-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .month-badge i {
      color: #3b82f6;
      font-size: 1rem;
    }

    .amount-cell {
      text-align: right;
    }

    .amount-wrapper {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.5rem;
    }

    .receipt-icon {
      color: #10b981;
      font-size: 0.875rem;
    }

    .payment-icon {
      color: #ef4444;
      font-size: 0.875rem;
    }

    .amount-value {
      font-weight: 500;
      font-family: 'Courier New', monospace;
    }

    .balance-wrapper {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.25rem 0.75rem;
      border-radius: 2rem;
      font-weight: 600;
    }

    .positive-balance {
      background: #f0fdf4;
      color: #059669;
    }

    .positive-balance i {
      color: #10b981;
    }

    .negative-balance {
      background: #fef2f2;
      color: #dc2626;
    }

    .negative-balance i {
      color: #ef4444;
    }

    .zero-balance {
      background: #f3f4f6;
      color: #6b7280;
    }

    .balance-value {
      font-family: 'Courier New', monospace;
      font-weight: 700;
    }

    .cumulative-wrapper {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: #fefce8;
      padding: 0.25rem 0.75rem;
      border-radius: 2rem;
    }

    .cumulative-wrapper i {
      color: #eab308;
      font-size: 0.875rem;
    }

    .cumulative-value {
      font-weight: 700;
      font-family: 'Courier New', monospace;
      color: #854d0e;
    }

    /* Footer Styles */
    .footer-row {
      background: #f9fafb;
      border-top: 2px solid #e5e7eb;
      font-weight: 600;
    }

    .footer-label {
      font-weight: 700;
      color: #111827;
      font-size: 0.875rem;
    }

    .footer-amount {
      text-align: right;
    }

    .total-wrapper {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.75rem;
      border-radius: 0.5rem;
    }

    .total-receipt .total-wrapper {
      background: #f0fdf4;
      color: #059669;
    }

    .total-payment .total-wrapper {
      background: #fef2f2;
      color: #dc2626;
    }

    .total-balance .total-wrapper.positive {
      background: #f0fdf4;
      color: #059669;
    }

    .total-balance .total-wrapper.negative {
      background: #fef2f2;
      color: #dc2626;
    }

    .total-wrapper i {
      font-size: 0.875rem;
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
      color: #cbd5e1;
    }

    .empty-content p {
      margin: 0;
      font-weight: 500;
      color: #64748b;
    }

    .empty-content small {
      color: #94a3b8;
      font-size: 0.75rem;
    }

    /* Animations */
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .report-container {
        padding: 1rem;
      }

      .report-header {
        padding: 1rem;
      }

      .header-content {
        gap: 0.75rem;
      }

      .header-icon {
        width: 40px;
        height: 40px;
      }

      .report-title {
        font-size: 1rem;
      }

      .modern-table th,
      .modern-table td {
        padding: 0.75rem;
      }

      .amount-wrapper,
      .balance-wrapper,
      .cumulative-wrapper {
        padding: 0.125rem 0.5rem;
      }
    }

    /* Print Styles */
    @media print {
      .report-container {
        padding: 0;
        background: white;
      }

      .report-card {
        box-shadow: none;
      }

      .report-header {
        background: #667eea;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .table-wrapper {
        overflow: visible;
      }
    }

    /* Custom Scrollbar */
    .table-wrapper::-webkit-scrollbar {
      height: 8px;
    }

    .table-wrapper::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }

    .table-wrapper::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }

    .table-wrapper::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
  `]
})
export class MonthlyReportComponent {
  private cashbookService = inject(CashbookService);
  year = input.required<number>();

  monthlyReport = signal<MonthlySummary[]>([]);

  constructor() {
    effect(() => {
      this.loadReport();
    });
  }

  loadReport() {
    this.cashbookService.getMonthlyReport(this.year()).subscribe({
      next: (report) => {
        this.monthlyReport.set(report);
      },
      error: (error) => {
        console.error('Error loading monthly report:', error);
      }
    });
  }

  totalReceipts(): number {
    return this.monthlyReport().reduce((sum, m) => sum + m.receipts, 0);
  }

  totalPayments(): number {
    return this.monthlyReport().reduce((sum, m) => sum + m.payments, 0);
  }

  getCumulativeBalance(month: number): number {
    let balance = 0;
    for (let i = 0; i < month; i++) {
      const m = this.monthlyReport()[i];
      if (m) {
        balance += m.receipts - m.payments;
      }
    }
    return balance;
  }

  trackByMonth(index: number, item: MonthlySummary): number {
    return item.month;
  }
}
