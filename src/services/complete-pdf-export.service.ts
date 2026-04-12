import { Injectable, inject } from '@angular/core';
import { CashbookService } from '../app/core/services/cashbook.service';
import { firstValueFrom } from 'rxjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Remove the module declaration - it's not needed

@Injectable({
  providedIn: 'root'
})
export class CompletePdfExportService {
  private cashbookService = inject(CashbookService);

  /**
   * Export complete report to PDF
   */
  async exportCompleteReport(year: number): Promise<void> {
    try {
      console.log('Starting PDF export for year:', year);

      // Get data
      const entries = await firstValueFrom(this.cashbookService.getEntriesByYear(year));
      console.log('Entries loaded:', entries.length);

      const monthlyReport = await firstValueFrom(this.cashbookService.getMonthlyReport(year));
      console.log('Monthly report loaded:', monthlyReport.length);

      const receiptAnalysis = await firstValueFrom(this.cashbookService.getCategoryAnalysis('receipt'));
      console.log('Receipt analysis loaded:', receiptAnalysis.length);

      const paymentAnalysis = await firstValueFrom(this.cashbookService.getCategoryAnalysis('payment'));
      console.log('Payment analysis loaded:', paymentAnalysis.length);

      // Calculate totals
      const totalReceipts = entries.filter(e => e.transactionType === 'receipt').reduce((s, e) => s + e.amount, 0);
      const totalPayments = entries.filter(e => e.transactionType === 'payment').reduce((s, e) => s + e.amount, 0);
      const netBalance = totalReceipts - totalPayments;

      // Create PDF
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      // Title Page
      this.addTitlePage(pdf, year, totalReceipts, totalPayments, netBalance);

      // Summary Section
      this.addSummarySection(pdf, entries, totalReceipts, totalPayments, netBalance);

      // Monthly Report Section
      this.addMonthlyReportSection(pdf, monthlyReport);

      // Receipt Analysis Section
      this.addCategoryAnalysisSection(pdf, receiptAnalysis, 'Receipt Analysis');

      // Payment Analysis Section
      this.addCategoryAnalysisSection(pdf, paymentAnalysis, 'Payment Analysis');

      // Transactions Section
      if (entries.length > 0) {
        this.addTransactionsSection(pdf, entries);
      }

      // Save PDF
      pdf.save(`Complete_Financial_Report_${year}.pdf`);
      console.log('PDF saved successfully');

    } catch (error) {
      console.error('PDF Export Error:', error);
      throw error;
    }
  }

  private addTitlePage(pdf: jsPDF, year: number, totalReceipts: number, totalPayments: number, netBalance: number): void {
    pdf.setFontSize(24);
    pdf.setTextColor(0, 0, 0);
    pdf.text('COMPLETE FINANCIAL REPORT', pdf.internal.pageSize.getWidth() / 2, 60, { align: 'center' });

    pdf.setFontSize(16);
    pdf.text(`Year: ${year}`, pdf.internal.pageSize.getWidth() / 2, 80, { align: 'center' });

    pdf.setFontSize(12);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, pdf.internal.pageSize.getWidth() / 2, 95, { align: 'center' });

    // Add summary boxes
    const startY = 130;
    const boxWidth = 60;
    const boxHeight = 40;
    const spacing = 20;
    const startX = (pdf.internal.pageSize.getWidth() - (boxWidth * 3 + spacing * 2)) / 2;

    // Receipts Box
    pdf.setFillColor(16, 185, 129);
    pdf.rect(startX, startY, boxWidth, boxHeight, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.text('Total Receipts', startX + boxWidth / 2, startY + 15, { align: 'center' });
    pdf.setFontSize(12);
    pdf.text(`₦${this.formatNumber(totalReceipts)}`, startX + boxWidth / 2, startY + 30, { align: 'center' });

    // Payments Box
    pdf.setFillColor(239, 68, 68);
    pdf.rect(startX + boxWidth + spacing, startY, boxWidth, boxHeight, 'F');
    pdf.text('Total Payments', startX + boxWidth + spacing + boxWidth / 2, startY + 15, { align: 'center' });
    pdf.text(`₦${this.formatNumber(totalPayments)}`, startX + boxWidth + spacing + boxWidth / 2, startY + 30, { align: 'center' });

    // Net Balance Box
    const balanceColor = netBalance >= 0 ? [16, 185, 129] : [239, 68, 68];
    pdf.setFillColor(balanceColor[0], balanceColor[1], balanceColor[2]);
    pdf.rect(startX + (boxWidth + spacing) * 2, startY, boxWidth, boxHeight, 'F');
    pdf.text('Net Balance', startX + (boxWidth + spacing) * 2 + boxWidth / 2, startY + 15, { align: 'center' });
    pdf.text(`₦${this.formatNumber(netBalance)}`, startX + (boxWidth + spacing) * 2 + boxWidth / 2, startY + 30, { align: 'center' });

    pdf.addPage();
  }

  private addSummarySection(pdf: jsPDF, entries: any[], totalReceipts: number, totalPayments: number, netBalance: number): void {
    pdf.setFontSize(18);
    pdf.setTextColor(0, 0, 0);
    pdf.text('EXECUTIVE SUMMARY', pdf.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

    const receiptCount = entries.filter(e => e.transactionType === 'receipt').length;
    const paymentCount = entries.filter(e => e.transactionType === 'payment').length;
    const avgTransaction = entries.length > 0 ? (totalReceipts + totalPayments) / entries.length : 0;

    const summaryData = [
      ['Total Receipts', `₦${this.formatNumber(totalReceipts)}`],
      ['Total Payments', `₦${this.formatNumber(totalPayments)}`],
      ['Net Balance', `₦${this.formatNumber(netBalance)}`],
      ['Total Transactions', entries.length.toString()],
      ['Receipt Count', receiptCount.toString()],
      ['Payment Count', paymentCount.toString()],
      ['Average Transaction', `₦${this.formatNumber(avgTransaction)}`]
    ];

    autoTable(pdf, {
      startY: 35,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 10 },
      bodyStyles: { fontSize: 9 },
      columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 80 } },
      margin: { left: 30, right: 30 }
    });

    pdf.addPage();
  }

  private addMonthlyReportSection(pdf: jsPDF, monthlyReport: any[]): void {
    pdf.setFontSize(18);
    pdf.text('MONTHLY FINANCIAL REPORT', pdf.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

    const monthlyData = monthlyReport.map(m => [
      m.monthName,
      `₦${this.formatNumber(m.receipts)}`,
      `₦${this.formatNumber(m.payments)}`,
      `₦${this.formatNumber(m.balance)}`
    ]);

    autoTable(pdf, {
      startY: 35,
      head: [['Month', 'Receipts', 'Payments', 'Net Balance']],
      body: monthlyData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 10 },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 15, right: 15 }
    });

    pdf.addPage();
  }

  private addCategoryAnalysisSection(pdf: jsPDF, analysis: any[], title: string): void {
    pdf.setFontSize(18);
    pdf.setTextColor(0, 0, 0);
    pdf.text(title, pdf.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

    if (analysis.length === 0) {
      pdf.setFontSize(12);
      pdf.text('No data available', pdf.internal.pageSize.getWidth() / 2, 50, { align: 'center' });
      pdf.addPage();
      return;
    }

    const analysisData = analysis.map(a => [
      a.category,
      `₦${this.formatNumber(a.amount)}`,
      `${a.percentage.toFixed(1)}%`,
      a.count.toString()
    ]);

    const total = analysis.reduce((s, a) => s + a.amount, 0);
    const totalCount = analysis.reduce((s, a) => s + a.count, 0);
    analysisData.push(['TOTAL', `₦${this.formatNumber(total)}`, '100%', totalCount.toString()]);

    const colorRGB = title.includes('Receipt') ? [16, 185, 129] : [239, 68, 68];

    autoTable(pdf, {
      startY: 35,
      head: [['Category', 'Amount', 'Percentage', 'Transactions']],
      body: analysisData,
      theme: 'striped',
      headStyles: {  textColor: 255, fontSize: 10 },
      bodyStyles: { fontSize: 9 },
      footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
      margin: { left: 15, right: 15 }
    });

    pdf.addPage();
  }

  private addTransactionsSection(pdf: jsPDF, entries: any[]): void {
    pdf.setFontSize(18);
    pdf.text('TRANSACTION DETAILS', pdf.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

    // Limit to 20 transactions per page for readability
    const chunkSize = 20;
    let startY = 35;
    let pageNum = 1;

    for (let i = 0; i < entries.length; i += chunkSize) {
      if (i > 0) {
        pdf.addPage();
        startY = 35;
        pdf.setFontSize(16);
        pdf.text(`TRANSACTION DETAILS (Page ${++pageNum})`, pdf.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
      }

      const chunk = entries.slice(i, i + chunkSize);
      const transactionData = chunk.map(e => [
        new Date(e.date).toLocaleDateString(),
        e.voucherNumber.toString(),
        e.transactionType.toUpperCase(),
        e.description.substring(0, 40),
        `₦${this.formatNumber(e.amount)}`
      ]);

      autoTable(pdf, {
        startY: startY,
        head: [['Date', 'Voucher No', 'Type', 'Description', 'Amount']],
        body: transactionData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        margin: { left: 10, right: 10 }
      });

      startY = (pdf as any).lastAutoTable.finalY + 10;
    }
  }

  private formatNumber(value: number): string {
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
