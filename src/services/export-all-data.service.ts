import { Injectable, inject } from '@angular/core';
import { ExcelExportService, ExportData } from './excel-export.service';
import { CashbookService } from '../app/core/services/cashbook.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExportAllDataService {
  private excelExport = inject(ExcelExportService);
  private cashbookService = inject(CashbookService);

  /**
   * Export ALL data to a single Excel file with multiple sheets
   */
  async exportAllData(year: number): Promise<void> {
    const sheets: ExportData[] = [];

    // Get all data
    const entries = await firstValueFrom(this.cashbookService.getEntriesByYear(year));
    const monthlyReport = await firstValueFrom(this.cashbookService.getMonthlyReport(year));
    const receiptAnalysis = await firstValueFrom(this.cashbookService.getCategoryAnalysis('receipt'));
    const paymentAnalysis = await firstValueFrom(this.cashbookService.getCategoryAnalysis('payment'));

    // 1. Summary Sheet
    sheets.push(this.createSummarySheet(entries, monthlyReport, year));

    // 2. Cashbook Transactions Sheet
    sheets.push(this.createCashbookSheet(entries));

    // 3. Monthly Report Sheet
    sheets.push(this.createMonthlyReportSheet(monthlyReport, year));

    // 4. Receipt Analysis Sheet
    sheets.push(this.createCategoryAnalysisSheet(receiptAnalysis, 'Receipt Analysis'));

    // 5. Payment Analysis Sheet
    sheets.push(this.createCategoryAnalysisSheet(paymentAnalysis, 'Payment Analysis'));

    // 6. Statistics Sheet
    sheets.push(this.createStatisticsSheet(entries, monthlyReport));

    // Export to Excel
    this.excelExport.exportToExcel(sheets, `Complete_Financial_Report_${year}.xlsx`);
  }

  /**
   * Create Summary Sheet
   */
  private createSummarySheet(entries: any[], monthlyReport: any[], year: number): ExportData {
    const totalReceipts = entries.filter(e => e.transactionType === 'receipt').reduce((s, e) => s + e.amount, 0);
    const totalPayments = entries.filter(e => e.transactionType === 'payment').reduce((s, e) => s + e.amount, 0);
    const netBalance = totalReceipts - totalPayments;
    const totalTransactions = entries.length;
    const receiptCount = entries.filter(e => e.transactionType === 'receipt').length;
    const paymentCount = entries.filter(e => e.transactionType === 'payment').length;
    const averageTransaction = totalTransactions > 0 ? (totalReceipts + totalPayments) / totalTransactions : 0;

    const data: any[][] = [
      ['COMPLETE FINANCIAL REPORT'],
      [`Generated: ${new Date().toLocaleString()}`],
      [`Report Year: ${year}`],
      [],
      ['EXECUTIVE SUMMARY'],
      [],
      ['Metric', 'Value'],
      ['Total Receipts', totalReceipts],
      ['Total Payments', totalPayments],
      ['Net Balance', netBalance],
      ['Total Transactions', totalTransactions],
      ['Receipt Count', receiptCount],
      ['Payment Count', paymentCount],
      ['Average Transaction', averageTransaction],
      [],
      ['MONTHLY TOTALS'],
      [],
      ['Month', 'Receipts', 'Payments', 'Net Balance', 'Cumulative Balance']
    ];

    let runningBalance = 0;
    monthlyReport.forEach(month => {
      const cumulativeBalance = runningBalance + (month.receipts - month.payments);
      runningBalance = cumulativeBalance;
      data.push([month.monthName, month.receipts, month.payments, month.balance, cumulativeBalance]);
    });

    const bestMonth = this.getBestMonth(monthlyReport);
    const worstMonth = this.getWorstMonth(monthlyReport);

    data.push([], ['Best Month:', bestMonth?.monthName || 'N/A', bestMonth?.balance || 0]);
    data.push(['Worst Month:', worstMonth?.monthName || 'N/A', worstMonth?.balance || 0]);

    return {
      sheetName: 'Summary',
      data: data,
      columns: [
        { wch: 25 },
        { wch: 20 },
        { wch: 20 },
        { wch: 20 },
        { wch: 20 }
      ]
    };
  }

  /**
   * Create Cashbook Transactions Sheet
   */
  private createCashbookSheet(entries: any[]): ExportData {
    const headers = [
      'Date', 'Voucher No', 'Type', 'Description', 'NCOA Code', 'Bank',
      'Receipt No', 'Received From', 'DV No', 'Paid To', 'Amount', 'Balance'
    ];

    const data: any[][] = [headers];

    entries.forEach(entry => {
      data.push([
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
    });

    return {
      sheetName: 'Transactions',
      data: data,
      columns: headers.map(() => ({ wch: 15 }))
    };
  }

  /**
   * Create Monthly Report Sheet
   */
  private createMonthlyReportSheet(monthlyReport: any[], year: number): ExportData {
    const headers = ['Month', 'Receipts (₦)', 'Payments (₦)', 'Net Balance (₦)', 'Cumulative Balance (₦)'];
    const data: any[][] = [headers];

    let runningBalance = 0;
    monthlyReport.forEach(month => {
      const cumulativeBalance = runningBalance + (month.receipts - month.payments);
      runningBalance = cumulativeBalance;
      data.push([month.monthName, month.receipts, month.payments, month.balance, cumulativeBalance]);
    });

    const totalReceipts = monthlyReport.reduce((s, m) => s + m.receipts, 0);
    const totalPayments = monthlyReport.reduce((s, m) => s + m.payments, 0);
    data.push(['TOTAL', totalReceipts, totalPayments, totalReceipts - totalPayments, '']);

    return {
      sheetName: 'Monthly Report',
      data: data,
      columns: [
        { wch: 15 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 },
        { wch: 20 }
      ]
    };
  }

  /**
   * Create Category Analysis Sheet
   */
  private createCategoryAnalysisSheet(analysis: any[], title: string): ExportData {
    const headers = ['Category', 'Amount (₦)', 'Percentage', 'Transaction Count'];
    const data: any[][] = [headers];

    analysis.forEach(item => {
      data.push([item.category, item.amount, `${item.percentage.toFixed(2)}%`, item.count]);
    });

    const total = analysis.reduce((s, i) => s + i.amount, 0);
    const totalCount = analysis.reduce((s, i) => s + i.count, 0);
    data.push(['TOTAL', total, '100%', totalCount]);

    return {
      sheetName: title.substring(0, 31),
      data: data,
      columns: [
        { wch: 25 },
        { wch: 18 },
        { wch: 12 },
        { wch: 15 }
      ]
    };
  }

  /**
   * Create Statistics Sheet
   */
  private createStatisticsSheet(entries: any[], monthlyReport: any[]): ExportData {
    const receiptsByMonth = new Array(12).fill(0);
    const paymentsByMonth = new Array(12).fill(0);

    entries.forEach(entry => {
      const monthIndex = entry.month - 1;
      if (entry.transactionType === 'receipt') {
        receiptsByMonth[monthIndex] += entry.amount;
      } else {
        paymentsByMonth[monthIndex] += entry.amount;
      }
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const data: any[][] = [
      ['DETAILED STATISTICS'],
      [],
      ['MONTHLY BREAKDOWN'],
      [],
      ['Month', 'Receipts', 'Payments', 'Difference', 'Total Transactions'],
    ];

    for (let i = 0; i < 12; i++) {
      const monthTransactions = entries.filter(e => e.month === i + 1);
      const receiptCount = monthTransactions.filter(e => e.transactionType === 'receipt').length;
      const paymentCount = monthTransactions.filter(e => e.transactionType === 'payment').length;

      data.push([
        months[i],
        receiptsByMonth[i],
        paymentsByMonth[i],
        receiptsByMonth[i] - paymentsByMonth[i],
        receiptCount + paymentCount
      ]);
    }

    // Category totals
    const categoryTotals = new Map<string, number>();
    entries.forEach(entry => {
      const category = entry.transactionType === 'receipt' ? entry.receiptCategory : entry.paymentCategory;
      if (category) {
        categoryTotals.set(category, (categoryTotals.get(category) || 0) + entry.amount);
      }
    });

    data.push([], ['CATEGORY TOTALS'], []);
    data.push(['Category', 'Total Amount']);
    Array.from(categoryTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, amount]) => {
        data.push([category, amount]);
      });

    return {
      sheetName: 'Statistics',
      data: data,
      columns: [
        { wch: 25 },
        { wch: 18 }
      ]
    };
  }

  /**
   * Get best month based on net balance
   */
  private getBestMonth(monthlyReport: any[]): any {
    if (!monthlyReport.length) return null;
    return monthlyReport.reduce((best, current) =>
        (current.receipts - current.payments) > (best.receipts - best.payments) ? current : best,
      monthlyReport[0]
    );
  }

  /**
   * Get worst month based on net balance
   */
  private getWorstMonth(monthlyReport: any[]): any {
    if (!monthlyReport.length) return null;
    return monthlyReport.reduce((worst, current) =>
        (current.receipts - current.payments) < (worst.receipts - worst.payments) ? current : worst,
      monthlyReport[0]
    );
  }
}
