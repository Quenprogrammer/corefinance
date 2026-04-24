import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CashbookEntry } from '../../../model/cashbook.model';

// Add this helper function to convert Firestore Timestamp to Date
function convertToDate(value: any): Date | null {
  if (!value) return null;

  // If it's a Firestore Timestamp object
  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate();
  }

  // If it's a Firestore Timestamp with seconds/nanoseconds
  if (typeof value === 'object' && value !== null && 'seconds' in value) {
    return new Date(value.seconds * 1000);
  }

  // If it's already a Date
  if (value instanceof Date) {
    return value;
  }

  // If it's a string or number
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

@Component({
  selector: 'app-cashbook-table',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .cashbook-wrapper {
      margin: 1rem 0;
    }

    .cashbook-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .card-header {
      padding: 1rem 1.5rem;
      background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .header-left i {
      font-size: 1.25rem;
      color: #3b82f6;
    }

    .card-title {
      margin: 0;
      font-weight: 600;
      color: #1e293b;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .btn-export {
      padding: 0.5rem 1rem;
      background: #10b981;
      color: white;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-export:hover {
      background: #059669;
      transform: translateY(-1px);
    }

    .badge-count {
      padding: 0.25rem 0.75rem;
      background: #e2e8f0;
      border-radius: 2rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: #475569;
    }

    .table-container {
      overflow-x: auto;
    }

    .table-responsive-wrapper {
      overflow-x: auto;
    }

    .cashbook-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
    }

    .cashbook-table th,
    .cashbook-table td {
      padding: 0.75rem 1rem;
      border: 1px solid #e2e8f0;
      vertical-align: middle;
    }

    .category-headers th {
      padding: 0.5rem;
      text-align: center;
      font-weight: 600;
      font-size: 0.75rem;
    }

    .receipt-category {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      color: #059669;
    }

    .payment-category {
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
      color: #dc2626;
    }

    .category-label {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .column-headers th {
      background: #f8fafc;
      color: #475569;
      font-weight: 600;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .receipt-amount {
      color: #059669;
      font-weight: 600;
    }

    .payment-amount {
      color: #dc2626;
      font-weight: 600;
    }

    .voucher-number, .dv-number {
      font-family: monospace;
      font-weight: 600;
    }

    .empty-cell {
      color: #cbd5e1;
      text-align: center;
    }

    .empty-state {
      text-align: center;
      padding: 3rem !important;
    }

    .empty-message i {
      font-size: 3rem;
      color: #cbd5e1;
      margin-bottom: 1rem;
      display: block;
    }

    .empty-message p {
      margin: 0;
      color: #64748b;
    }

    .empty-message small {
      color: #94a3b8;
    }

    .summary-row {
      background: #f8fafc;
      border-top: 2px solid #e2e8f0;
    }

    .summary-label {
      text-align: right;
      font-weight: 600;
      color: #475569;
    }

    .summary-amount {
      text-align: right;
      font-weight: 700;
      font-size: 1rem;
    }

    .total-receipts {
      color: #059669;
    }

    .total-payments {
      color: #dc2626;
    }

    .positive {
      color: #059669;
    }

    .negative {
      color: #dc2626;
    }

    /* Hover Effects */
    .cashbook-table tbody tr:hover {
      background: #f8fafc;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .cashbook-table th,
      .cashbook-table td {
        padding: 0.5rem;
        font-size: 0.75rem;
      }

      .btn-export {
        padding: 0.375rem 0.75rem;
        font-size: 0.75rem;
      }
    }
  `],
  template: `
    <div class="cashbook-wrapper">
      <div class="cashbook-card">
        <div class="card-header">
          <div class="header-left">
            <i class="bi bi-journal-check"></i>
            <h5 class="card-title">Cashbook Transactions</h5>
          </div>
          <div class="header-right">
            <button class="btn-export" (click)="exportToExcel()" title="Export to Excel">
              <i class="bi bi-file-excel"></i> Export Excel
            </button>
            <span class="badge-count">{{ entries().length }} Transactions</span>
          </div>
        </div>

        <div class="table-container">
          <div class="table-responsive-wrapper">
            <table class="cashbook-table">
              <thead>
              <!-- Category Headers -->
              <tr class="category-headers">
                <th colspan="6" class="receipt-category">
                  <div class="category-label">
                    <i class="bi bi-arrow-down-short"></i>
                    RECEIPTS
                  </div>
                </th>
                <th colspan="6" class="payment-category">
                  <div class="category-label">
                    <i class="bi bi-arrow-up-short"></i>
                    PAYMENTS
                  </div>
                </th>
               </tr>
              <!-- Column Headers -->
              <tr class="column-headers">
                <th>Date</th>
                <th>Voucher No</th>
                <th>From/Received</th>
                <th>Description</th>
                <th>NCOA</th>
                <th>Amount</th>

                <th>Date</th>
                <th>Voucher No</th>
                <th>DV No</th>
                <th>To/Paid</th>
                <th>Description</th>
                <th>Amount</th>
               </tr>
              </thead>
              <tbody>
                @for (entry of entries(); track trackById($index, entry)) {
                  <tr [class.receipt-transaction]="entry.transactionType === 'receipt'"
                      [class.payment-transaction]="entry.transactionType === 'payment'">

                    <!-- Receipt Fields -->
                    @if (entry.transactionType === 'receipt') {
                      <td class="date-col">{{ formatDate(entry.date) }}</td>
                      <td class="voucher-col"><span class="voucher-number">{{ entry.voucherNumber }}</span></td>
                      <td class="party-col">{{ entry.receivedFrom }}</td>
                      <td class="desc-col">{{ entry.description }}</td>
                      <td class="ncoa-col"><code>{{ entry.ncoaCode }}</code></td>
                      <td class="amount-col receipt-amount">{{ entry.amount | number:'1.2-2' }}</td>
                    } @else {
                      <td class="empty-cell">-</td>
                      <td class="empty-cell">-</td>
                      <td class="empty-cell">-</td>
                      <td class="empty-cell">-</td>
                      <td class="empty-cell">-</td>
                      <td class="empty-cell">-</td>
                    }

                    <!-- Payment Fields -->
                    @if (entry.transactionType === 'payment') {
                      <td class="date-col">{{ formatDate(entry.date) }}</td>
                      <td class="voucher-col"><span class="voucher-number">{{ entry.voucherNumber }}</span></td>
                      <td class="dv-col"><span class="dv-number">{{ entry.dvNumber }}</span></td>
                      <td class="party-col">{{ entry.paidTo }}</td>
                      <td class="desc-col">{{ entry.description }}</td>
                      <td class="amount-col payment-amount">{{ entry.amount | number:'1.2-2' }}</td>
                    } @else {
                      <td class="empty-cell">-</td>
                      <td class="empty-cell">-</td>
                      <td class="empty-cell">-</td>
                      <td class="empty-cell">-</td>
                      <td class="empty-cell">-</td>
                      <td class="empty-cell">-</td>
                    }
                   </tr>
                }

              <!-- Empty State -->
                @if (entries().length === 0) {
                  <tr>
                    <td colspan="14" class="empty-state">
                      <div class="empty-message">
                        <i class="bi bi-database-slash"></i>
                        <p>No transactions found</p>
                        <small>Click "Add Entry" to get started</small>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
              @if (entries().length > 0) {
                <tfoot>
                <tr class="summary-row">
                  <td colspan="5" class="summary-label">Total Receipts</td>
                  <td class="summary-amount total-receipts">{{ getTotalReceipts() | number:'1.2-2' }}</td>
                  <td colspan="5" class="summary-label">Total Payments</td>
                  <td class="summary-amount total-payments">{{ getTotalPayments() | number:'1.2-2' }}</td>
                 </tr>
                <tr class="summary-row">
                  <td colspan="11" class="summary-label">Net Balance</td>
                  <td class="summary-amount" [class.positive]="getNetBalance() >= 0" [class.negative]="getNetBalance() < 0">
                    {{ getNetBalance() | number:'1.2-2' }}
                  </td>
                 </tr>
                </tfoot>
              }
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CashbookTableComponent {
  entries = input.required<CashbookEntry[]>();
  deleteEntry = output<string>();
  editEntry = output<CashbookEntry>();

  trackById(index: number, entry: CashbookEntry): string {
    return entry.id!;
  }

  // Helper method to format date from Firestore Timestamp
  formatDate(dateValue: any): string {
    const date = convertToDate(dateValue);
    if (!date) return '-';

    // Format as dd/MM/yyyy
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  getTotalReceipts(): number {
    return this.entries()
      .filter(e => e.transactionType === 'receipt')
      .reduce((sum, e) => sum + e.amount, 0);
  }

  getTotalPayments(): number {
    return this.entries()
      .filter(e => e.transactionType === 'payment')
      .reduce((sum, e) => sum + e.amount, 0);
  }

  getNetBalance(): number {
    return this.getTotalReceipts() - this.getTotalPayments();
  }

  // ============ EXPORT TO EXCEL FUNCTION ============

  exportToExcel(): void {
    const entries = this.entries();

    if (entries.length === 0) {
      alert('No data to export');
      return;
    }

    // Prepare data for Excel
    const excelData: any[][] = [];

    // Add Header
    excelData.push(['CASHBOOK TRANSACTIONS REPORT', '', '', '', '', '', '', '', '', '', '', '']);
    excelData.push([`Generated: ${new Date().toLocaleString()}`, '', '', '', '', '', '', '', '', '', '', '']);
    excelData.push([`Total Transactions: ${entries.length}`, '', '', '', '', '', '', '', '', '', '', '']);
    excelData.push([]);

    // Add Summary
    excelData.push(['SUMMARY', '', '', '', '', '', '', '', '', '', '', '']);
    excelData.push(['Total Receipts', this.getTotalReceipts(), '', '', '', '', 'Total Payments', this.getTotalPayments(), '', '', '', '']);
    excelData.push(['Net Balance', this.getNetBalance(), '', '', '', '', '', '', '', '', '', '']);
    excelData.push([]);

    // Table Headers
    excelData.push([
      'RECEIPTS', '', '', '', '', '', 'PAYMENTS', '', '', '', '', ''
    ]);

    excelData.push([
      'Date', 'Voucher No', 'From/Received', 'Description', 'NCOA', 'Amount',
      'Date', 'Voucher No', 'DV No', 'To/Paid', 'Description', 'Amount'
    ]);

    // Table Data
    entries.forEach(entry => {
      const formattedDate = this.formatDate(entry.date);

      if (entry.transactionType === 'receipt') {
        excelData.push([
          formattedDate,
          entry.voucherNumber,
          entry.receivedFrom || '',
          entry.description,
          entry.ncoaCode,
          entry.amount,
          '', '', '', '', '', ''
        ]);
      } else {
        excelData.push([
          '', '', '', '', '', '',
          formattedDate,
          entry.voucherNumber,
          entry.dvNumber || '',
          entry.paidTo || '',
          entry.description,
          entry.amount
        ]);
      }
    });

    // Add totals row
    excelData.push([]);
    excelData.push([
      'TOTAL RECEIPTS', '', '', '', '', this.getTotalReceipts(),
      'TOTAL PAYMENTS', '', '', '', '', this.getTotalPayments()
    ]);

    // Convert to CSV
    const csvContent = this.convertToCSV(excelData);

    // Download file
    this.downloadCSV(csvContent, `cashbook_export_${new Date().toISOString().split('T')[0]}.csv`);
  }

  private convertToCSV(data: any[][]): string {
    return data.map(row =>
      row.map(cell => {
        if (cell === undefined || cell === null) return '';
        if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(',')
    ).join('\n');
  }

  private downloadCSV(csvContent: string, filename: string): void {
    // Add BOM for UTF-8 to handle special characters
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
}
