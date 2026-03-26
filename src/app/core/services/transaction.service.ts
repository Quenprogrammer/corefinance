// src/app/core/services/transaction.service.ts
import { Injectable, inject } from '@angular/core';
import { Firestore, query, where, orderBy, Timestamp, QueryConstraint } from '@angular/fire/firestore';
import { Observable, map, combineLatest, of } from 'rxjs';
import { FirebaseService } from './firebase.service';
import { Transaction, TransactionFilter, MonthlySummary, TransactionStats } from '../model/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private firestore = inject(Firestore);
  private firebaseService = inject(FirebaseService);
  private collectionName = 'transactions';

  // Get all transactions
  getTransactions(): Observable<Transaction[]> {
    return this.firebaseService.getCollectionWithQuery(
      this.collectionName,
      'voided',
      '==',
      false,
      'transactionDate',
      'desc'
    ) as Observable<Transaction[]>;
  }

  // Get all transactions including voided
  getAllTransactions(): Observable<Transaction[]> {
    return this.firebaseService.getCollectionWithQuery(
      this.collectionName,
      'transactionDate',
      '!=',
      null,
      'transactionDate',
      'desc'
    ) as Observable<Transaction[]>;
  }

  // Get transactions by date range
  getTransactionsByDateRange(startDate: Date, endDate: Date): Observable<Transaction[]> {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const constraints: QueryConstraint[] = [
      where('transactionDate', '>=', Timestamp.fromDate(start)),
      where('transactionDate', '<=', Timestamp.fromDate(end)),
      where('voided', '==', false),
      orderBy('transactionDate', 'desc')
    ];

    return this.firebaseService.getCollection(this.collectionName, constraints) as Observable<Transaction[]>;
  }

  // Get single transaction
  getTransactionById(id: string): Observable<Transaction | null> {
    return this.firebaseService.getDocument(this.collectionName, id) as Observable<Transaction | null>;
  }

  // Create transaction
  async createTransaction(transaction: Partial<Transaction>): Promise<string> {
    const voucherNo = await this.firebaseService.generateVoucherNumber();

    const transactionData: Partial<Transaction> = {
      ...transaction,
      voucherNo,
      status: 'PENDING',
      voided: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    return await this.firebaseService.addDocument(this.collectionName, transactionData);
  }

  // Update transaction
  async updateTransaction(id: string, transaction: Partial<Transaction>): Promise<void> {
    await this.firebaseService.updateDocument(this.collectionName, id, {
      ...transaction,
      updatedAt: Timestamp.now()
    });
  }

  // Delete transaction (soft delete)
  async deleteTransaction(id: string, reason?: string): Promise<void> {
    await this.firebaseService.updateDocument(this.collectionName, id, {
      voided: true,
      status: 'VOID',
      voidReason: reason || 'Deleted by user',
      voidedAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
  }

  // Approve transaction
  async approveTransaction(id: string, approvedBy: string): Promise<void> {
    await this.firebaseService.updateDocument(this.collectionName, id, {
      status: 'APPROVED',
      approvedBy,
      approvedAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
  }

  // Reject transaction
  async rejectTransaction(id: string, reason: string): Promise<void> {
    await this.firebaseService.updateDocument(this.collectionName, id, {
      status: 'REJECTED',
      rejectionReason: reason,
      updatedAt: Timestamp.now()
    });
  }

  // Bulk approve transactions
  async bulkApproveTransactions(ids: string[], approvedBy: string): Promise<void> {
    const operations = ids.map(id => ({
      collection: this.collectionName,
      id,
      data: {
        status: 'APPROVED',
        approvedBy,
        approvedAt: Timestamp.now()
      },
      type: 'update' as const
    }));

    await this.firebaseService.batchWrite(operations);
  }

  // Get monthly summary
  getMonthlySummary(year: number, month: number): Observable<MonthlySummary> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return this.getTransactionsByDateRange(startDate, endDate).pipe(
      map(transactions => {
        const approved = transactions.filter(t => t.status === 'APPROVED');
        const receipts = approved.filter(t => t.transactionType === 'RECEIPT');
        const payments = approved.filter(t => t.transactionType === 'PAYMENT');

        const totalReceipts = receipts.reduce((sum, t) => sum + t.amount, 0);
        const totalPayments = payments.reduce((sum, t) => sum + t.amount, 0);

        // Group by category
        const receiptsByCategory: { [key: string]: number } = {};
        const paymentsByCategory: { [key: string]: number } = {};

        receipts.forEach(r => {
          receiptsByCategory[r.category] = (receiptsByCategory[r.category] || 0) + r.amount;
        });

        payments.forEach(p => {
          paymentsByCategory[p.category] = (paymentsByCategory[p.category] || 0) + p.amount;
        });

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        return {
          month,
          year,
          monthName: monthNames[month - 1],
          openingBalance: 0,
          totalReceipts,
          totalPayments,
          closingBalance: totalReceipts - totalPayments,
          receiptsByCategory,
          paymentsByCategory,
          transactionCount: approved.length,
          receiptCount: receipts.length,
          paymentCount: payments.length
        };
      })
    );
  }

  // Get year-to-date summary
  getYearToDateSummary(year: number): Observable<MonthlySummary[]> {
    const summaries: MonthlySummary[] = [];
    for (let month = 1; month <= 12; month++) {
      summaries.push({
        month,
        year,
        monthName: '',
        openingBalance: 0,
        totalReceipts: 0,
        totalPayments: 0,
        closingBalance: 0,
        receiptsByCategory: {},
        paymentsByCategory: {},
        transactionCount: 0,
        receiptCount: 0,
        paymentCount: 0
      });
    }

    return this.getTransactions().pipe(
      map(transactions => {
        const approved = transactions.filter(t => t.status === 'APPROVED');

        approved.forEach(t => {
          const date = t.transactionDate instanceof Timestamp ? t.transactionDate.toDate() : new Date(t.transactionDate);
          if (date.getFullYear() === year) {
            const monthIndex = date.getMonth();
            if (t.transactionType === 'RECEIPT') {
              summaries[monthIndex].totalReceipts += t.amount;
              summaries[monthIndex].receiptsByCategory[t.category] =
                (summaries[monthIndex].receiptsByCategory[t.category] || 0) + t.amount;
            } else {
              summaries[monthIndex].totalPayments += t.amount;
              summaries[monthIndex].paymentsByCategory[t.category] =
                (summaries[monthIndex].paymentsByCategory[t.category] || 0) + t.amount;
            }
            summaries[monthIndex].transactionCount++;
            summaries[monthIndex][t.transactionType === 'RECEIPT' ? 'receiptCount' : 'paymentCount']++;
          }
        });

        // Calculate running balances
        let runningBalance = 0;
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        summaries.forEach((s, i) => {
          s.monthName = monthNames[i];
          s.openingBalance = runningBalance;
          s.closingBalance = runningBalance + s.totalReceipts - s.totalPayments;
          runningBalance = s.closingBalance;
        });

        return summaries;
      })
    );
  }

  // Get running balance
  getRunningBalance(): Observable<{ date: Date; balance: number }[]> {
    return this.getTransactions().pipe(
      map(transactions => {
        const approved = transactions
          .filter(t => t.status === 'APPROVED')
          .sort((a, b) => {
            const dateA = a.transactionDate instanceof Timestamp ? a.transactionDate.toDate() : new Date(a.transactionDate);
            const dateB = b.transactionDate instanceof Timestamp ? b.transactionDate.toDate() : new Date(b.transactionDate);
            return dateA.getTime() - dateB.getTime();
          });

        let balance = 0;
        return approved.map(t => {
          if (t.transactionType === 'RECEIPT') {
            balance += t.amount;
          } else {
            balance -= t.amount;
          }

          const date = t.transactionDate instanceof Timestamp ? t.transactionDate.toDate() : new Date(t.transactionDate);
          return { date, balance };
        });
      })
    );
  }

  // Search transactions
  searchTransactions(filter: TransactionFilter): Observable<Transaction[]> {
    return this.getTransactions().pipe(
      map(transactions => {
        return transactions.filter(t => {
          let match = true;

          if (filter.startDate) {
            const txDate = t.transactionDate instanceof Timestamp ? t.transactionDate.toDate() : new Date(t.transactionDate);
            if (txDate < filter.startDate) match = false;
          }

          if (filter.endDate) {
            const txDate = t.transactionDate instanceof Timestamp ? t.transactionDate.toDate() : new Date(t.transactionDate);
            if (txDate > filter.endDate) match = false;
          }

          if (filter.transactionType && t.transactionType !== filter.transactionType) match = false;
          if (filter.category && t.category !== filter.category) match = false;
          if (filter.status && t.status !== filter.status) match = false;

          if (filter.payeeName && !t.payeeName.toLowerCase().includes(filter.payeeName.toLowerCase())) match = false;

          if (filter.searchTerm) {
            const term = filter.searchTerm.toLowerCase();
            const inPayee = t.payeeName.toLowerCase().includes(term);
            const inDesc = t.description.toLowerCase().includes(term);
            const inVoucher = t.voucherNo.toLowerCase().includes(term);
            if (!inPayee && !inDesc && !inVoucher) match = false;
          }

          if (filter.minAmount && t.amount < filter.minAmount) match = false;
          if (filter.maxAmount && t.amount > filter.maxAmount) match = false;

          return match;
        });
      })
    );
  }

  // Get transaction statistics
  getTransactionStats(): Observable<TransactionStats> {
    return this.getTransactions().pipe(
      map(transactions => {
        const approved = transactions.filter(t => t.status === 'APPROVED');
        const receipts = approved.filter(t => t.transactionType === 'RECEIPT');
        const payments = approved.filter(t => t.transactionType === 'PAYMENT');

        // Get current month
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const currentMonthTransactions = approved.filter(t => {
          const txDate = t.transactionDate instanceof Timestamp ? t.transactionDate.toDate() : new Date(t.transactionDate);
          return txDate >= currentMonthStart && txDate <= currentMonthEnd;
        });

        const currentMonthReceipts = currentMonthTransactions.filter(t => t.transactionType === 'RECEIPT');
        const currentMonthPayments = currentMonthTransactions.filter(t => t.transactionType === 'PAYMENT');

        return {
          totalReceipts: receipts.reduce((sum, t) => sum + t.amount, 0),
          totalPayments: payments.reduce((sum, t) => sum + t.amount, 0),
          netBalance: receipts.reduce((sum, t) => sum + t.amount, 0) - payments.reduce((sum, t) => sum + t.amount, 0),
          pendingCount: transactions.filter(t => t.status === 'PENDING').length,
          approvedCount: transactions.filter(t => t.status === 'APPROVED').length,
          rejectedCount: transactions.filter(t => t.status === 'REJECTED').length,
          voidCount: transactions.filter(t => t.status === 'VOID').length,
          currentMonthReceipts: currentMonthReceipts.reduce((sum, t) => sum + t.amount, 0),
          currentMonthPayments: currentMonthPayments.reduce((sum, t) => sum + t.amount, 0),
          currentMonthCount: currentMonthTransactions.length
        };
      })
    );
  }

  // Get NCOA summary
  getNCOASummary(startDate?: Date, endDate?: Date): Observable<{ [key: string]: number }> {
    let transactions$: Observable<Transaction[]>;

    if (startDate && endDate) {
      transactions$ = this.getTransactionsByDateRange(startDate, endDate);
    } else {
      transactions$ = this.getTransactions();
    }

    return transactions$.pipe(
      map(transactions => {
        const summary: { [key: string]: number } = {};
        const approved = transactions.filter(t => t.status === 'APPROVED');

        approved.forEach(t => {
          const key = t.ncoaCode;
          if (t.transactionType === 'RECEIPT') {
            summary[key] = (summary[key] || 0) + t.amount;
          } else {
            summary[key] = (summary[key] || 0) - t.amount;
          }
        });

        return summary;
      })
    );
  }
}
