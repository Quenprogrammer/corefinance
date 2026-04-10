// transaction-chart.component.ts
import { Component, input, inject, effect, ViewChild, ElementRef, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { CashbookService, MonthlyReport } from '../../core/services/cashbook.service';

Chart.register(...registerables);

@Component({
  selector: 'app-transaction-chart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="transaction-chart-container">
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-title-section">
            <i class="bi bi-bar-chart-line"></i>
            <h6>Transaction Analysis</h6>
          </div>
          <div class="chart-controls">
            <button class="btn-control" (click)="setChartType('bar')" [class.active]="currentChartType === 'bar'">
              <i class="bi bi-bar-chart"></i> Bar
            </button>
            <button class="btn-control" (click)="setChartType('line')" [class.active]="currentChartType === 'line'">
              <i class="bi bi-graph-up"></i> Line
            </button>
            <select class="year-select" [(ngModel)]="selectedYear" (change)="onYearChange()">
              <option *ngFor="let year of years" [value]="year">{{ year }}</option>
            </select>
          </div>
        </div>

        <!-- Loading State -->
        <div class="chart-body" *ngIf="isLoading">
          <div class="loading-container">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p>Loading chart data...</p>
          </div>
        </div>

        <!-- Chart Canvas -->
        <div class="chart-body" *ngIf="!isLoading">
          <canvas #transactionChartCanvas></canvas>
        </div>

        <!-- Empty State -->
        <div class="chart-body" *ngIf="!isLoading && monthlyData.length === 0">
          <div class="empty-container">
            <i class="bi bi-bar-chart-line"></i>
            <p>No data available for {{ selectedYear }}</p>
          </div>
        </div>

        <div class="chart-footer" *ngIf="summary && monthlyData.length > 0">
          <div class="summary-item">
            <span class="label">Total Receipts:</span>
            <span class="value positive">{{ summary.totalReceipts | number:'1.2-2' }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Total Payments:</span>
            <span class="value negative">{{ summary.totalPayments | number:'1.2-2' }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Net Balance:</span>
            <span class="value" [class.positive]="summary.netBalance >= 0" [class.negative]="summary.netBalance < 0">
              {{ summary.netBalance | number:'1.2-2' }}
            </span>
          </div>
          <div class="summary-item">
            <span class="label">Best Month:</span>
            <span class="value">{{ summary.bestMonth }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .transaction-chart-container {
      margin-bottom: 1.5rem;
    }

    .chart-card {
      background: white;
      border-radius: 1rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .chart-header {
      padding: 1rem 1.5rem;
      background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .chart-title-section {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .chart-title-section i {
      font-size: 1.25rem;
      color: #3b82f6;
    }

    .chart-title-section h6 {
      margin: 0;
      font-weight: 600;
      color: #1e293b;
    }

    .chart-controls {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .btn-control {
      padding: 0.375rem 0.75rem;
      border: 1px solid #e2e8f0;
      background: white;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.75rem;
    }

    .btn-control:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
    }

    .btn-control.active {
      background: #3b82f6;
      border-color: #3b82f6;
      color: white;
    }

    .year-select {
      padding: 0.375rem 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      background: white;
      cursor: pointer;
      font-size: 0.75rem;
    }

    .chart-body {
      padding: 1.5rem;
      position: relative;
      height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    canvas {
      width: 100%;
      height: 100%;
    }

    .loading-container, .empty-container {
      text-align: center;
      color: #64748b;
    }

    .loading-container .spinner-border {
      width: 3rem;
      height: 3rem;
      margin-bottom: 1rem;
    }

    .empty-container i {
      font-size: 3rem;
      margin-bottom: 1rem;
      display: block;
    }

    .chart-footer {
      padding: 1rem 1.5rem;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-around;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }

    .summary-item .label {
      font-size: 0.75rem;
      color: #64748b;
      text-transform: uppercase;
    }

    .summary-item .value {
      font-size: 1rem;
      font-weight: 600;
      font-family: 'Courier New', monospace;
    }

    .value.positive {
      color: #10b981;
    }

    .value.negative {
      color: #ef4444;
    }

    @media (max-width: 768px) {
      .chart-header {
        flex-direction: column;
        align-items: stretch;
      }

      .chart-controls {
        justify-content: space-between;
      }

      .chart-body {
        height: 300px;
        padding: 1rem;
      }
    }
  `]
})
export class TransactionChartComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('transactionChartCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private cashbookService = inject(CashbookService);

  selectedYear = new Date().getFullYear();
  years: number[] = [];
  currentChartType: 'bar' | 'line' = 'bar';
  monthlyData: MonthlyReport[] = [];
  summary = { totalReceipts: 0, totalPayments: 0, netBalance: 0, bestMonth: '' };
  isLoading = false;

  private chart: Chart | null = null;
  private isViewInitialized = false;
  private dataLoaded = false;

  constructor() {
    // Generate years (last 3 years and next 2 years)
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 3; i <= currentYear + 2; i++) {
      this.years.push(i);
    }
  }

  ngOnInit() {
    // Load data when component initializes
    this.loadMonthlyData();
  }

  ngAfterViewInit() {
    this.isViewInitialized = true;
    // If data is already loaded, create chart
    if (this.dataLoaded && this.monthlyData.length > 0) {
      this.createChartWithDelay();
    }
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  setChartType(type: 'bar' | 'line') {
    if (this.currentChartType === type) return;
    this.currentChartType = type;
    if (this.monthlyData.length > 0) {
      this.recreateChart();
    }
  }

  onYearChange() {
    this.loadMonthlyData();
  }

  calculateSummary() {
    const totalReceipts = this.monthlyData.reduce((sum, m) => sum + m.receipts, 0);
    const totalPayments = this.monthlyData.reduce((sum, m) => sum + m.payments, 0);
    const netBalance = totalReceipts - totalPayments;

    let bestMonthData = this.monthlyData.reduce((best, current) =>
        current.balance > best.balance ? current : best,
      this.monthlyData[0] || { monthName: 'N/A', balance: 0 }
    );

    this.summary = {
      totalReceipts,
      totalPayments,
      netBalance,
      bestMonth: bestMonthData?.monthName || 'N/A'
    };
  }

  private recreateChart() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    this.createChart();
  }

  private createChartWithDelay() {
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      this.createChart();
    }, 50);
  }

  private createChart() {
    // Check if canvas is available and data exists
    if (!this.canvasRef || !this.canvasRef.nativeElement || this.monthlyData.length === 0) {
      console.log('Cannot create chart: canvas or data missing');
      return;
    }

    const ctx = this.canvasRef.nativeElement.getContext('2d');
    if (!ctx) {
      console.log('Cannot get canvas context');
      return;
    }

    // Destroy existing chart if any
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    // Prepare datasets based on chart type
    let datasets: any[] = [];

    if (this.currentChartType === 'bar') {
      datasets = [
        {
          label: 'Receipts',
          data: this.monthlyData.map(item => item.receipts),
          backgroundColor: 'rgba(16, 185, 129, 0.6)',
          borderColor: '#10b981',
          borderWidth: 2,
          borderRadius: 6,
          barPercentage: 0.7,
          categoryPercentage: 0.8
        },
        {
          label: 'Payments',
          data: this.monthlyData.map(item => item.payments),
          backgroundColor: 'rgba(239, 68, 68, 0.6)',
          borderColor: '#ef4444',
          borderWidth: 2,
          borderRadius: 6,
          barPercentage: 0.7,
          categoryPercentage: 0.8
        },
        {
          label: 'Net Balance',
          data: this.monthlyData.map(item => item.balance),
          type: 'line',
          backgroundColor: 'transparent',
          borderColor: '#3b82f6',
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ];
    } else {
      datasets = [
        {
          label: 'Receipts',
          data: this.monthlyData.map(item => item.receipts),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        },
        {
          label: 'Payments',
          data: this.monthlyData.map(item => item.payments),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#ef4444',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        },
        {
          label: 'Net Balance',
          data: this.monthlyData.map(item => item.balance),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }
      ];
    }

    const config: ChartConfiguration = {
      type: this.currentChartType,
      data: {
        labels: this.monthlyData.map(item => item.monthName.substring(0, 3)),
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              boxWidth: 8,
              font: { size: 11 }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) label += ': ';
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 2
                  }).format(context.parsed.y);
                }
                return label;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '$' + Number(value).toLocaleString();
              },
              font: { size: 10 }
            },
            grid: { color: '#e2e8f0' }
          },
          x: {
            ticks: { font: { size: 10 } },
            grid: { display: false }
          }
        }
      }
    };

    try {
      this.chart = new Chart(ctx, config);
      console.log('Chart created successfully');
    } catch (error) {
      console.error('Error creating chart:', error);
    }
  }

  loadMonthlyData() {
    console.log('Loading data for year:', this.selectedYear);
    this.isLoading = true;
    this.dataLoaded = false;

    this.cashbookService.getMonthlyReport(this.selectedYear).subscribe({
      next: (data) => {
        console.log('Monthly data received:', data);
        this.monthlyData = data;
        this.calculateSummary();
        this.dataLoaded = true;
        this.isLoading = false;

        // Wait for view to be ready and create chart
        if (this.isViewInitialized) {
          this.createChartWithDelay();
        }
      },
      error: (error) => {
        console.error('Error loading monthly data:', error);
        this.isLoading = false;
        this.dataLoaded = false;
      }
    });
  }
}
