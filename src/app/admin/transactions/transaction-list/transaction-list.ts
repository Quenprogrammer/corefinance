// src/app/features/transactions/transaction-list.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import {CommonModule, CurrencyPipe} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { TransactionService } from '../../../core/services/transaction.service';
import { MasterDataService } from '../../../core/services/master-data.service';
import { Transaction, TransactionFilter } from '../../../core/model/transaction.model';


import {ConfirmationModalComponent} from '../../../core/shared/components/confirmation-modal.component';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,

    ConfirmationModalComponent,
    CurrencyPipe,
    ConfirmationModalComponent
  ],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Transactions</h1>
          <p class="text-gray-600 mt-1">Manage all cash book transactions</p>
        </div>
        <a
          routerLink="/transactions/new"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          New Transaction
        </a>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow mb-6 p-4">
        <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              [(ngModel)]="filters.startDate"
              (change)="applyFilters()"
              class="w-full px-3 py-2 border rounded-md"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              [(ngModel)]="filters.endDate"
              (change)="applyFilters()"
              class="w-full px-3 py-2 border rounded-md"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              [(ngModel)]="filters.transactionType"
              (change)="applyFilters()"
              class="w-full px-3 py-2 border rounded-md"
            >
              <option value="">All</option>
              <option value="RECEIPT">Receipt</option>
              <option value="PAYMENT">Payment</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              [(ngModel)]="filters.category"
              (change)="applyFilters()"
              class="w-full px-3 py-2 border rounded-md"
            >
              <option value="">All</option>
              <option *ngFor="let cat of categories" [value]="cat.code">{{ cat.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              [(ngModel)]="filters.status"
              (change)="applyFilters()"
              class="w-full px-3 py-2 border rounded-md"
            >
              <option value="">All</option>
              <option *ngFor="let status of statuses" [value]="status.value">{{ status.label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              [(ngModel)]="filters.searchTerm"
              (input)="applyFilters()"
              placeholder="Voucher, payee, description..."
              class="w-full px-3 py-2 border rounded-md"
            >
          </div>
        </div>
        <div class="flex justify-between items-center mt-4">
          <div class="text-sm text-gray-500">
            Showing {{ filteredTransactions.length }} of {{ allTransactions.length }} transactions
          </div>
          <button
            *ngIf="hasActiveFilters"
            (click)="clearFilters()"
            class="text-blue-600 hover:text-blue-800 text-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <!-- Loading State -->
     <h1>loading</h1>
      <!-- Transactions Table -->
      <div *ngIf="!isLoading" class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <input type="checkbox" (change)="toggleSelectAll($event)" [checked]="isAllSelected">
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Voucher No</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payee</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr *ngFor="let transaction of paginatedTransactions" class="hover:bg-gray-50">
                <td class="px-4 py-3">
                  <input type="checkbox" [(ngModel)]="selectedIds[transaction.id!]" (change)="updateSelection()">
                </td>
                <td class="px-4 py-3 text-sm text-gray-900">{{ transaction.transactionDate | date:'dd/MM/yyyy' }}</td>
                <td class="px-4 py-3 text-sm font-mono text-gray-600">{{ transaction.voucherNo }}</td>
                <td class="px-4 py-3 text-sm text-gray-900">{{ transaction.payeeName | slice:0:25 }}</td>
                <td class="px-4 py-3 text-sm text-gray-500">{{ transaction.description | slice:0:30 }}</td>
                <td class="px-4 py-3 text-sm">
                  <span class="px-2 py-1 text-xs rounded-full" [ngClass]="getCategoryClass(transaction.category)">
                    {{ transaction.category }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-right font-mono" [class.text-green-600]="transaction.transactionType === 'RECEIPT'" [class.text-red-600]="transaction.transactionType === 'PAYMENT'">
                  {{ transaction.amount | currency }}
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="inline-flex px-2 py-1 text-xs rounded-full" [ngClass]="getStatusClass(transaction.status)">
                    {{ transaction.status }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <button
                      (click)="viewTransaction(transaction.id!)"
                      class="text-blue-600 hover:text-blue-800"
                      title="View"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </button>
                    <button
                      *ngIf="transaction.status === 'PENDING'"
                      (click)="approveTransaction(transaction.id!)"
                      class="text-green-600 hover:text-green-800"
                      title="Approve"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </button>
                    <button
                      (click)="deleteTransaction(transaction.id!)"
                      class="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredTransactions.length === 0">
                <td colspan="9" class="px-4 py-8 text-center text-gray-500">No transactions found</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="px-4 py-3 border-t flex justify-between items-center">
          <div class="text-sm text-gray-500">
            Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, filteredTransactions.length) }} of {{ filteredTransactions.length }} entries
          </div>
          <div class="flex gap-2">
            <button
              (click)="previousPage()"
              [disabled]="currentPage === 1"
              class="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span class="px-3 py-1">Page {{ currentPage }} of {{ totalPages }}</span>
            <button
              (click)="nextPage()"
              [disabled]="currentPage === totalPages"
              class="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>

        <!-- Bulk Actions -->
        <div *ngIf="selectedCount > 0" class="px-4 py-3 bg-gray-50 border-t flex justify-between items-center">
          <div class="text-sm text-gray-600">
            {{ selectedCount }} transaction(s) selected
          </div>
          <div class="flex gap-2">
            <button
              (click)="bulkApprove()"
              class="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              Approve Selected
            </button>
            <button
              (click)="bulkDelete()"
              class="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
            >
              Delete Selected
            </button>
          </div>
        </div>
      </div>

      <!-- Confirmation Modal -->
      <app-confirmation-modal
        *ngIf="showModal"
        [title]="modalTitle"
        [message]="modalMessage"
        [confirmText]="modalConfirmText"
        [isDanger]="modalIsDanger"
        (confirm)="confirmAction()"
        (cancel)="cancelAction()"
      ></app-confirmation-modal>
    </div>
  `
})
export class TransactionListComponent implements OnInit, OnDestroy {
  private transactionService = inject(TransactionService);
  private masterDataService = inject(MasterDataService);

  isLoading = true;
  allTransactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  paginatedTransactions: Transaction[] = [];
  categories: any[] = [];
  statuses: any[] = [];

  filters: TransactionFilter = {
    startDate: undefined,
    endDate: undefined,
    transactionType: undefined,
    category: undefined,
    status: undefined,
    searchTerm: ''
  };

  selectedIds: { [key: string]: boolean } = {};
  currentPage = 1;
  pageSize = 20;

  showModal = false;
  modalTitle = '';
  modalMessage = '';
  modalConfirmText = 'Confirm';
  modalIsDanger = false;
  pendingAction: (() => void) | null = null;

  Math = Math;

  private subscriptions: Subscription = new Subscription();

  ngOnInit(): void {
    this.loadData();
    this.categories = this.masterDataService.getPaymentCategories();
    this.statuses = this.masterDataService.getStatuses();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadData(): void {
    this.subscriptions.add(
      this.transactionService.getAllTransactions().subscribe(transactions => {
        this.allTransactions = transactions;
        this.applyFilters();
        this.isLoading = false;
      })
    );
  }

  applyFilters(): void {
    this.subscriptions.add(
      this.transactionService.searchTransactions(this.filters).subscribe(transactions => {
        this.filteredTransactions = transactions;
        this.currentPage = 1;
        this.updatePaginatedTransactions();
        this.selectedIds = {};
      })
    );
  }

  updatePaginatedTransactions(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedTransactions = this.filteredTransactions.slice(start, end);
  }

  clearFilters(): void {
    this.filters = {
      startDate: undefined,
      endDate: undefined,
      transactionType: undefined,
      category: undefined,
      status: undefined,
      searchTerm: ''
    };
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return !!(this.filters.startDate || this.filters.endDate || this.filters.transactionType ||
      this.filters.category || this.filters.status || this.filters.searchTerm);
  }

  toggleSelectAll(event: any): void {
    const checked = event.target.checked;
    this.paginatedTransactions.forEach(t => {
      if (t.id) {
        this.selectedIds[t.id] = checked;
      }
    });
  }

  get isAllSelected(): boolean {
    if (this.paginatedTransactions.length === 0) return false;
    return this.paginatedTransactions.every(t => t.id && this.selectedIds[t.id]);
  }

  get selectedCount(): number {
    return Object.values(this.selectedIds).filter(v => v).length;
  }

  updateSelection(): void {
    // Selection updated
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedTransactions();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedTransactions();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.filteredTransactions.length / this.pageSize);
  }

  viewTransaction(id: string): void {
    window.location.href = `/transactions/${id}`;
  }

  approveTransaction(id: string): void {
    this.modalTitle = 'Approve Transaction';
    this.modalMessage = 'Are you sure you want to approve this transaction? This action cannot be undone.';
    this.modalConfirmText = 'Approve';
    this.modalIsDanger = false;
    this.pendingAction = () => this.doApprove(id);
    this.showModal = true;
  }

  private async doApprove(id: string): Promise<void> {
    try {
      await this.transactionService.approveTransaction(id, 'current-user-id');
      this.loadData();
    } catch (error) {
      console.error('Error approving transaction:', error);
      alert('Failed to approve transaction');
    }
  }

  deleteTransaction(id: string): void {
    this.modalTitle = 'Delete Transaction';
    this.modalMessage = 'Are you sure you want to delete this transaction? This will void the transaction.';
    this.modalConfirmText = 'Delete';
    this.modalIsDanger = true;
    this.pendingAction = () => this.doDelete(id);
    this.showModal = true;
  }

  private async doDelete(id: string): Promise<void> {
    try {
      await this.transactionService.deleteTransaction(id, 'Deleted by user');
      this.loadData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction');
    }
  }

  bulkApprove(): void {
    const selectedIds = Object.keys(this.selectedIds).filter(id => this.selectedIds[id]);
    if (selectedIds.length === 0) return;

    this.modalTitle = 'Bulk Approve';
    this.modalMessage = `Are you sure you want to approve ${selectedIds.length} transaction(s)?`;
    this.modalConfirmText = 'Approve All';
    this.modalIsDanger = false;
    this.pendingAction = () => this.doBulkApprove(selectedIds);
    this.showModal = true;
  }

  private async doBulkApprove(ids: string[]): Promise<void> {
    try {
      await this.transactionService.bulkApproveTransactions(ids, 'current-user-id');
      this.loadData();
    } catch (error) {
      console.error('Error bulk approving transactions:', error);
      alert('Failed to approve transactions');
    }
  }

  bulkDelete(): void {
    const selectedIds = Object.keys(this.selectedIds).filter(id => this.selectedIds[id]);
    if (selectedIds.length === 0) return;

    this.modalTitle = 'Bulk Delete';
    this.modalMessage = `Are you sure you want to delete ${selectedIds.length} transaction(s)? This action cannot be undone.`;
    this.modalConfirmText = 'Delete All';
    this.modalIsDanger = true;
    this.pendingAction = () => this.doBulkDelete(selectedIds);
    this.showModal = true;
  }

  private async doBulkDelete(ids: string[]): Promise<void> {
    try {
      for (const id of ids) {
        await this.transactionService.deleteTransaction(id, 'Bulk delete');
      }
      this.loadData();
    } catch (error) {
      console.error('Error bulk deleting transactions:', error);
      alert('Failed to delete transactions');
    }
  }

  confirmAction(): void {
    if (this.pendingAction) {
      this.pendingAction();
    }
    this.showModal = false;
    this.pendingAction = null;
  }

  cancelAction(): void {
    this.showModal = false;
    this.pendingAction = null;
  }

  getStatusClass(status: string): string {
    const statusConfig = this.statuses.find(s => s.value === status);
    return statusConfig ? `${statusConfig.bgColor} ${statusConfig.color}` : 'bg-gray-100 text-gray-800';
  }

  getCategoryClass(category: string): string {
    const colors: { [key: string]: string } = {
      SALARY: 'bg-purple-100 text-purple-800',
      FSA: 'bg-indigo-100 text-indigo-800',
      SECURITY: 'bg-blue-100 text-blue-800',
      OVERTIME: 'bg-orange-100 text-orange-800',
      ALLOWANCE: 'bg-pink-100 text-pink-800',
      BANK_CHARGE: 'bg-gray-100 text-gray-800',
      CRF: 'bg-green-100 text-green-800',
      INTERACCOUNT: 'bg-teal-100 text-teal-800',
      PERSONAL_ADV: 'bg-yellow-100 text-yellow-800',
      FSA_RECEIPT: 'bg-emerald-100 text-emerald-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  }
}
