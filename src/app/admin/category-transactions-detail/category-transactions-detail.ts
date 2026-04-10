import { Component, input, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CashbookService } from '../../core/services/cashbook.service';
import { TransactionType, CashbookEntry } from '../../core/model/cashbook.model';

@Component({
  selector: 'app-category-transactions-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="category-transactions-container">
      <!-- Header -->
      <div class="category-header" [class.receipt-header]="transactionType() === 'receipt'"
           [class.payment-header]="transactionType() === 'payment'">
        <div class="header-content">
          <div class="header-icon">
            <i class="bi" [ngClass]="transactionType() === 'receipt' ? 'bi-cash-stack' : 'bi-credit-card-2-front'"></i>
          </div>
          <div class="header-title">
            <h2>{{ title() }}</h2>
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
                 [class.receipt-header-bg]="transactionType() === 'receipt'"
                 [class.payment-header-bg]="transactionType() === 'payment'"
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
                    <div class="summary-value" [class.receipt-value]="transactionType() === 'receipt'"
                         [class.payment-value]="transactionType() === 'payment'">
                      ₦{{ getCategoryTotal(category) | number:'1.2-2' }}
                    </div>
                  </div>
                  <div class="summary-card">
                    <div class="summary-label">Total Transactions</div>
                    <div class="summary-value">{{ getTransactionCount(category) }}</div>
                  </div>
                  <div class="summary-card">
                    <div class="summary-label">Average Amount</div>
                    <div class="summary-value" [class.receipt-value]="transactionType() === 'receipt'"
                         [class.payment-value]="transactionType() === 'payment'">
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
                          <td>{{ transaction.date | date:'dd/MM/yyyy' }}</td>
                          <td>{{ transaction.voucherNumber }}</td>
                          <td>{{ transaction.description }}</td>
                          <td><code>{{ transaction.ncoaCode }}</code></td>
                          <td>{{ transaction.bankAccount }}</td>
                          <td>
                            <span class="party-name">
                              <i class="bi" [ngClass]="transactionType() === 'receipt' ? 'bi-person-arrow-down' : 'bi-person-arrow-up'"></i>
                              {{ transactionType() === 'receipt' ? transaction.receivedFrom : transaction.paidTo }}
                            </span>
                          </td>
                          <td class="amount-col">
                            <span class="amount" [class.receipt-amount]="transactionType() === 'receipt'"
                                  [class.payment-amount]="transactionType() === 'payment'">
                              ₦{{ transaction.amount | number:'1.2-2' }}
                            </span>
                          </td>
                          <td>
                            <span class="reference-badge">
                              <i class="bi" [ngClass]="transactionType() === 'receipt' ? 'bi-receipt' : 'bi-file-text'"></i>
                              {{ transactionType() === 'receipt' ? transaction.receiptNumber : transaction.dvNumber }}
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
            <p>No transactions found for {{ year() }}</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .category-transactions-container {
      background: #f8fafc;

      overflow: hidden;
      margin-bottom: 2rem;
    }

    /* Header Styles */
    .category-header {
      padding: 2rem;
      position: relative;
      overflow: hidden;
    }

    .receipt-header {
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
    }

    .payment-header {
      background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      position: relative;
      z-index: 1;
      flex-wrap: wrap;
    }

    .header-icon {
      background: rgba(255, 255, 255, 0.2);
      width: 64px;
      height: 64px;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .header-icon i {
      font-size: 2rem;
      color: white;
    }

    .header-title {
      flex: 1;
    }

    .header-title h2 {
      margin: 0;
      color: white;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .header-title p {
      margin: 0.5rem 0 0;
      color: rgba(255, 255, 255, 0.9);
    }

    .header-stats {
      display: flex;
      gap: 1rem;
    }

    .stat-badge {
      background: rgba(255, 255, 255, 0.2);
      padding: 0.5rem 1rem;
      border-radius: 2rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: white;
      font-weight: 500;
    }

    /* Accordion List */
    .accordion-list {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .accordion-item {
      background: white;
      border-radius: 0.75rem;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .accordion-item.expanded {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .accordion-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
      background: white;
    }

    .accordion-header:hover {
      background: #f8fafc;
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
      gap: 1rem;
      flex: 1;
    }

    .category-icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      background: #f1f5f9;
    }

    .category-info {
      flex: 1;
    }

    .category-name {
      margin: 0 0 0.25rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
    }

    .category-stats {
      display: flex;
      gap: 1rem;
    }

    .category-stats .stat {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      color: #64748b;
    }

    .category-stats .stat i {
      font-size: 0.75rem;
    }

    .expand-icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.5rem;
      background: #f1f5f9;
      color: #64748b;
      transition: all 0.2s ease;
    }

    .accordion-header:hover .expand-icon {
      background: #e2e8f0;
    }

    /* Accordion Content */
    .accordion-content {
      padding: 1.5rem;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      animation: slideDown 0.3s ease-out;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Content Summary */
    .content-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .summary-card {
      background: white;
      padding: 1rem;
      border-radius: 0.75rem;
      text-align: center;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .summary-label {
      font-size: 0.75rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.5rem;
    }

    .summary-value {
      font-size: 1.25rem;
      font-weight: 700;
    }

    .receipt-value {
      color: #059669;
    }

    .payment-value {
      color: #dc2626;
    }

    /* Table Styles */
    .table-wrapper {
      overflow-x: auto;
      border-radius: 0.75rem;
      border: 1px solid #e2e8f0;
      background: white;
    }

    .transactions-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
    }

    .transactions-table th {
      padding: 0.875rem 1rem;
      text-align: left;
      background: #f8fafc;
      color: #475569;
      font-weight: 600;
      border-bottom: 2px solid #e2e8f0;
    }

    .transactions-table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }

    .transaction-row:hover {
      background: #f8fafc;
    }

    .amount-col {
      text-align: right;
    }

    .amount {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 0.5rem;
      font-weight: 600;
      font-family: 'Courier New', monospace;
    }

    .receipt-amount {
      background: #f0fdf4;
      color: #059669;
    }

    .payment-amount {
      background: #fef2f2;
      color: #dc2626;
    }

    .party-name {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      color: #334155;
    }

    .reference-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.5rem;
      background: #f1f5f9;
      border-radius: 0.5rem;
      font-size: 0.75rem;
      font-family: monospace;
    }

    code {
      background: #f1f5f9;
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
    }

    /* Footer */
    .footer-row {
      background: #f8fafc;
      border-top: 2px solid #e2e8f0;
      font-weight: 700;
    }

    .footer-label {
      text-align: right;
      font-weight: 700;
      color: #1e293b;
    }

    .footer-amount {
      text-align: right;
      font-weight: 700;
      color: #3b82f6;
      font-size: 1rem;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 0.75rem;
    }

    .empty-state i {
      font-size: 4rem;
      color: #cbd5e1;
      margin-bottom: 1rem;
    }

    .empty-state h4 {
      margin: 0 0 0.5rem;
      color: #475569;
    }

    .empty-state p {
      margin: 0;
      color: #94a3b8;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .category-header {
        padding: 1.5rem;
      }

      .header-content {
        flex-direction: column;
        text-align: center;
      }

      .header-stats {
        justify-content: center;
      }

      .accordion-list {
        padding: 0.75rem;
      }

      .accordion-header {
        padding: 0.75rem 1rem;
      }

      .header-left {
        gap: 0.75rem;
      }

      .category-icon-wrapper {
        width: 40px;
        height: 40px;
        font-size: 1.25rem;
      }

      .category-name {
        font-size: 0.875rem;
      }

      .category-stats {
        flex-direction: column;
        gap: 0.25rem;
      }

      .accordion-content {
        padding: 1rem;
      }

      .content-summary {
        grid-template-columns: 1fr;
      }

      .transactions-table th,
      .transactions-table td {
        padding: 0.5rem;
        font-size: 0.75rem;
      }
    }
  `]
})
export class CategoryTransactionsDetailComponent {
  private cashbookService = inject(CashbookService);

  transactionType = input.required<TransactionType>();
  title = input.required<string>();
  year = input<number>(new Date().getFullYear());

  allEntries: CashbookEntry[] = [];
  expandedCategory = signal<string | null>(null);
  categories = signal<string[]>([]);

  constructor() {
    effect(() => {
      this.loadData();
    });
  }

  loadData() {
    this.cashbookService.getEntriesByYear(this.year()).subscribe({
      next: (entries: CashbookEntry[]) => {
        this.allEntries = entries;
        this.processCategories();
      },
      error: (error: any) => {
        console.error('Error loading entries:', error);
      }
    });
  }

  processCategories() {
    const filteredEntries = this.allEntries.filter(
      e => e.transactionType === this.transactionType() && e.year === this.year()
    );

    const categorySet = new Set<string>();

    filteredEntries.forEach(entry => {
      const category = this.transactionType() === 'receipt'
        ? entry.receiptCategory
        : entry.paymentCategory;
      if (category) {
        categorySet.add(category);
      }
    });

    this.categories.set(Array.from(categorySet).sort());
  }

  toggleCategory(category: string) {
    if (this.expandedCategory() === category) {
      this.expandedCategory.set(null);
    } else {
      this.expandedCategory.set(category);
    }
  }

  getCategoryTransactions(category: string): CashbookEntry[] {
    return this.allEntries.filter(entry => {
      const entryCategory = this.transactionType() === 'receipt'
        ? entry.receiptCategory
        : entry.paymentCategory;
      return entry.transactionType === this.transactionType() &&
        entry.year === this.year() &&
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

  totalTransactions(): number {
    return this.allEntries.filter(e => e.transactionType === this.transactionType() && e.year === this.year()).length;
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
}
