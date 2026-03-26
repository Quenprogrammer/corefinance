// src/app/core/services/reconciliation.service.ts
import { Injectable, inject } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { TransactionService } from './transaction.service';
import { MasterDataService } from './master-data.service';
import { Reconciliation, MonthEndClose, ReconciliationItem, ReconciliationFilter, ReconciliationReport, ReconciliationStats } from '../model/reconciliation.model';
import { Transaction, TransactionFilter, MonthlySummary, TransactionStats } from '../model/transaction.model';
import { Timestamp } from '@angular/fire/firestore';
import { Observable, map, combineLatest, of, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReconciliationService {
  private firebaseService = inject(FirebaseService);
  private transactionService = inject(TransactionService);
  private masterDataService = inject(MasterDataService);
  private collectionName = 'reconciliations';

  // Get reconciliations
  getReconciliations(): Observable<Reconciliation[]> {
    return this.firebaseService.getCollectionWithQuery(
      this.collectionName,
      'reconciliationDate',
      '!=',
      null,
      'reconciliationDate',
      'desc'
    ) as Observable<Reconciliation[]>;
  }

  // Get reconciliations with filter
  getReconciliationsFiltered(filter: ReconciliationFilter): Observable<Reconciliation[]> {
    let query: Observable<Reconciliation[]>;

    if (filter.year && filter.month) {
      query = this.firebaseService.getCollectionWithQuery(
        this.collectionName,
        'year',
        '==',
        filter.year,
        'month',
        'asc'
      ) as Observable<Reconciliation[]>;
    } else if (filter.year) {
      query = this.firebaseService.getCollectionWithQuery(
        this.collectionName,
        'year',
        '==',
        filter.year,
        'reconciliationDate',
        'desc'
      ) as Observable<Reconciliation[]>;
    } else {
      query = this.getReconciliations();
    }

    return query.pipe(
      map(reconciliations => {
        let filtered = reconciliations;

        if (filter.month) {
          filtered = filtered.filter(r => r.month === filter.month);
        }

        if (filter.status) {
          filtered = filtered.filter(r => r.status === filter.status);
        }

        if (filter.startDate) {
          filtered = filtered.filter(r => r.reconciliationDate >= filter.startDate!);
        }

        if (filter.endDate) {
          filtered = filtered.filter(r => r.reconciliationDate <= filter.endDate!);
        }

        if (filter.hasDiscrepancies) {
          filtered = filtered.filter(r => r.status === 'DISCREPANCY');
        }

        return filtered;
      })
    );
  }

  // Get reconciliation by month/year
  getReconciliationByMonth(year: number, month: number): Observable<Reconciliation | null> {
    return this.firebaseService.getCollectionWithQuery(
      this.collectionName,
      'year',
      '==',
      year,
      'month',
      'asc'
    ).pipe(
      map(reconciliations => {
        const found = reconciliations.find(r => r.month === month);
        return found || null;
      })
    ) as Observable<Reconciliation | null>;
  }

  // Get reconciliation by id
  getReconciliationById(id: string): Observable<Reconciliation | null> {
    return this.firebaseService.getDocument(this.collectionName, id) as Observable<Reconciliation | null>;
  }

  // Create reconciliation
  async createReconciliation(
    year: number,
    month: number,
    bankStatementBalance: number,
    bankAccountId?: string
  ): Promise<string> {
    // Get transactions for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const transactions = await firstValueFrom(
      this.transactionService.getTransactionsByDateRange(startDate, endDate)
    );
    const approvedTransactions = transactions?.filter(t => t.status === 'APPROVED') || [];

    // Calculate book balance from transactions
    const totalReceipts = approvedTransactions
      .filter(t => t.transactionType === 'RECEIPT')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalPayments = approvedTransactions
      .filter(t => t.transactionType === 'PAYMENT')
      .reduce((sum, t) => sum + t.amount, 0);

    const bookBalance = totalReceipts - totalPayments;

    // Create reconciliation items
    const outstandingChecks: ReconciliationItem[] = [];
    const depositsInTransit: ReconciliationItem[] = [];
    const bankErrors: ReconciliationItem[] = [];
    const bookErrors: ReconciliationItem[] = [];

    // Find uncleared transactions (older than 30 days without matching bank statement)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    approvedTransactions.forEach(t => {
      const txDate = t.transactionDate instanceof Timestamp
        ? t.transactionDate.toDate()
        : new Date(t.transactionDate);

      // Check if transaction is not cleared and is older than 30 days
      const isUncleared = t.cleared === false || t.cleared === undefined;
      if (txDate < thirtyDaysAgo && isUncleared) {
        const item: ReconciliationItem = {
          id: t.id || '',
          description: t.description,
          reference: t.voucherNo,
          amount: t.amount,
          type: t.transactionType === 'RECEIPT' ? 'DEPOSIT_IN_TRANSIT' : 'OUTSTANDING_CHECK',
          date: txDate,
          cleared: false,
          notes: 'Auto-detected uncleared transaction'
        };

        if (t.transactionType === 'PAYMENT') {
          outstandingChecks.push(item);
        } else {
          depositsInTransit.push(item);
        }
      }
    });

    const outstandingChecksTotal = outstandingChecks.reduce((sum, c) => sum + c.amount, 0);
    const depositsInTransitTotal = depositsInTransit.reduce((sum, d) => sum + d.amount, 0);

    const difference = bookBalance - bankStatementBalance;
    const adjustedBalance = bankStatementBalance + outstandingChecksTotal - depositsInTransitTotal;

    const reconciliationData: Partial<Reconciliation> = {
      year,
      month,
      reconciliationDate: new Date(),
      bankStatementBalance,
      bookBalance,
      outstandingChecks,
      depositsInTransit,
      bankErrors,
      bookErrors,
      difference,
      adjustedBalance,
      status: Math.abs(difference) < 0.01 ? 'RECONCILED' : 'DISCREPANCY',
      notes: '',
      reconciledBy: '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    return await this.firebaseService.addDocument(this.collectionName, reconciliationData);
  }

  // Update reconciliation
  async updateReconciliation(id: string, reconciliation: Partial<Reconciliation>): Promise<void> {
    await this.firebaseService.updateDocument(this.collectionName, id, {
      ...reconciliation,
      updatedAt: Timestamp.now()
    });
  }

  // Mark transaction as cleared
  async markTransactionCleared(transactionId: string): Promise<void> {
    await this.firebaseService.updateDocument('transactions', transactionId, {
      cleared: true,
      clearedAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
  }

  // Mark transaction as uncleared
  async markTransactionUncleared(transactionId: string): Promise<void> {
    await this.firebaseService.updateDocument('transactions', transactionId, {
      cleared: false,
      clearedAt: null,
      updatedAt: Timestamp.now()
    });
  }

  // Bulk mark transactions as cleared
  async bulkMarkTransactionsCleared(transactionIds: string[]): Promise<void> {
    const operations = transactionIds.map(id => ({
      collection: 'transactions',
      id,
      data: {
        cleared: true,
        clearedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      type: 'update' as const
    }));

    await this.firebaseService.batchWrite(operations);
  }

  // Add reconciliation item
  async addReconciliationItem(
    reconciliationId: string,
    item: ReconciliationItem,
    type: 'outstandingChecks' | 'depositsInTransit' | 'bankErrors' | 'bookErrors'
  ): Promise<void> {
    const reconciliation = await firstValueFrom(this.getReconciliationById(reconciliationId));
    if (reconciliation) {
      const updatedItems = [...(reconciliation[type] || []), item];
      await this.updateReconciliation(reconciliationId, {
        [type]: updatedItems,
        updatedAt: Timestamp.now()
      });
    }
  }

  // Remove reconciliation item
  async removeReconciliationItem(
    reconciliationId: string,
    itemId: string,
    type: 'outstandingChecks' | 'depositsInTransit' | 'bankErrors' | 'bookErrors'
  ): Promise<void> {
    const reconciliation = await firstValueFrom(this.getReconciliationById(reconciliationId));
    if (reconciliation) {
      const updatedItems = (reconciliation[type] || []).filter(item => item.id !== itemId);
      await this.updateReconciliation(reconciliationId, {
        [type]: updatedItems,
        updatedAt: Timestamp.now()
      });
    }
  }

  // Month-end closing
  async closeMonth(year: number, month: number, closedBy: string): Promise<string> {
    // Check if already closed
    const existingClose = await firstValueFrom(
      this.firebaseService.getCollectionWithQuery(
        'monthEndCloses',
        'year',
        '==',
        year,
        'month',
        'asc'
      ).pipe(
        map(closes => closes.find(c => c.month === month))
      )
    );

    if (existingClose) {
      throw new Error('Month already closed');
    }

    // Get transactions for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const transactions = await firstValueFrom(
      this.transactionService.getTransactionsByDateRange(startDate, endDate)
    );
    const pendingTransactions = transactions?.filter(t => t.status === 'PENDING') || [];

    if (pendingTransactions.length > 0) {
      throw new Error(`Cannot close month: ${pendingTransactions.length} pending transactions`);
    }

    // Get monthly summary
    const summary = await firstValueFrom(
      this.transactionService.getMonthlySummary(year, month)
    );

    const closingBalance = summary.closingBalance;

    const closeData: Partial<MonthEndClose> = {
      year,
      month,
      closedDate: new Date(),
      closedBy,
      summary,
      closingBalance,
      status: 'CLOSED',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    return await this.firebaseService.addDocument('monthEndCloses', closeData);
  }

  // Reopen a closed month
  async reopenMonth(closeId: string, reopenedBy: string, reason: string): Promise<void> {
    await this.firebaseService.updateDocument('monthEndCloses', closeId, {
      status: 'REOPENED',
      reopenedBy,
      reopenedDate: new Date(),
      reopenReason: reason,
      updatedAt: Timestamp.now()
    });
  }

  // Get month-end closes
  getMonthEndCloses(): Observable<MonthEndClose[]> {
    return this.firebaseService.getCollectionWithQuery(
      'monthEndCloses',
      'closedDate',
      '!=',
      null,
      'closedDate',
      'desc'
    ) as Observable<MonthEndClose[]>;
  }

  // Get month-end close by month/year
  getMonthEndCloseByMonth(year: number, month: number): Observable<MonthEndClose | null> {
    return this.firebaseService.getCollectionWithQuery(
      'monthEndCloses',
      'year',
      '==',
      year,
      'month',
      'asc'
    ).pipe(
      map(closes => {
        const found = closes.find(c => c.month === month);
        return found || null;
      })
    ) as Observable<MonthEndClose | null>;
  }

  // Check if month is closed
  async isMonthClosed(year: number, month: number): Promise<boolean> {
    const closes = await firstValueFrom(
      this.firebaseService.getCollectionWithQuery(
        'monthEndCloses',
        'year',
        '==',
        year,
        'month',
        'asc'
      )
    );
    return closes?.some(c => c.month === month && c.status === 'CLOSED') || false;
  }

  // Get unreconciled transactions (not cleared)
  getUnreconciledTransactions(): Observable<Transaction[]> {
    return this.transactionService.getTransactions().pipe(
      map(transactions => transactions.filter(t =>
        (t.cleared === false || t.cleared === undefined) &&
        t.status === 'APPROVED'
      ))
    );
  }

  // Get cleared transactions
  getClearedTransactions(): Observable<Transaction[]> {
    return this.transactionService.getTransactions().pipe(
      map(transactions => transactions.filter(t =>
        t.cleared === true &&
        t.status === 'APPROVED'
      ))
    );
  }

  // Get reconciliation statistics
  getReconciliationStats(): Observable<ReconciliationStats> {
    return combineLatest([
      this.getReconciliations(),
      this.getMonthEndCloses()
    ]).pipe(
      map(([reconciliations, closes]) => {
        const reconciled = reconciliations.filter(r => r.status === 'RECONCILED');
        const discrepancies = reconciliations.filter(r => r.status === 'DISCREPANCY');

        const totalDifference = discrepancies.reduce((sum, r) => sum + Math.abs(r.difference), 0);
        const averageDiscrepancy = discrepancies.length > 0 ? totalDifference / discrepancies.length : 0;
        const largestDiscrepancy = Math.max(...discrepancies.map(r => Math.abs(r.difference)), 0);

        const monthsReconciled = reconciled.map(r => r.month);
        const monthsPending = closes
          .filter(c => c.status === 'CLOSED')
          .map(c => c.month)
          .filter(month => !monthsReconciled.includes(month));

        return {
          totalReconciliations: reconciliations.length,
          reconciledCount: reconciled.length,
          discrepancyCount: discrepancies.length,
          pendingCount: reconciliations.length - reconciled.length - discrepancies.length,
          averageDiscrepancy,
          largestDiscrepancy,
          monthsReconciled,
          monthsPending,
          recentReconciliations: reconciliations.slice(0, 5)
        };
      })
    );
  }

  // Generate reconciliation report
  async generateReconciliationReport(year: number, month: number): Promise<ReconciliationReport | null> {
    const reconciliation = await firstValueFrom(this.getReconciliationByMonth(year, month));
    if (!reconciliation) return null;

    const transactions = await firstValueFrom(
      this.transactionService.getTransactionsByDateRange(
        new Date(year, month - 1, 1),
        new Date(year, month, 0)
      )
    );

    const approvedTransactions = transactions?.filter(t => t.status === 'APPROVED') || [];

    // Find unmatched transactions
    const unmatchedBookTransactions = approvedTransactions.filter(t =>
      (t.cleared === false || t.cleared === undefined) &&
      t.transactionDate instanceof Date &&
      t.transactionDate < new Date(year, month, 0)
    );

    // Create unmatched bank transactions (placeholder - would come from bank statement import)
    const unmatchedBankTransactions: any[] = [];

    const outstandingChecksTotal = reconciliation.outstandingChecks?.reduce((sum, c) => sum + c.amount, 0) || 0;
    const depositsInTransitTotal = reconciliation.depositsInTransit?.reduce((sum, d) => sum + d.amount, 0) || 0;
    const bankErrorsTotal = reconciliation.bankErrors?.reduce((sum, e) => sum + e.amount, 0) || 0;
    const bookErrorsTotal = reconciliation.bookErrors?.reduce((sum, e) => sum + e.amount, 0) || 0;

    const adjustedBankBalance = reconciliation.bankStatementBalance + outstandingChecksTotal - depositsInTransitTotal + bankErrorsTotal;
    const adjustedBookBalance = reconciliation.bookBalance + bookErrorsTotal;

    return {
      reconciliation,
      bankStatement: null,
      unmatchedBankTransactions,
      unmatchedBookTransactions,
      varianceAnalysis: {
        timingDifferences: {
          outstandingChecks: outstandingChecksTotal,
          depositsInTransit: depositsInTransitTotal
        },
        errors: {
          bankErrors: bankErrorsTotal,
          bookErrors: bookErrorsTotal,
          totalErrors: bankErrorsTotal + bookErrorsTotal
        },
        unrecordedTransactions: {
          bankOnly: 0,
          bookOnly: unmatchedBookTransactions.reduce((sum, t) => sum + t.amount, 0)
        },
        explanations: []
      },
      adjustmentsMade: [],
      summary: {
        totalOutstandingChecks: outstandingChecksTotal,
        totalDepositsInTransit: depositsInTransitTotal,
        totalBankErrors: bankErrorsTotal,
        totalBookErrors: bookErrorsTotal,
        adjustedBankBalance,
        adjustedBookBalance,
        isReconciled: Math.abs(adjustedBankBalance - adjustedBookBalance) < 0.01,
        differenceAmount: adjustedBankBalance - adjustedBookBalance
      }
    };
  }

  // Validate reconciliation
  validateReconciliation(reconciliation: Reconciliation): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (reconciliation.bankStatementBalance < 0) {
      errors.push('Bank statement balance cannot be negative');
    }

    if (reconciliation.bookBalance < 0) {
      errors.push('Book balance cannot be negative');
    }

    const outstandingChecksTotal = reconciliation.outstandingChecks?.reduce((sum, c) => sum + c.amount, 0) || 0;
    const depositsInTransitTotal = reconciliation.depositsInTransit?.reduce((sum, d) => sum + d.amount, 0) || 0;

    const calculatedAdjustedBalance = reconciliation.bankStatementBalance + outstandingChecksTotal - depositsInTransitTotal;

    if (Math.abs(calculatedAdjustedBalance - reconciliation.adjustedBalance) > 0.01) {
      errors.push('Adjusted balance calculation is incorrect');
    }

    if (reconciliation.status === 'RECONCILED' && Math.abs(reconciliation.difference) > 0.01) {
      errors.push('Reconciliation marked as reconciled but difference is not zero');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
