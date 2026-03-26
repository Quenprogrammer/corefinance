// src/app/core/services/report.service.ts
import { Injectable, inject } from '@angular/core';
import { TransactionService } from './transaction.service';
import { MasterDataService } from './master-data.service';
import { ReconciliationService } from './reconciliation.service';
import { Observable, map, combineLatest } from 'rxjs';

import { Timestamp } from '@angular/fire/firestore';
import {MonthlySummary} from '../model/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private transactionService = inject(TransactionService);
  private masterDataService = inject(MasterDataService);
  private reconciliationService = inject(ReconciliationService);

  // Generate cash book report
  getCashBookReport(startDate: Date, endDate: Date): Observable<any> {
    return this.transactionService.getTransactionsByDateRange(startDate, endDate).pipe(
      map(transactions => {
        const receipts = transactions.filter(t => t.transactionType === 'RECEIPT');
        const payments = transactions.filter(t => t.transactionType === 'PAYMENT');

        // Group receipts by category
        const receiptsByCategory = receipts.reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        }, {} as { [key: string]: number });

        // Group payments by category
        const paymentsByCategory = payments.reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        }, {} as { [key: string]: number });

        // Daily summary
        const dailySummary = new Map<string, { receipts: number; payments: number; net: number }>();

        transactions.forEach(t => {
          const date = t.transactionDate instanceof Timestamp ? t.transactionDate.toDate() : new Date(t.transactionDate);
          const dateKey = date.toISOString().split('T')[0];

          if (!dailySummary.has(dateKey)) {
            dailySummary.set(dateKey, { receipts: 0, payments: 0, net: 0 });
          }

          const day = dailySummary.get(dateKey)!;
          if (t.transactionType === 'RECEIPT') {
            day.receipts += t.amount;
          } else {
            day.payments += t.amount;
          }
          day.net = day.receipts - day.payments;
        });

        // Calculate running balance
        let runningBalance = 0;
        const transactionsWithBalance = [...transactions].sort((a, b) => {
          const dateA = a.transactionDate instanceof Timestamp ? a.transactionDate.toDate() : new Date(a.transactionDate);
          const dateB = b.transactionDate instanceof Timestamp ? b.transactionDate.toDate() : new Date(b.transactionDate);
          return dateA.getTime() - dateB.getTime();
        }).map(t => {
          if (t.transactionType === 'RECEIPT') {
            runningBalance += t.amount;
          } else {
            runningBalance -= t.amount;
          }
          return { ...t, runningBalance };
        });

        return {
          startDate,
          endDate,
          totalReceipts: receipts.reduce((sum, t) => sum + t.amount, 0),
          totalPayments: payments.reduce((sum, t) => sum + t.amount, 0),
          netBalance: receipts.reduce((sum, t) => sum + t.amount, 0) - payments.reduce((sum, t) => sum + t.amount, 0),
          receiptsByCategory,
          paymentsByCategory,
          dailySummary: Array.from(dailySummary.entries()),
          transactions: transactionsWithBalance,
          receiptCount: receipts.length,
          paymentCount: payments.length
        };
      })
    );
  }

  // Generate NCOA summary report
  getNCOASummaryReport(startDate: Date, endDate: Date): Observable<any> {
    return combineLatest([
      this.transactionService.getTransactionsByDateRange(startDate, endDate),
      this.masterDataService.getNCOACodes()
    ]).pipe(
      map(([transactions, ncoaCodes]) => {
        const approved = transactions.filter(t => t.status === 'APPROVED');
        const ncoaMap = new Map(ncoaCodes.map(c => [c.code, c]));

        const summary = approved.reduce((acc, t) => {
          const ncoa = ncoaMap.get(t.ncoaCode);
          const category = ncoa?.category || 'UNKNOWN';

          if (!acc[category]) {
            acc[category] = {
              category,
              receipts: 0,
              payments: 0,
              net: 0,
              codes: {} as { [key: string]: { code: string; name: string; amount: number } }
            };
          }

          if (t.transactionType === 'RECEIPT') {
            acc[category].receipts += t.amount;
          } else {
            acc[category].payments += t.amount;
          }
          acc[category].net = acc[category].receipts - acc[category].payments;

          if (!acc[category].codes[t.ncoaCode]) {
            acc[category].codes[t.ncoaCode] = {
              code: t.ncoaCode,
              name: ncoa?.name || 'Unknown',
              amount: 0
            };
          }

          if (t.transactionType === 'RECEIPT') {
            acc[category].codes[t.ncoaCode].amount += t.amount;
          } else {
            acc[category].codes[t.ncoaCode].amount -= t.amount;
          }

          return acc;
        }, {} as any);

        return {
          startDate,
          endDate,
          summary: Object.values(summary),
          totalReceipts: approved.filter(t => t.transactionType === 'RECEIPT').reduce((sum, t) => sum + t.amount, 0),
          totalPayments: approved.filter(t => t.transactionType === 'PAYMENT').reduce((sum, t) => sum + t.amount, 0),
          generatedAt: new Date()
        };
      })
    );
  }

  // Generate payee summary report
  getPayeeSummaryReport(startDate: Date, endDate: Date): Observable<any> {
    return this.transactionService.getTransactionsByDateRange(startDate, endDate).pipe(
      map(transactions => {
        const approved = transactions.filter(t => t.status === 'APPROVED');
        const payeeMap = new Map<string, { name: string; receipts: number; payments: number; net: number; count: number }>();

        approved.forEach(t => {
          if (!payeeMap.has(t.payeeName)) {
            payeeMap.set(t.payeeName, {
              name: t.payeeName,
              receipts: 0,
              payments: 0,
              net: 0,
              count: 0
            });
          }

          const payee = payeeMap.get(t.payeeName)!;
          payee.count++;

          if (t.transactionType === 'RECEIPT') {
            payee.receipts += t.amount;
          } else {
            payee.payments += t.amount;
          }
          payee.net = payee.receipts - payee.payments;
        });

        return {
          startDate,
          endDate,
          payees: Array.from(payeeMap.values()).sort((a, b) => b.net - a.net),
          totalPayees: payeeMap.size,
          totalTransactions: approved.length,
          generatedAt: new Date()
        };
      })
    );
  }

  // Generate bank reconciliation report
  getBankReconciliationReport(year: number, month: number): Observable<any> {
    return this.reconciliationService.getReconciliationByMonth(year, month).pipe(
      map(reconciliation => {
        if (!reconciliation) {
          return null;
        }

        return {
          ...reconciliation,
          generatedAt: new Date(),
          outstandingChecksTotal: reconciliation.outstandingChecks?.reduce((sum, c) => sum + c.amount, 0) || 0,
          depositsInTransitTotal: reconciliation.depositsInTransit?.reduce((sum, d) => sum + d.amount, 0) || 0
        };
      })
    );
  }

  // Generate monthly trend report - FIXED: Use closingBalance instead of netBalance
  getMonthlyTrendReport(year: number): Observable<any> {
    return this.transactionService.getYearToDateSummary(year).pipe(
      map((monthlySummaries: MonthlySummary[]) => {
        // Find best and worst months based on closingBalance
        let bestMonth = monthlySummaries[0];
        let worstMonth = monthlySummaries[0];

        for (const month of monthlySummaries) {
          if (month.closingBalance > (bestMonth?.closingBalance || -Infinity)) {
            bestMonth = month;
          }
          if (month.closingBalance < (worstMonth?.closingBalance || Infinity)) {
            worstMonth = month;
          }
        }

        return {
          year,
          months: monthlySummaries,
          totalReceipts: monthlySummaries.reduce((sum, m) => sum + m.totalReceipts, 0),
          totalPayments: monthlySummaries.reduce((sum, m) => sum + m.totalPayments, 0),
          averageReceipts: monthlySummaries.reduce((sum, m) => sum + m.totalReceipts, 0) / 12,
          averagePayments: monthlySummaries.reduce((sum, m) => sum + m.totalPayments, 0) / 12,
          bestMonth: bestMonth,
          worstMonth: worstMonth
        };
      })
    );
  }

  // Generate summary statistics report
  getSummaryStatisticsReport(startDate: Date, endDate: Date): Observable<any> {
    return this.transactionService.getTransactionsByDateRange(startDate, endDate).pipe(
      map(transactions => {
        const approved = transactions.filter(t => t.status === 'APPROVED');
        const receipts = approved.filter(t => t.transactionType === 'RECEIPT');
        const payments = approved.filter(t => t.transactionType === 'PAYMENT');

        const totalReceipts = receipts.reduce((sum, t) => sum + t.amount, 0);
        const totalPayments = payments.reduce((sum, t) => sum + t.amount, 0);

        // Calculate average transaction size
        const avgReceiptSize = receipts.length > 0 ? totalReceipts / receipts.length : 0;
        const avgPaymentSize = payments.length > 0 ? totalPayments / payments.length : 0;

        // Find largest transactions
        const largestReceipt = receipts.reduce((max, t) => t.amount > max.amount ? t : max, receipts[0] || { amount: 0 });
        const largestPayment = payments.reduce((max, t) => t.amount > max.amount ? t : max, payments[0] || { amount: 0 });

        // Group by day of week
        const dayOfWeekStats = new Map<number, { receipts: number; payments: number; count: number }>();

        approved.forEach(t => {
          const date = t.transactionDate instanceof Timestamp ? t.transactionDate.toDate() : new Date(t.transactionDate);
          const dayOfWeek = date.getDay();

          if (!dayOfWeekStats.has(dayOfWeek)) {
            dayOfWeekStats.set(dayOfWeek, { receipts: 0, payments: 0, count: 0 });
          }

          const stats = dayOfWeekStats.get(dayOfWeek)!;
          stats.count++;

          if (t.transactionType === 'RECEIPT') {
            stats.receipts += t.amount;
          } else {
            stats.payments += t.amount;
          }
        });

        return {
          startDate,
          endDate,
          totalReceipts,
          totalPayments,
          netBalance: totalReceipts - totalPayments,
          receiptCount: receipts.length,
          paymentCount: payments.length,
          totalTransactions: approved.length,
          avgReceiptSize,
          avgPaymentSize,
          largestReceipt,
          largestPayment,
          dayOfWeekStats: Array.from(dayOfWeekStats.entries()).map(([day, stats]) => ({
            day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day],
            ...stats
          })),
          generatedAt: new Date()
        };
      })
    );
  }

  // Generate category trend report
  getCategoryTrendReport(year: number, category: string): Observable<any> {
    return this.transactionService.getYearToDateSummary(year).pipe(
      map(monthlySummaries => {
        const monthlyData = monthlySummaries.map(month => ({
          month: month.monthName,
          receipts: month.receiptsByCategory[category] || 0,
          payments: month.paymentsByCategory[category] || 0,
          net: (month.receiptsByCategory[category] || 0) - (month.paymentsByCategory[category] || 0)
        }));

        return {
          year,
          category,
          monthlyData,
          totalReceipts: monthlyData.reduce((sum, m) => sum + m.receipts, 0),
          totalPayments: monthlyData.reduce((sum, m) => sum + m.payments, 0),
          netTotal: monthlyData.reduce((sum, m) => sum + m.net, 0),
          generatedAt: new Date()
        };
      })
    );
  }

  // Export data as CSV
  exportToCSV(data: any[], filename: string): void {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvRows = [];

    csvRows.push(headers.join(','));

    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (value instanceof Date) return value.toISOString();
        if (typeof value === 'object') return JSON.stringify(value).replace(/,/g, ';');
        return String(value).replace(/,/g, ';');
      });
      csvRows.push(values.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // Export to PDF (print-friendly format)
  printReport(title: string, content: HTMLElement): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #1e3a5f; }
            h2 { color: #2c3e50; margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .amount { text-align: right; }
            .total-row { font-weight: bold; background-color: #f9f9f9; }
            .summary-card {
              border: 1px solid #ddd;
              padding: 15px;
              margin: 10px 0;
              border-radius: 5px;
              background-color: #f9f9f9;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
              margin: 20px 0;
            }
            .footer {
              margin-top: 30px;
              font-size: 12px;
              text-align: center;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
            @media print {
              body { margin: 0; padding: 0; }
              .no-print { display: none; }
              .page-break { page-break-before: always; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="summary-grid">
            ${content.innerHTML}
          </div>
          <div class="footer">
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <p>Cash Office - Personnel Cash Book System</p>
          </div>
          <div class="no-print" style="margin-top: 20px; text-align: center;">
            <button onclick="window.print();window.close();" style="padding: 10px 20px; margin: 10px; cursor: pointer;">Print</button>
            <button onclick="window.close();" style="padding: 10px 20px; margin: 10px; cursor: pointer;">Close</button>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
  }
}
