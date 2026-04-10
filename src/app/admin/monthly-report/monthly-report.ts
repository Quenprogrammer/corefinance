import { Component, input, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CashbookService } from '../../core/services/cashbook.service';
import { MonthlySummary } from '../../core/model/cashbook.model';
import {MonthlyChartComponent} from '../monthly-chart/monthly-chart';

@Component({
  selector: 'app-monthly-report',
  standalone: true,
  imports: [CommonModule, MonthlyChartComponent],

  styles: [`
    .report-container {
      padding: 1.5rem;

      min-height: 100vh;
    }

    .report-card {
      background: white;
      border-radius: 1rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      overflow: hidden;
      animation: slideInUp 0.4s ease-out;
    }

    /* Summary Cards */
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1rem;
      padding: 1.5rem;
      background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
      border-bottom: 1px solid #e2e8f0;
    }

    .summary-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      background: white;
      border-radius: 1rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .summary-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
    }

    .summary-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .receipts-card::before {
      background: linear-gradient(90deg, #10b981, #34d399);
    }

    .payments-card::before {
      background: linear-gradient(90deg, #ef4444, #f87171);
    }

    .net-balance-card::before {
      background: linear-gradient(90deg, #3b82f6, #60a5fa);
    }

    .cumulative-card::before {
      background: linear-gradient(90deg, #f59e0b, #fbbf24);
    }

    .card-icon {
      width: 48px;
      height: 48px;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .receipts-card .card-icon {
      background: #f0fdf4;
      color: #10b981;
    }

    .payments-card .card-icon {
      background: #fef2f2;
      color: #ef4444;
    }

    .net-balance-card .card-icon {
      background: #eff6ff;
      color: #3b82f6;
    }

    .cumulative-card .card-icon {
      background: #fefce8;
      color: #f59e0b;
    }

    .card-info {
      flex: 1;
    }

    .card-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      font-weight: 500;
    }

    .card-value {
      display: block;
      font-size: 1.25rem;
      font-weight: 700;
      margin-top: 0.25rem;
      font-family: 'Courier New', monospace;
    }

    .receipts-card .card-value {
      color: #059669;
    }

    .payments-card .card-value {
      color: #dc2626;
    }

    .net-balance-card .card-value.positive {
      color: #059669;
    }

    .net-balance-card .card-value.negative {
      color: #dc2626;
    }

    .cumulative-card .card-value {
      color: #d97706;
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
    @media (max-width: 1024px) {
      .summary-cards {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .report-container {
        padding: 1rem;
      }

      .summary-cards {
        grid-template-columns: 1fr;
        gap: 0.75rem;
        padding: 1rem;
      }

      .summary-card {
        padding: 0.75rem 1rem;
      }

      .card-icon {
        width: 40px;
        height: 40px;
        font-size: 1.25rem;
      }

      .card-value {
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

      .summary-cards {
        background: white;
        break-inside: avoid;
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
  `],
  template: `
    <div class="report-container">
      <div class="report-card">
        <!-- Export Buttons -->
        <div class="export-buttons" style="padding: 16px; display: flex; gap: 10px; justify-content: flex-end;">
          <button class="btn-export" (click)="exportToExcel()" style="background: #4CAF50; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">
            <i class="bi bi-file-excel"></i> Export to Excel (CSV)
          </button>
          <button class="btn-export" (click)="exportToXLSX()" style="background: #217346; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">
            <i class="bi bi-file-spreadsheet"></i> Export to XLSX
          </button>
          <button class="btn-export" (click)="printReport()" style="background: #2196F3; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">
            <i class="bi bi-printer"></i> Print
          </button>
        </div>

        <!-- Summary Cards -->
        <div class="summary-cards">
          <div class="summary-card receipts-card">
            <div class="card-icon">
              <i class="bi bi-arrow-down-circle-fill"></i>
            </div>
            <div class="card-info">
              <span class="card-label">Total Receipts</span>
              <span class="card-value">₦{{ totalReceipts() | number:'1.2-2' }}</span>
            </div>
          </div>

          <div class="summary-card payments-card">
            <div class="card-icon">
              <i class="bi bi-arrow-up-circle-fill"></i>
            </div>
            <div class="card-info">
              <span class="card-label">Total Payments</span>
              <span class="card-value">₦{{ totalPayments() | number:'1.2-2' }}</span>
            </div>
          </div>

          <div class="summary-card net-balance-card">
            <div class="card-icon">
              <i class="bi" [ngClass]="(totalReceipts() - totalPayments()) >= 0 ? 'bi-graph-up' : 'bi-graph-down'"></i>
            </div>
            <div class="card-info">
              <span class="card-label">Net Balance</span>
              <span class="card-value" [class.positive]="(totalReceipts() - totalPayments()) >= 0"
                    [class.negative]="(totalReceipts() - totalPayments()) < 0">
                ₦{{ totalReceipts() - totalPayments() | number:'1.2-2' }}
              </span>
            </div>
          </div>

          <div class="summary-card cumulative-card">
            <div class="card-icon">
              <i class="bi bi-calculator-fill"></i>
            </div>
            <div class="card-info">
              <span class="card-label">Cumulative Balance</span>
              <span class="card-value">₦{{ getFinalCumulativeBalance() | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>

        @if (monthlyReport().length > 0) {
          <app-monthly-chart [data]="monthlyReport()" />
        }

        <!-- Report Content -->
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
                @for (item of monthlyReport(); track trackByMonth($index, item)) {
                  <tr [class.highlight-positive]="item.balance > 0"
                      [class.highlight-negative]="item.balance < 0"
                      [class.highlight-zero]="item.balance === 0">
                    <td class="month-cell">
                      <div class="month-badge">
                        <i class="bi bi-calendar3"></i>
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
                }

              <!-- Empty State -->
                @if (monthlyReport().length === 0) {
                  <tr>
                    <td colspan="5" class="empty-state">
                      <div class="empty-content">
                        <i class="bi bi-calendar-x"></i>
                        <p>No data available for {{ year() }}</p>
                        <small>No transactions found for this year</small>
                      </div>
                    </td>
                  </tr>
                }
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

  getFinalCumulativeBalance(): number {
    return this.getCumulativeBalance(13);
  }

  trackByMonth(index: number, item: MonthlySummary): string {
    return `${item.month}-${item.monthName}`;
  }

  // ============ EXPORT TO EXCEL FUNCTIONS ============

  exportToExcel(): void {
    const reportData = this.monthlyReport();

    if (reportData.length === 0) {
      alert('No data to export');
      return;
    }

    const excelData: any[][] = [];

    excelData.push(['MONTHLY FINANCIAL REPORT', '', '', '', '']);
    excelData.push([`Year: ${this.year()}`, `Generated: ${new Date().toLocaleString()}`, '', '', '']);
    excelData.push([]);
    excelData.push(['SUMMARY', '', '', '', '']);
    excelData.push(['Total Receipts', this.totalReceipts(), '', '', '']);
    excelData.push(['Total Payments', this.totalPayments(), '', '', '']);
    excelData.push(['Net Balance', this.totalReceipts() - this.totalPayments(), '', '', '']);
    excelData.push(['Cumulative Balance', this.getFinalCumulativeBalance(), '', '', '']);
    excelData.push([]);
    excelData.push(['Month', 'Receipts (₦)', 'Payments (₦)', 'Net Balance (₦)', 'Cumulative Balance (₦)']);

    let runningBalance = 0;
    for (const item of reportData) {
      const cumulativeBalance = runningBalance + (item.receipts - item.payments);
      runningBalance = cumulativeBalance;
      excelData.push([
        item.monthName,
        item.receipts,
        item.payments,
        item.balance,
        cumulativeBalance
      ]);
    }

    excelData.push([]);
    excelData.push(['TOTAL', this.totalReceipts(), this.totalPayments(), this.totalReceipts() - this.totalPayments(), '']);

    const csvContent = this.convertToCSV(excelData);
    this.downloadCSV(csvContent, `monthly_report_${this.year()}.csv`);
  }

  private convertToCSV(data: any[][]): string {
    return data.map(row =>
      row.map(cell => {
        if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(',')
    ).join('\n');
  }

  private downloadCSV(csvContent: string, filename: string): void {
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async exportToXLSX(): Promise<void> {
    try {
      const XLSX = await import('xlsx');

      const reportData = this.monthlyReport();
      const worksheetData: any[][] = [
        ['MONTHLY FINANCIAL REPORT'],
        [`Year: ${this.year()}`],
        [`Generated: ${new Date().toLocaleString()}`],
        [],
        ['SUMMARY', '', '', '', ''],
        ['Total Receipts', this.totalReceipts(), '', '', ''],
        ['Total Payments', this.totalPayments(), '', '', ''],
        ['Net Balance', this.totalReceipts() - this.totalPayments(), '', '', ''],
        ['Cumulative Balance', this.getFinalCumulativeBalance(), '', '', ''],
        [],
        ['Month', 'Receipts (₦)', 'Payments (₦)', 'Net Balance (₦)', 'Cumulative Balance (₦)']
      ];

      let runningBalance = 0;
      for (const item of reportData) {
        const cumulativeBalance = runningBalance + (item.receipts - item.payments);
        runningBalance = cumulativeBalance;
        worksheetData.push([
          item.monthName,
          item.receipts,
          item.payments,
          item.balance,
          cumulativeBalance
        ]);
      }

      worksheetData.push([]);
      worksheetData.push(['TOTAL', this.totalReceipts(), this.totalPayments(), this.totalReceipts() - this.totalPayments(), '']);

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      worksheet['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }];

      XLSX.utils.book_append_sheet(workbook, worksheet, `Monthly Report ${this.year()}`);
      XLSX.writeFile(workbook, `monthly_report_${this.year()}.xlsx`);

    } catch (error) {
      console.error('Error exporting to Excel:', error);
      this.exportToExcel();
    }
  }

  printReport(): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const reportData = this.monthlyReport();
    const totalReceipts = this.totalReceipts();
    const totalPayments = this.totalPayments();
    const netTotal = totalReceipts - totalPayments;
    const finalCumulative = this.getFinalCumulativeBalance();

    let runningBalance = 0;
    const tableRows = reportData.map(item => {
      const cumulativeBalance = runningBalance + (item.receipts - item.payments);
      runningBalance = cumulativeBalance;
      return `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">${item.monthName}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${item.receipts.toLocaleString()}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${item.payments.toLocaleString()}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${item.balance.toLocaleString()}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${cumulativeBalance.toLocaleString()}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Monthly Report ${this.year()}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { margin: 0; color: #333; }
          .header p { margin: 5px 0; color: #666; }
          .summary { display: flex; justify-content: space-around; margin-bottom: 30px; flex-wrap: wrap; gap: 15px; }
          .summary-box { background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center; min-width: 150px; }
          .summary-box .label { font-size: 12px; color: #666; text-transform: uppercase; }
          .summary-box .value { font-size: 20px; font-weight: bold; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #4CAF50; color: white; padding: 12px; border: 1px solid #ddd; }
          td { padding: 10px; border: 1px solid #ddd; }
          .footer { margin-top: 30px; text-align: right; font-size: 12px; color: #666; }
          .total-row { background: #f5f5f5; font-weight: bold; }
          @media print { body { margin: 0; padding: 0; } button { display: none; } }
        </style>
      </head>
      <body>
        <button onclick="window.print()" style="margin-bottom: 20px; padding: 10px 20px;">Print</button>
        <div class="header">
          <h1>Monthly Financial Report</h1>
          <p>Year: ${this.year()}</p>
          <p>Generated: ${new Date().toLocaleString()}</p>
        </div>

        <div class="summary">
          <div class="summary-box">
            <div class="label">Total Receipts</div>
            <div class="value">₦${totalReceipts.toLocaleString()}</div>
          </div>
          <div class="summary-box">
            <div class="label">Total Payments</div>
            <div class="value">₦${totalPayments.toLocaleString()}</div>
          </div>
          <div class="summary-box">
            <div class="label">Net Balance</div>
            <div class="value" style="color: ${netTotal >= 0 ? '#059669' : '#dc2626'}">₦${netTotal.toLocaleString()}</div>
          </div>
          <div class="summary-box">
            <div class="label">Cumulative Balance</div>
            <div class="value">₦${finalCumulative.toLocaleString()}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr><th>Month</th><th>Receipts (₦)</th><th>Payments (₦)</th><th>Net Balance (₦)</th><th>Cumulative Balance (₦)</th></tr>
          </thead>
          <tbody>${tableRows}</tbody>
          <tfoot><tr class="total-row"><td><strong>TOTAL</strong></td>
          <td style="text-align: right;"><strong>${totalReceipts.toLocaleString()}</strong></td>
          <td style="text-align: right;"><strong>${totalPayments.toLocaleString()}</strong></td>
          <td style="text-align: right;"><strong>${netTotal.toLocaleString()}</strong></td>
          <td style="text-align: right;"></td>
          </tr></tfoot>
        </table>

        <div class="footer"><p>Generated by Government Cashbook System</p></div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}
