import {Component, signal, computed, inject, OnInit, Input} from '@angular/core';
import {DatePipe, NgClass, UpperCasePipe, CurrencyPipe, DecimalPipe} from '@angular/common';
import { CashbookEntry, TransactionType } from '../../../app/core/model/cashbook.model';
import { Firestore, collection, collectionData, query, orderBy } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-epaymentcategories',
  standalone: true,
  imports: [DatePipe, NgClass, UpperCasePipe, CurrencyPipe, DecimalPipe],
  template: `
    <div class="category-transactions-container">
      <!-- Header -->
      <div class="category-header" [class.receipt-header]="transactionType === 'receipt'"
           [class.payment-header]="transactionType === 'payment'">
        <div class="header-content">
          <div class="header-icon">
            <i class="bi" [ngClass]="transactionType === 'receipt' ? 'bi-cash-stack' : 'bi-credit-card-2-front'"></i>
          </div>
          <div class="header-title">
            <h2>{{ title }}</h2>
            <p>Click on any category to expand and view transactions</p>
          </div>
          <div class="header-stats">
            <div class="stat-badge">
              <i class="bi bi-folder2-open"></i>
              <span>{{ categories().length }} Categories</span>
            </div>
            <div class="stat-badge">
              <i class="bi bi-receipt"></i>
              <span>{{ totalTransactions() }} Transactions</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Accordion List -->
      <div class="accordion-list">
        @for (category of categories(); track category) {
          <div class="accordion-item" [class.expanded]="expandedCategory() === category">
            <div class="accordion-header"
                 [class.receipt-header-bg]="transactionType === 'receipt'"
                 [class.payment-header-bg]="transactionType === 'payment'"
                 (click)="toggleCategory(category)">
              <div class="header-left">
                <div class="category-icon-wrapper">
                  <span class="category-icon">{{ getCategoryIcon(category) }}</span>
                </div>
                <div class="category-info">
                  <h4 class="category-name">{{ category }}</h4>
                  <div class="category-stats">
                    <span class="stat">
                      <i class="bi bi-receipt"></i>
                      {{ getTransactionCount(category) }} transactions
                    </span>
                    <span class="stat">
                      <i class="bi bi-currency-dollar"></i>
                      ₦{{ getCategoryTotal(category) | number:'1.2-2' }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="header-right">
                <div class="expand-icon">
                  <i class="bi" [ngClass]="expandedCategory() === category ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                </div>
              </div>
            </div>

            <!-- Expanded Content -->
            @if (expandedCategory() === category) {
              <div class="accordion-content">
                <!-- Summary Cards -->
                <div class="content-summary">
                  <div class="summary-card">
                    <div class="summary-label">Total Amount</div>
                    <div class="summary-value" [class.receipt-value]="transactionType === 'receipt'"
                         [class.payment-value]="transactionType === 'payment'">
                      ₦{{ getCategoryTotal(category) | number:'1.2-2' }}
                    </div>
                  </div>
                  <div class="summary-card">
                    <div class="summary-label">Total Transactions</div>
                    <div class="summary-value">{{ getTransactionCount(category) }}</div>
                  </div>
                  <div class="summary-card">
                    <div class="summary-label">Average Amount</div>
                    <div class="summary-value" [class.receipt-value]="transactionType === 'receipt'"
                         [class.payment-value]="transactionType === 'payment'">
                      ₦{{ getCategoryTotal(category) / getTransactionCount(category) | number:'1.2-2' }}
                    </div>
                  </div>
                </div>

                <!-- Transactions Table -->
                <div class="table-wrapper">
                  <table class="transactions-table">
                    <thead>
                    <tr>
                      <th>Date</th>
                      <th>Voucher No</th>
                      <th>Description</th>
                      <th>NCOA Code</th>
                      <th>Bank</th>
                      <th>Party</th>
                      <th class="amount-col">Amount</th>
                      <th>Reference</th>
                    </tr>
                    </thead>
                    <tbody>
                      @for (transaction of getCategoryTransactions(category); track transaction.id) {
                        <tr class="transaction-row">
                          <td>{{ formatDate(transaction.date) }}</td>
                          <td>{{ transaction.voucherNumber }}</td>
                          <td>{{ transaction.description }}</td>
                          <td><code>{{ transaction.ncoaCode }}</code></td>
                          <td>{{ transaction.bankAccount }}</td>
                          <td>
                            <span class="party-name">
                              <i class="bi" [ngClass]="transactionType === 'receipt' ? 'bi-person-arrow-down' : 'bi-person-arrow-up'"></i>
                              {{ transactionType === 'receipt' ? transaction.receivedFrom : transaction.paidTo }}
                            </span>
                          </td>
                          <td class="amount-col">
                            <span class="amount" [class.receipt-amount]="transactionType === 'receipt'"
                                  [class.payment-amount]="transactionType === 'payment'">
                              ₦{{ transaction.amount | number:'1.2-2' }}
                            </span>
                          </td>
                          <td>
                            <span class="reference-badge">
                              <i class="bi" [ngClass]="transactionType === 'receipt' ? 'bi-receipt' : 'bi-file-text'"></i>
                              {{ transactionType === 'receipt' ? transaction.receiptNumber : transaction.dvNumber }}
                            </span>
                          </td>
                        </tr>
                      }
                    </tbody>
                    <tfoot>
                    <tr class="footer-row">
                      <td colspan="6" class="footer-label">Total</td>
                      <td class="footer-amount">
                        ₦{{ getCategoryTotal(category) | number:'1.2-2' }}
                      </td>
                      <td></td>
                    </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            }
          </div>
        }

        <!-- Empty State -->
        @if (categories().length === 0) {
          <div class="empty-state">
            <i class="bi bi-folder2-open"></i>
            <h4>No Categories Found</h4>
            <p>No transactions found for {{ year }}</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .category-transactions-container {
      padding: 20px;
      background: #f8f9fa;
      min-height: 100vh;
    }

    .category-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 15px;
      padding: 20px;
      margin-bottom: 30px;
      color: white;
    }

    .receipt-header {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    }

    .payment-header {
      background: linear-gradient(135deg, #ee0979 0%, #ff6a00 100%);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }

    .header-icon i {
      font-size: 48px;
    }

    .header-title h2 {
      margin: 0 0 5px 0;
      font-size: 24px;
    }

    .header-title p {
      margin: 0;
      opacity: 0.9;
      font-size: 14px;
    }

    .header-stats {
      display: flex;
      gap: 15px;
    }

    .stat-badge {
      background: rgba(255, 255, 255, 0.2);
      padding: 8px 15px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .accordion-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .accordion-item {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .accordion-item.expanded {
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    .accordion-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .accordion-header:hover {
      background: #f8f9fa;
    }

    .receipt-header-bg:hover {
      background: #f0fdf4;
    }

    .payment-header-bg:hover {
      background: #fef2f2;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 15px;
      flex: 1;
    }

    .category-icon-wrapper {
      width: 50px;
      height: 50px;
      background: #f0f0f0;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .category-icon {
      font-size: 28px;
    }

    .category-info {
      flex: 1;
    }

    .category-name {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
    }

    .category-stats {
      display: flex;
      gap: 20px;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 14px;
      color: #666;
    }

    .expand-icon i {
      font-size: 20px;
      color: #999;
    }

    .accordion-content {
      padding: 20px;
      border-top: 1px solid #e0e0e0;
      background: #fafafa;
    }

    .content-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 25px;
    }

    .summary-card {
      background: white;
      padding: 15px;
      border-radius: 10px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .summary-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 8px;
    }

    .summary-value {
      font-size: 24px;
      font-weight: 600;
    }

    .receipt-value {
      color: #10b981;
    }

    .payment-value {
      color: #ef4444;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .transactions-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 10px;
      overflow: hidden;
    }

    .transactions-table th,
    .transactions-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }

    .transactions-table th {
      background: #f8f9fa;
      font-weight: 600;
      font-size: 13px;
      color: #333;
    }

    .transaction-row:hover {
      background: #f9f9f9;
    }

    .amount-col {
      text-align: right;
    }

    .amount {
      font-weight: 600;
    }

    .receipt-amount {
      color: #10b981;
    }

    .payment-amount {
      color: #ef4444;
    }

    .party-name {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .reference-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 8px;
      background: #f0f0f0;
      border-radius: 6px;
      font-size: 12px;
      font-family: monospace;
    }

    .footer-row {
      background: #f8f9fa;
      font-weight: 600;
    }

    .footer-label {
      text-align: right;
    }

    .footer-amount {
      font-size: 16px;
      font-weight: 700;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 12px;
    }

    .empty-state i {
      font-size: 64px;
      color: #ccc;
      margin-bottom: 20px;
    }

    .empty-state h4 {
      margin: 0 0 10px 0;
      color: #666;
    }

    .empty-state p {
      margin: 0;
      color: #999;
    }
  `]
})
export class Epaymentcategories implements OnInit {
  private firestore = inject(Firestore);
  private subscription: Subscription | null = null;
  @Input() collectionData: string = 'expense';
  // Hardcoded values
  title: string = 'Payment Categories';
  year: number = 2026;
  transactionType: TransactionType = 'payment';

  // Data from Firestore
  private allEntries = signal<CashbookEntry[]>([]);

  // State
  expandedCategory = signal<string | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Computed signals
  categories = computed(() => {
    const entries = this.allEntries();
    const filteredEntries = entries.filter(
      e => e.transactionType === this.transactionType && e.year === this.year
    );

    const categorySet = new Set<string>();

    filteredEntries.forEach(entry => {
      const category = this.transactionType === 'receipt'
        ? entry.receiptCategory
        : entry.paymentCategory;
      if (category) {
        categorySet.add(category);
      }
    });

    return Array.from(categorySet).sort();
  });

  totalTransactions = computed(() => {
    const entries = this.allEntries();
    return entries.filter(
      e => e.transactionType === this.transactionType && e.year === this.year
    ).length;
  });

  ngOnInit() {
    this.loadEntries();
  }

  ngOnDestroy() {
    // Clean up subscription to prevent memory leaks
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadEntries() {
    this.loading.set(true);
    this.error.set(null);

    // Reference to the 'cashbook_entries' collection
    const cashbookCollection = collection(this.firestore, this.collectionData);
    const q = query(cashbookCollection, orderBy('date', 'desc'));

    this.subscription = collectionData(q, { idField: 'id' }).subscribe({
      next: (entries: any[]) => {
        this.allEntries.set(entries as CashbookEntry[]);
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading entries:', error);
        this.error.set(error.message);
        this.loading.set(false);
      }
    });
  }

  // Method to reload data for a different year
  setYear(newYear: number) {
    this.year = newYear;
    // No need to reload data, just recompute signals
  }

  // Method to change transaction type
  setTransactionType(type: TransactionType) {
    this.transactionType = type;
    this.title = type === 'receipt' ? 'Receipt Categories' : 'Payment Categories';
  }

  toggleCategory(category: string) {
    if (this.expandedCategory() === category) {
      this.expandedCategory.set(null);
    } else {
      this.expandedCategory.set(category);
    }
  }

  getCategoryTransactions(category: string): CashbookEntry[] {
    const entries = this.allEntries();
    return entries.filter(entry => {
      const entryCategory = this.transactionType === 'receipt'
        ? entry.receiptCategory
        : entry.paymentCategory;
      return entry.transactionType === this.transactionType &&
        entry.year === this.year &&
        entryCategory === category;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  getCategoryTotal(category: string): number {
    const transactions = this.getCategoryTransactions(category);
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  }

  getTransactionCount(category: string): number {
    return this.getCategoryTransactions(category).length;
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Tax Revenue': '💰',
      'Fees & Charges': '📋',
      'Licenses': '📜',
      'Fines & Penalties': '⚖️',
      'Grants & Aids': '🎁',
      'Other Receipts': '📦',
      'Personnel Services': '👥',
      'Maintenance & Operating': '🔧',
      'Financial Expenses': '💳',
      'Capital Outlay': '🏗️',
      'Debt Service': '📉',
      'Other Payments': '📦'
    };
    return icons[category] || '📌';
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
}
