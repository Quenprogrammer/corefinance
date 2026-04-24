import {Component, HostListener, signal, OnInit, inject, OnDestroy, Input} from '@angular/core';
import {Firestore, collection, collectionData, query, orderBy, doc, deleteDoc, where} from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { CashbookEntry, PaymentCategory, ReceiptCategory, TransactionType } from '../../../app/core/model/cashbook.model';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-etransactions',
  standalone: true,
  imports: [CommonModule, FormsModule, NgForOf, NgIf],
  template: `
    <!-- Filters Section -->
    <div class="filters-section">
      <div class="filters-grid">
        <!-- Year Filter -->
        <div class="filter-group">
          <label class="filter-label">
            <i class="bi bi-calendar"></i>
            Year
          </label>
          <!-- Update the year select in your template -->
          <select class="filter-select" [(ngModel)]="selectedYear" (change)="onYearChange()">
            <option *ngFor="let year of years" [value]="year">{{ year }}</option>
          </select>
        </div>

        <!-- Month Filter -->
        <div class="filter-group">
          <label class="filter-label">
            <i class="bi bi-calendar-month"></i>
            Month
          </label>
          <select class="filter-select" [(ngModel)]="selectedMonth" (change)="applyFilters()">
            <option [value]="0">All Months</option>
            <option *ngFor="let month of months; let i = index" [value]="i + 1">{{ month }}</option>
          </select>
        </div>

        <!-- Transaction Type Filter -->
        <div class="filter-group">
          <label class="filter-label">
            <i class="bi bi-arrow-left-right"></i>
            Type
          </label>
          <select class="filter-select" [(ngModel)]="selectedType" (change)="applyFilters()">
            <option value="all">All Transactions</option>
            <option value="receipt">Receipts</option>
            <option value="payment">Payments</option>
          </select>
        </div>

        <!-- Search Filter -->
        <div class="filter-group">
          <label class="filter-label">
            <i class="bi bi-search"></i>
            Search
          </label>
          <input type="text"
                 class="filter-input"
                 [(ngModel)]="searchTerm"
                 (input)="applyFilters()"
                 placeholder="Search description, party...">
        </div>

        <!-- Category Filter -->
        <div class="filter-group">
          <label class="filter-label">
            <i class="bi bi-tags"></i>
            Category
          </label>
          <select class="filter-select" [(ngModel)]="selectedCategory" (change)="applyFilters()">
            <option value="">All Categories</option>
            <optgroup label="Receipt Categories">
              <option *ngFor="let cat of receiptCategories" [value]="cat">{{ cat }}</option>
            </optgroup>
            <optgroup label="Payment Categories">
              <option *ngFor="let cat of paymentCategories" [value]="cat">{{ cat }}</option>
            </optgroup>
          </select>
        </div>

        <!-- Active Filters Badge -->
        <div class="filter-group" *ngIf="hasActiveFilters()">
          <button class="clear-filters-btn" (click)="clearFilters()">
            <i class="bi bi-x-circle"></i>
            Clear Filters ({{ getActiveFiltersCount() }})
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    @if (loading()) {
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading transactions...</p>
      </div>
    }

    <!-- Error State -->
    @if (error()) {
      <div class="error-state">
        <i class="bi bi-exclamation-triangle"></i>
        <p>{{ error() }}</p>
        <button class="retry-btn" (click)="loadEntries()">Retry</button>
      </div>
    }

    <!-- Table Component Built In -->
    @if (!loading() && !error()) {
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
              <span class="badge-count">{{ filteredEntries().length }} Transactions</span>
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
                  <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                  @for (entry of filteredEntries(); track trackById($index, entry)) {
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

                      <!-- Actions -->
                      <td class="actions-col">
                        <button class="action-btn delete-btn" (click)="openDeleteModal(entry)" title="Delete">
                          <i class="bi bi-trash"></i> Delete
                        </button>
                      </td>
                    </tr>
                  }

                <!-- Empty State -->
                  @if (filteredEntries().length === 0) {
                    <tr>
                      <td colspan="13" class="empty-state">
                        <div class="empty-message">
                          <i class="bi bi-database-slash"></i>
                          <p>No transactions found</p>
                          <small>Adjust your filters or add new transactions</small>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
                @if (filteredEntries().length > 0) {
                  <tfoot>
                  <tr class="summary-row">
                    <td colspan="5" class="summary-label">Total Receipts</td>
                    <td class="summary-amount total-receipts">{{ getTotalReceipts() | number:'1.2-2' }}</td>
                    <td colspan="5" class="summary-label">Total Payments</td>
                    <td class="summary-amount total-payments">{{ getTotalPayments() | number:'1.2-2' }}</td>
                    <td></td>
                  </tr>
                  <tr class="summary-row">
                    <td colspan="11" class="summary-label">Net Balance</td>
                    <td class="summary-amount" [class.positive]="getNetBalance() >= 0" [class.negative]="getNetBalance() < 0">
                      {{ getNetBalance() | number:'1.2-2' }}
                    </td>
                    <td></td>
                  </tr>
                  </tfoot>
                }
              </table>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Delete Confirmation Modal -->
    <div class="modal-overlay" *ngIf="showDeleteModal" (click)="closeDeleteModal()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="modal-header-icon delete-icon">
            <i class="bi bi-exclamation-triangle"></i>
          </div>
          <h3 class="modal-title">Confirm Deletion</h3>
          <button class="modal-close" (click)="closeDeleteModal()">&times;</button>
        </div>

        <div class="modal-body">
          <p class="delete-warning">
            Are you sure you want to delete this transaction?
          </p>

          @if (entryToDelete) {
            <div class="transaction-details">
              <h4>Transaction Details:</h4>
              <div class="details-grid">
                <div class="detail-item">
                  <span class="detail-label">Type:</span>
                  <span class="detail-value" [class.receipt-text]="entryToDelete.transactionType === 'receipt'"
                        [class.payment-text]="entryToDelete.transactionType === 'payment'">
                    {{ entryToDelete.transactionType === 'receipt' ? 'RECEIPT' : 'PAYMENT' }}
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Date:</span>
                  <span class="detail-value">{{ formatDate(entryToDelete.date) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Voucher No:</span>
                  <span class="detail-value">{{ entryToDelete.voucherNumber }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Description:</span>
                  <span class="detail-value">{{ entryToDelete.description }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Amount:</span>
                  <span class="detail-value" [class.receipt-text]="entryToDelete.transactionType === 'receipt'"
                        [class.payment-text]="entryToDelete.transactionType === 'payment'">
                    ₦{{ entryToDelete.amount | number:'1.2-2' }}
                  </span>
                </div>
                @if (entryToDelete.transactionType === 'receipt') {
                  <div class="detail-item">
                    <span class="detail-label">Received From:</span>
                    <span class="detail-value">{{ entryToDelete.receivedFrom }}</span>
                  </div>
                } @else {
                  <div class="detail-item">
                    <span class="detail-label">Paid To:</span>
                    <span class="detail-value">{{ entryToDelete.paidTo }}</span>
                  </div>
                }
              </div>
            </div>
          }

          <p class="delete-warning-text">
            <i class="bi bi-exclamation-circle"></i>
            This action cannot be undone. This will permanently delete the transaction from the database.
          </p>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" (click)="closeDeleteModal()">
            <i class="bi bi-x-circle"></i> Cancel
          </button>
          <button class="btn-delete" (click)="confirmDelete()" [disabled]="isDeleting">
            <i class="bi bi-trash" *ngIf="!isDeleting"></i>
            <span class="spinner-small" *ngIf="isDeleting"></span>
            {{ isDeleting ? 'Deleting...' : 'Delete Transaction' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .filters-section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      align-items: end;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filter-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #475569;
    }

    .filter-label i {
      font-size: 1rem;
    }

    .filter-select, .filter-input {
      padding: 0.5rem 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .filter-select:focus, .filter-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .clear-filters-btn {
      padding: 0.5rem 1rem;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      color: #475569;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }

    .clear-filters-btn:hover {
      background: #e2e8f0;
    }

    .loading-state, .error-state {
      text-align: center;
      padding: 3rem;
      background: white;
      border-radius: 12px;
    }

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

    .error-state i {
      font-size: 3rem;
      color: #ef4444;
      margin-bottom: 1rem;
    }

    .retry-btn {
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
    }

    /* Table Styles */
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

    .actions-col {
      text-align: center;
      white-space: nowrap;
    }

    .action-btn {
      padding: 0.5rem 1rem;
      margin: 0 0.25rem;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.75rem;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .delete-btn {
      background: #ef4444;
      color: white;
    }

    .delete-btn:hover {
      background: #dc2626;
      transform: translateY(-1px);
    }

    .cashbook-table tbody tr:hover {
      background: #f8fafc;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-container {
      background: white;
      border-radius: 16px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
      from {
        transform: translateY(50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      gap: 1rem;
      position: relative;
    }

    .modal-header-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .delete-icon {
      background: #fef2f2;
      color: #dc2626;
    }

    .modal-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      flex: 1;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #94a3b8;
      transition: color 0.2s;
    }

    .modal-close:hover {
      color: #475569;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .delete-warning {
      font-size: 1rem;
      color: #475569;
      margin-bottom: 1.5rem;
    }

    .transaction-details {
      background: #f8fafc;
      border-radius: 12px;
      padding: 1rem;
      margin-bottom: 1.5rem;
    }

    .transaction-details h4 {
      margin: 0 0 1rem 0;
      font-size: 0.875rem;
      font-weight: 600;
      color: #475569;
    }

    .details-grid {
      display: grid;
      gap: 0.75rem;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.875rem;
    }

    .detail-label {
      font-weight: 500;
      color: #64748b;
    }

    .detail-value {
      color: #1e293b;
      font-weight: 500;
    }

    .receipt-text {
      color: #059669;
    }

    .payment-text {
      color: #dc2626;
    }

    .delete-warning-text {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #dc2626;
      background: #fef2f2;
      padding: 0.75rem;
      border-radius: 8px;
      margin: 0;
    }

    .delete-warning-text i {
      font-size: 1rem;
    }

    .modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }

    .btn-cancel, .btn-delete {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-cancel {
      background: #e2e8f0;
      color: #475569;
    }

    .btn-cancel:hover {
      background: #cbd5e1;
    }

    .btn-delete {
      background: #ef4444;
      color: white;
    }

    .btn-delete:hover:not(:disabled) {
      background: #dc2626;
      transform: translateY(-1px);
    }

    .btn-delete:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner-small {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      display: inline-block;
    }

    @media (max-width: 768px) {
      .filters-grid {
        grid-template-columns: 1fr;
      }

      .cashbook-table th,
      .cashbook-table td {
        padding: 0.5rem;
        font-size: 0.75rem;
      }

      .btn-export {
        padding: 0.375rem 0.75rem;
        font-size: 0.75rem;
      }

      .modal-container {
        width: 95%;
        margin: 1rem;
      }

      .detail-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
      }
    }
  `]
})
export class Etransactions implements OnInit, OnDestroy {
  private firestore = inject(Firestore);
  private entriesSubscription: Subscription | null = null;
  @Input() collectionData: string = 'expense';
  // State signals
  private allEntries = signal<CashbookEntry[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Filter state
  selectedYear = new Date().getFullYear();
  selectedMonth = 0;
  selectedType: 'all' | TransactionType = 'all';
  searchTerm = '';
  selectedCategory = '';

  // Delete modal state
  showDeleteModal = false;
  entryToDelete: CashbookEntry | null = null;
  isDeleting = false;

  // Data arrays
  years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);
  months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  receiptCategories: ReceiptCategory[] = [
    'Tax Revenue', 'Fees & Charges', 'Licenses', 'Fines & Penalties', 'Grants & Aids', 'Other Receipts'
  ];

  paymentCategories: PaymentCategory[] = [
    'Personnel Services', 'Maintenance & Operating', 'Financial Expenses',
    'Capital Outlay', 'Debt Service', 'Other Payments'
  ];

  // Computed filtered entries
  filteredEntries = signal<CashbookEntry[]>([]);

  ngOnInit() {
    this.loadEntries();
  }

  ngOnDestroy() {
    if (this.entriesSubscription) {
      this.entriesSubscription.unsubscribe();
    }
  }

  trackById(index: number, entry: CashbookEntry): string {
    return entry.id!;
  }

  formatDate(dateValue: any): string {
    if (!dateValue) return '-';

    let date: Date;
    if (typeof dateValue === 'object' && dateValue !== null && 'toDate' in dateValue) {
      date = dateValue.toDate();
    } else if (typeof dateValue === 'object' && dateValue !== null && 'seconds' in dateValue) {
      date = new Date(dateValue.seconds * 1000);
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else {
      date = new Date(dateValue);
    }

    if (isNaN(date.getTime())) return '-';

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading entries:', error);
        this.error.set(error.message);
        this.loading.set(false);
      }
    });
  }

  // Add this method to refresh data when year changes
  applyFilters() {
    let filtered = [...this.allEntries()];

    // Log for debugging
    console.log('Filtering with year:', this.selectedYear);
    console.log('All entries years:', this.allEntries().map(e => e.year));

    // Year filter - ensure it's comparing numbers
    filtered = filtered.filter(e => {
      // Convert both to numbers to ensure proper comparison
      const entryYear = typeof e.year === 'number' ? e.year : parseInt(e.year);
      const selectedYearNum = typeof this.selectedYear === 'number' ? this.selectedYear : parseInt(this.selectedYear);
      return entryYear === selectedYearNum;
    });

    // Month filter
    if (this.selectedMonth !== 0) {
      filtered = filtered.filter(e => {
        const entryMonth = typeof e.month === 'number' ? e.month : parseInt(e.month);
        return entryMonth === this.selectedMonth;
      });
    }

    // Type filter
    if (this.selectedType !== 'all') {
      filtered = filtered.filter(e => e.transactionType === this.selectedType);
    }

    // Search filter
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        e.description.toLowerCase().includes(search) ||
        (e.receivedFrom?.toLowerCase().includes(search)) ||
        (e.paidTo?.toLowerCase().includes(search))
      );
    }

    // Category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(e => {
        const category = e.transactionType === 'receipt' ? e.receiptCategory : e.paymentCategory;
        return category === this.selectedCategory;
      });
    }

    console.log('Filtered entries count:', filtered.length);
    this.filteredEntries.set(filtered);
  }

// Optional: Add a method to reload data when year changes significantly
  onYearChange() {
    console.log('Year changed to:', this.selectedYear);
    this.applyFilters();

    // If you want to force a database reload for the specific year:
    // this.loadEntriesForYear(this.selectedYear);
  }

// Optional: Add year-specific loading for better performance
  loadEntriesForYear(year: number) {
    this.loading.set(true);
    this.error.set(null);

    // Query only entries for the selected year
    const cashbookCollection = collection(this.firestore, this.collectionData);
    const q = query(
      cashbookCollection,
      where('year', '==', year),
      orderBy('date', 'desc')
    );

    if (this.entriesSubscription) {
      this.entriesSubscription.unsubscribe();
    }

    this.entriesSubscription = collectionData(q, { idField: 'id' }).subscribe({
      next: (entries: any[]) => {
        this.allEntries.set(entries as CashbookEntry[]);
        this.applyFilters();
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading entries:', error);
        this.error.set(error.message);
        this.loading.set(false);
      }
    });
  }

  getTotalReceipts(): number {
    return this.filteredEntries()
      .filter(e => e.transactionType === 'receipt')
      .reduce((sum, e) => sum + e.amount, 0);
  }

  getTotalPayments(): number {
    return this.filteredEntries()
      .filter(e => e.transactionType === 'payment')
      .reduce((sum, e) => sum + e.amount, 0);
  }

  getNetBalance(): number {
    return this.getTotalReceipts() - this.getTotalPayments();
  }

  openDeleteModal(entry: CashbookEntry) {
    this.entryToDelete = entry;
    this.showDeleteModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.entryToDelete = null;
    this.isDeleting = false;
    document.body.style.overflow = '';
  }

  async confirmDelete() {
    if (!this.entryToDelete || !this.entryToDelete.id) return;

    this.isDeleting = true;

    try {
      const docRef = doc(this.firestore, `${this.collectionData}/${this.entryToDelete.id}`);  await deleteDoc(docRef);
      this.loadEntries();
      this.closeDeleteModal();
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry. Please try again.');
      this.isDeleting = false;
    }
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

  exportToExcel(): void {
    const entries = this.filteredEntries();

    if (entries.length === 0) {
      alert('No data to export');
      return;
    }

    const excelData: any[][] = [];

    excelData.push(['CASHBOOK TRANSACTIONS REPORT', '', '', '', '', '', '', '', '', '', '', '']);
    excelData.push([`Generated: ${new Date().toLocaleString()}`, '', '', '', '', '', '', '', '', '', '', '']);
    excelData.push([`Total Transactions: ${entries.length}`, '', '', '', '', '', '', '', '', '', '', '']);
    excelData.push([]);
    excelData.push(['SUMMARY', '', '', '', '', '', '', '', '', '', '', '']);
    excelData.push(['Total Receipts', this.getTotalReceipts(), '', '', '', '', 'Total Payments', this.getTotalPayments(), '', '', '', '']);
    excelData.push(['Net Balance', this.getNetBalance(), '', '', '', '', '', '', '', '', '', '']);
    excelData.push([]);
    excelData.push(['RECEIPTS', '', '', '', '', '', 'PAYMENTS', '', '', '', '', '']);
    excelData.push(['Date', 'Voucher No', 'From/Received', 'Description', 'NCOA', 'Amount', 'Date', 'Voucher No', 'DV No', 'To/Paid', 'Description', 'Amount']);

    entries.forEach(entry => {
      const formattedDate = this.formatDate(entry.date);

      if (entry.transactionType === 'receipt') {
        excelData.push([
          formattedDate, entry.voucherNumber, entry.receivedFrom || '', entry.description, entry.ncoaCode, entry.amount,
          '', '', '', '', '', ''
        ]);
      } else {
        excelData.push([
          '', '', '', '', '', '',
          formattedDate, entry.voucherNumber, entry.dvNumber || '', entry.paidTo || '', entry.description, entry.amount
        ]);
      }
    });

    excelData.push([]);
    excelData.push(['TOTAL RECEIPTS', '', '', '', '', this.getTotalReceipts(), 'TOTAL PAYMENTS', '', '', '', '', this.getTotalPayments()]);

    const csvContent = excelData.map(row =>
      row.map(cell => {
        if (cell === undefined || cell === null) return '';
        if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(',')
    ).join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `cashbook_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
