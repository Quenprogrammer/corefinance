import { Injectable, inject, signal, computed } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch
} from '@angular/fire/firestore';
import { Observable, from, map, catchError, throwError } from 'rxjs';
import { CashbookEntry, FilterCriteria, DashboardStats } from '../model/cashbook.model';

// Define missing interfaces
export interface MonthlyReport {
  month: number;
  monthName: string;
  receipts: number;
  payments: number;
  balance: number;
  openingBalance: number;
  closingBalance: number;
}

export interface CategoryAnalysis {
  category: string;
  amount: number;
  percentage: number;
  count: number;
  transactions: CashbookEntry[];
}

@Injectable({
  providedIn: 'root'
})
export class CashbookService {
  private firestore = inject(Firestore);
  private cashbookCollection = collection(this.firestore, 'cashbook_entries');

  // State management with signals
  private entriesSignal = signal<CashbookEntry[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private filterSignal = signal<FilterCriteria>({});

  // Computed signals
  public entries = this.entriesSignal.asReadonly();
  public loading = this.loadingSignal.asReadonly();
  public error = this.errorSignal.asReadonly();

  public filteredEntries = computed(() => {
    const entries = this.entriesSignal();
    const filter = this.filterSignal();

    return entries.filter(entry => {
      if (filter.transactionType && filter.transactionType !== 'all' && entry.transactionType !== filter.transactionType) {
        return false;
      }
      if (filter.month && entry.month !== filter.month) {
        return false;
      }
      if (filter.year && entry.year !== filter.year) {
        return false;
      }
      if (filter.category) {
        const category = entry.transactionType === 'receipt' ? entry.receiptCategory : entry.paymentCategory;
        if (category !== filter.category) return false;
      }
      if (filter.searchTerm) {
        const search = filter.searchTerm.toLowerCase();
        return entry.description.toLowerCase().includes(search) ||
          (entry.receivedFrom?.toLowerCase().includes(search)) ||
          (entry.paidTo?.toLowerCase().includes(search));
      }
      if (filter.startDate && filter.endDate) {
        const entryDate = new Date(entry.date);
        return entryDate >= filter.startDate && entryDate <= filter.endDate;
      }
      return true;
    });
  });

  public dashboardStats = computed((): DashboardStats => {
    const entries = this.entriesSignal();
    const receipts = entries.filter((e: CashbookEntry) => e.transactionType === 'receipt');
    const payments = entries.filter((e: CashbookEntry) => e.transactionType === 'payment');

    const totalReceipts = receipts.reduce((sum: number, e: CashbookEntry) => sum + e.amount, 0);
    const totalPayments = payments.reduce((sum: number, e: CashbookEntry) => sum + e.amount, 0);

    // Calculate current balance (assuming entries are in order)
    let balance = 0;
    entries.forEach((entry: CashbookEntry) => {
      if (entry.transactionType === 'receipt') {
        balance += entry.amount;
      } else {
        balance -= entry.amount;
      }
    });

    return {
      openingBalance: 0,
      totalReceipts,
      totalPayments,
      currentBalance: balance,
      receiptCount: receipts.length,
      paymentCount: payments.length,
      averageTransaction: entries.length > 0 ? (totalReceipts + totalPayments) / entries.length : 0
    };
  });

  constructor() {
    this.loadEntries();
  }

  loadEntries(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const q = query(this.cashbookCollection, orderBy('date', 'desc'));

    collectionData(q, { idField: 'id' }).pipe(
      map((entries: any[]) => entries as CashbookEntry[]),
      catchError((error: any) => {
        this.errorSignal.set(error.message);
        return throwError(() => error);
      })
    ).subscribe({
      next: (entries: CashbookEntry[]) => {
        this.entriesSignal.set(entries);
        this.loadingSignal.set(false);
      },
      error: (error: any) => {
        this.loadingSignal.set(false);
        console.error('Error loading entries:', error);
      }
    });
  }

  addEntry(entry: Omit<CashbookEntry, 'id' | 'createdAt' | 'updatedAt'>): Observable<string> {
    this.loadingSignal.set(true);

    const now = new Date();
    const newEntry: Partial<CashbookEntry> = {
      ...entry,
      createdAt: now,
      updatedAt: now,
      createdBy: 'current-user' // Replace with actual user from auth
    };

    return from(addDoc(this.cashbookCollection, newEntry)).pipe(
      map((docRef: any) => {
        this.loadEntries(); // Reload to update balance
        this.loadingSignal.set(false);
        return docRef.id;
      }),
      catchError((error: any) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(error.message);
        return throwError(() => error);
      })
    );
  }

  updateEntry(id: string, updates: Partial<CashbookEntry>): Observable<void> {
    this.loadingSignal.set(true);
    const docRef = doc(this.firestore, `cashbook_entries/${id}`);

    return from(updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    })).pipe(
      map(() => {
        this.loadEntries();
        this.loadingSignal.set(false);
      }),
      catchError((error: any) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(error.message);
        return throwError(() => error);
      })
    );
  }

  deleteEntry(id: string): Observable<void> {
    this.loadingSignal.set(true);
    const docRef = doc(this.firestore, `cashbook_entries/${id}`);

    return from(deleteDoc(docRef)).pipe(
      map(() => {
        this.loadEntries();
        this.loadingSignal.set(false);
      }),
      catchError((error: any) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(error.message);
        return throwError(() => error);
      })
    );
  }

  deleteMultipleEntries(ids: string[]): Observable<void> {
    this.loadingSignal.set(true);
    const batch = writeBatch(this.firestore);

    ids.forEach((id: string) => {
      const docRef = doc(this.firestore, `cashbook_entries/${id}`);
      batch.delete(docRef);
    });

    return from(batch.commit()).pipe(
      map(() => {
        this.loadEntries();
        this.loadingSignal.set(false);
      }),
      catchError((error: any) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(error.message);
        return throwError(() => error);
      })
    );
  }

  setFilter(criteria: Partial<FilterCriteria>): void {
    this.filterSignal.set({ ...this.filterSignal(), ...criteria });
  }

  clearFilter(): void {
    this.filterSignal.set({});
  }

  getMonthlyReport(year: number): Observable<MonthlyReport[]> {
    // Convert signal to observable
    return new Observable<MonthlyReport[]>((observer) => {
      const entries = this.entriesSignal();
      const months = Array.from({ length: 12 }, (_, i) => i + 1);
      const report = months.map((month: number) => {
        const monthEntries = entries.filter((e: CashbookEntry) => e.year === year && e.month === month);
        const receipts = monthEntries.filter((e: CashbookEntry) => e.transactionType === 'receipt')
          .reduce((sum: number, e: CashbookEntry) => sum + e.amount, 0);
        const payments = monthEntries.filter((e: CashbookEntry) => e.transactionType === 'payment')
          .reduce((sum: number, e: CashbookEntry) => sum + e.amount, 0);

        return {
          month,
          monthName: new Date(year, month - 1).toLocaleString('default', { month: 'long' }),
          receipts,
          payments,
          balance: receipts - payments,
          openingBalance: 0,
          closingBalance: receipts - payments
        };
      });
      observer.next(report);
      observer.complete();
    });
  }

  getCategoryAnalysis(transactionType: 'receipt' | 'payment'): Observable<CategoryAnalysis[]> {
    // Convert signal to observable
    return new Observable<CategoryAnalysis[]>((observer) => {
      const entries = this.entriesSignal();
      const filtered = entries.filter((e: CashbookEntry) => e.transactionType === transactionType);
      const total = filtered.reduce((sum: number, e: CashbookEntry) => sum + e.amount, 0);

      const categoryMap = new Map<string, { amount: number; count: number; transactions: CashbookEntry[] }>();

      filtered.forEach((entry: CashbookEntry) => {
        const category = transactionType === 'receipt' ? entry.receiptCategory! : entry.paymentCategory!;
        if (categoryMap.has(category)) {
          const existing = categoryMap.get(category)!;
          existing.amount += entry.amount;
          existing.count++;
          existing.transactions.push(entry);
        } else {
          categoryMap.set(category, {
            amount: entry.amount,
            count: 1,
            transactions: [entry]
          });
        }
      });

      const analysis = Array.from(categoryMap.entries())
        .map(([category, data]) => ({
          category,
          amount: data.amount,
          percentage: total > 0 ? (data.amount / total) * 100 : 0,
          count: data.count,
          transactions: data.transactions
        }))
        .sort((a: CategoryAnalysis, b: CategoryAnalysis) => b.amount - a.amount);

      observer.next(analysis);
      observer.complete();
    });
  }

  exportToCSV(entries: CashbookEntry[]): string {
    const headers = [
      'Date', 'Voucher No', 'Type', 'Description', 'NCOA Code', 'Bank',
      'Receipt No', 'Received From', 'DV No', 'Paid To', 'Amount', 'Balance'
    ];

    const rows = entries.map((entry: CashbookEntry) => [
      new Date(entry.date).toLocaleDateString(),
      entry.voucherNumber,
      entry.transactionType.toUpperCase(),
      entry.description,
      entry.ncoaCode,
      entry.bankAccount,
      entry.receiptNumber || '',
      entry.receivedFrom || '',
      entry.dvNumber || '',
      entry.paidTo || '',
      entry.amount,
      entry.balance || ''
    ]);

    const csvContent = [headers, ...rows].map((row: any[]) => row.join(',')).join('\n');
    return csvContent;
  }

  printReport(entries: CashbookEntry[], stats: DashboardStats): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const headers = [
      'Date', 'Voucher No', 'Type', 'Description', 'NCOA Code', 'Bank',
      'Receipt No', 'Received From', 'DV No', 'Paid To', 'Amount', 'Balance'
    ];

    const rows = entries.map((entry: CashbookEntry) => [
      new Date(entry.date).toLocaleDateString(),
      entry.voucherNumber,
      entry.transactionType.toUpperCase(),
      entry.description,
      entry.ncoaCode,
      entry.bankAccount,
      entry.receiptNumber || '',
      entry.receivedFrom || '',
      entry.dvNumber || '',
      entry.paidTo || '',
      entry.amount,
      entry.balance || ''
    ]);

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cashbook Report</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
          body { padding: 20px; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
            table { font-size: 12px; }
            .page-break { page-break-before: always; }
          }
          .header { text-align: center; margin-bottom: 30px; }
          .stats { margin-bottom: 20px; }
          .stats .card { margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Government Cashbook System</h2>
            <p>Report Generated: ${new Date().toLocaleString()}</p>
          </div>

          <div class="stats">
            <h4>Financial Summary</h4>
            <div class="row">
              <div class="col-md-3">
                <div class="card bg-primary text-white">
                  <div class="card-body">
                    <h6>Total Receipts</h6>
                    <h3>₦${stats.totalReceipts.toLocaleString()}</h3>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card bg-danger text-white">
                  <div class="card-body">
                    <h6>Total Payments</h6>
                    <h3>₦${stats.totalPayments.toLocaleString()}</h3>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card bg-success text-white">
                  <div class="card-body">
                    <h6>Current Balance</h6>
                    <h3>₦${stats.currentBalance.toLocaleString()}</h3>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card bg-info text-white">
                  <div class="card-body">
                    <h6>Total Transactions</h6>
                    <h3>${entries.length}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h4>Transaction Details</h4>
          <table class="table table-bordered">
            <thead>
              <tr>
                ${headers.map((h: string) => `<th>${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rows.map((row: any[]) => `<tr>${row.map((cell: any) => `<td>${cell}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  }




}
