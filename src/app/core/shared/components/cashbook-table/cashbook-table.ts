import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CashbookEntry } from '../../../model/cashbook.model';

@Component({
  selector: 'app-cashbook-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cashbook-wrapper">
      <div class="cashbook-card">
        <div class="card-header">
          <div class="header-left">
            <i class="bi bi-journal-check"></i>
            <h5 class="card-title">Cashbook Transactions</h5>
          </div>
          <div class="header-right">
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
              <tr *ngFor="let entry of entries(); trackBy: trackById"
                  [class.receipt-transaction]="entry.transactionType === 'receipt'"
                  [class.payment-transaction]="entry.transactionType === 'payment'">

                <!-- Receipt Fields -->
                <td *ngIf="entry.transactionType === 'receipt'" class="date-col">
                  {{ entry.date | date:'dd/MM/yyyy' }}
                </td>
                <td *ngIf="entry.transactionType === 'payment'" class="empty-cell">-</td>

                <td *ngIf="entry.transactionType === 'receipt'" class="voucher-col">
                  <span class="voucher-number">{{ entry.voucherNumber }}</span>
                </td>
                <td *ngIf="entry.transactionType === 'payment'" class="empty-cell">-</td>

                <td *ngIf="entry.transactionType === 'receipt'" class="party-col">
                  {{ entry.receivedFrom }}
                </td>
                <td *ngIf="entry.transactionType === 'payment'" class="empty-cell">-</td>

                <td *ngIf="entry.transactionType === 'receipt'" class="desc-col">
                  {{ entry.description }}
                </td>
                <td *ngIf="entry.transactionType === 'payment'" class="empty-cell">-</td>

                <td *ngIf="entry.transactionType === 'receipt'" class="ncoa-col">
                  <code>{{ entry.ncoaCode }}</code>
                </td>
                <td *ngIf="entry.transactionType === 'payment'" class="empty-cell">-</td>

                <td *ngIf="entry.transactionType === 'receipt'" class="amount-col receipt-amount">
                  {{ entry.amount | number:'1.2-2' }}
                </td>
                <td *ngIf="entry.transactionType === 'payment'" class="empty-cell">-</td>

                <!-- Payment Fields -->
                <td *ngIf="entry.transactionType === 'payment'" class="date-col">
                  {{ entry.date | date:'dd/MM/yyyy' }}
                </td>
                <td *ngIf="entry.transactionType === 'receipt'" class="empty-cell">-</td>

                <td *ngIf="entry.transactionType === 'payment'" class="voucher-col">
                  <span class="voucher-number">{{ entry.voucherNumber }}</span>
                </td>
                <td *ngIf="entry.transactionType === 'receipt'" class="empty-cell">-</td>

                <td *ngIf="entry.transactionType === 'payment'" class="dv-col">
                  <span class="dv-number">{{ entry.dvNumber }}</span>
                </td>
                <td *ngIf="entry.transactionType === 'receipt'" class="empty-cell">-</td>

                <td *ngIf="entry.transactionType === 'payment'" class="party-col">
                  {{ entry.paidTo }}
                </td>
                <td *ngIf="entry.transactionType === 'receipt'" class="empty-cell">-</td>

                <td *ngIf="entry.transactionType === 'payment'" class="desc-col">
                  {{ entry.description }}
                </td>
                <td *ngIf="entry.transactionType === 'receipt'" class="empty-cell">-</td>

                <td *ngIf="entry.transactionType === 'payment'" class="amount-col payment-amount">
                  {{ entry.amount | number:'1.2-2' }}
                </td>
                <td *ngIf="entry.transactionType === 'receipt'" class="empty-cell">-</td>

              </tr>

              <!-- Empty State -->
              <tr *ngIf="entries().length === 0">
                <td colspan="14" class="empty-state">
                  <div class="empty-message">
                    <i class="bi bi-database-slash"></i>
                    <p>No transactions found</p>
                    <small>Click "Add Entry" to get started</small>
                  </div>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cashbook-wrapper {
      background: #1e1e2e;
      padding: 1.5rem;
    }

    .cashbook-card {
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    /* Header Styles */
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      background: white;
      border-bottom: 1px solid #e5e7eb;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .header-left i {
      font-size: 1.25rem;
      color: #3b82f6;
    }

    .card-title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #111827;
    }

    .badge-count {
      background: #2a2a3a;
      color: #3b82f6;
      padding: 0.25rem 0.75rem;
      border-radius: 2rem;
      font-size: 0.75rem;
      font-weight: 500;
    }

    /* Table Container - Scrollable body only */
    .table-container {
      position: relative;
      overflow: hidden;
    }

    .table-responsive-wrapper {
      overflow-x: auto;
      overflow-y: auto;
      max-height: 65vh;
    }

    .cashbook-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.8125rem;
      min-width: 1200px;
    }

    /* Table Header */
    .cashbook-table thead {
      position: sticky;
      top: 0;
      z-index: 10;
      background: white;
    }

    .category-headers th {
      padding: 0.75rem 1rem;
      font-weight: 600;
      font-size: 0.75rem;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #e5e7eb;
    }

    .receipt-category {
      background: #f0fdf4;
      color: #166534;
    }

    .payment-category {
      background: #fef2f2;
      color: #991b1b;
    }

    .balance-category {
      background: #f3f4f6;
      color: #374151;
      text-align: center;
    }

    .actions-category {
      background: #f3f4f6;
      color: #374151;
      text-align: center;
    }

    .category-label {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .category-label i {
      font-size: 1rem;
    }

    .column-headers th {
      padding: 0.75rem 1rem;
      background: #f9fafb;
      font-weight: 600;
      color: #4b5563;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #e5e7eb;
    }

    /* Table Body */
    .cashbook-table tbody tr {
      border-bottom: 1px solid #f3f4f6;
      transition: background-color 0.2s;
    }

    .cashbook-table tbody tr:hover {
      background-color: #f9fafb;
    }

    .receipt-transaction:hover {
      background-color: #f0fdf4;
    }

    .payment-transaction:hover {
      background-color: #fef2f2;
    }

    .cashbook-table td {
      padding: 0.75rem 1rem;
      color: #1f2937;
      vertical-align: middle;
    }

    .empty-cell {
      color: #9ca3af;
      text-align: center;
      font-size: 0.75rem;
    }

    /* Column Specific Styles */
    .date-col {
      font-weight: 500;
      color: #374151;
    }

    .voucher-col .voucher-number {
      font-family: monospace;
      font-weight: 500;
      color: #3b82f6;
    }

    .dv-col .dv-number {
      font-family: monospace;
      font-weight: 500;
      color: #f59e0b;
    }

    .party-col {
      font-weight: 500;
      color: #111827;
    }

    .desc-col {
      color: #6b7280;
      max-width: 200px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ncoa-col code {
      background: #f3f4f6;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.6875rem;
      color: #059669;
    }

    .amount-col {
      text-align: right;
      font-weight: 600;
      font-family: 'Courier New', monospace;
    }

    .receipt-amount {
      color: #059669;
    }

    .payment-amount {
      color: #dc2626;
    }

    .balance-col {
      text-align: right;
      background-color: #fefce8;
      font-weight: 600;
      color: #854d0e;
    }

    /* Action Buttons */
    .actions-col {
      text-align: center;
      white-space: nowrap;
    }

    .icon-btn {
      background: none;
      border: none;
      padding: 0.375rem;
      margin: 0 0.125rem;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: all 0.2s;
      width: 28px;
      height: 28px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .edit-btn {
      background: #fef3c7;
      color: #d97706;
    }

    .edit-btn:hover {
      background: #f59e0b;
      color: white;
      transform: scale(1.05);
    }

    .delete-btn {
      background: #fee2e2;
      color: #dc2626;
    }

    .delete-btn:hover {
      background: #dc2626;
      color: white;
      transform: scale(1.05);
    }

    .icon-btn i {
      font-size: 0.875rem;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 3rem !important;
      background: #ffffff;
    }

    .empty-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .empty-message i {
      font-size: 2.5rem;
      color: #d1d5db;
    }

    .empty-message p {
      margin: 0;
      font-weight: 500;
      color: #6b7280;
    }

    .empty-message small {
      color: #9ca3af;
      font-size: 0.75rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .cashbook-wrapper {
        padding: 1rem;
      }

      .card-header {
        padding: 0.875rem 1rem;
      }

      .card-title {
        font-size: 1rem;
      }

      .cashbook-table td,
      .cashbook-table th {
        padding: 0.625rem 0.75rem;
      }
    }

    /* Print Styles */
    @media print {
      .cashbook-wrapper {
        background: white;
        padding: 0;
      }

      .cashbook-card {
        box-shadow: none;
      }

      .no-print {
        display: none;
      }

      .icon-btn {
        display: none;
      }

      .table-responsive-wrapper {
        overflow: visible;
        max-height: none;
      }
    }

    /* Custom Scrollbar */
    .table-responsive-wrapper::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    .table-responsive-wrapper::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }

    .table-responsive-wrapper::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }

    .table-responsive-wrapper::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
  `]
})
export class CashbookTableComponent {
  entries = input.required<CashbookEntry[]>();
  deleteEntry = output<string>();
  editEntry = output<CashbookEntry>();

  trackById(index: number, entry: CashbookEntry): string {
    return entry.id!;
  }
}
