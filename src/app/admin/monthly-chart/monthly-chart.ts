// monthly-chart.component.ts
import { Component, input, computed, effect, ViewChild, ElementRef, AfterViewInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonthlySummary } from '../../core/model/cashbook.model';

// Import Chart.js
import { Chart, ChartConfiguration, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-monthly-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <div class="chart-card">
        <div class="chart-header">
          <h6 class="chart-title">
            <i class="bi bi-bar-chart-steps"></i>
            Financial Analysis
          </h6>
          <div class="chart-controls">
            <button class="btn-chart" (click)="setChartType('bar')" [class.active]="currentChartType === 'bar'">
              <i class="bi bi-bar-chart"></i> Bar
            </button>
            <button class="btn-chart" (click)="setChartType('line')" [class.active]="currentChartType === 'line'">
              <i class="bi bi-graph-up"></i> Line
            </button>
          </div>
        </div>
        <div class="chart-body">
          <canvas #monthlyChartCanvas></canvas>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chart-container {
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

    .chart-title {
      margin: 0;
      font-size: 0.875rem;
      font-weight: 600;
      color: #1e293b;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .chart-title i {
      color: #3b82f6;
      font-size: 1rem;
    }

    .chart-controls {
      display: flex;
      gap: 0.5rem;
    }

    .btn-chart {
      padding: 0.375rem 0.75rem;
      border: 1px solid #e2e8f0;
      background: white;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .btn-chart:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
    }

    .btn-chart.active {
      background: #3b82f6;
      border-color: #3b82f6;
      color: white;
    }

    .chart-body {
      padding: 1.5rem;
      position: relative;
      height: 400px;
    }

    canvas {
      width: 100%;
      height: 100%;
    }

    @media (max-width: 768px) {
      .chart-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .chart-body {
        height: 300px;
        padding: 1rem;
      }
    }
  `]
})
export class MonthlyChartComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('monthlyChartCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  data = input.required<MonthlySummary[]>();
  currentChartType: 'bar' | 'line' = 'bar';

  private chart: Chart | null = null;

  ngAfterViewInit() {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && !changes['data'].firstChange) {
      this.updateChartData();
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
    this.recreateChart();
  }

  private recreateChart() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    this.createChart();
  }

  private createChart() {
    if (!this.canvasRef || !this.canvasRef.nativeElement) return;

    const ctx = this.canvasRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const chartData = this.prepareChartData();

    const config: ChartConfiguration = {
      type: this.currentChartType,
      data: {
        labels: chartData.months,
        datasets: this.getDatasets(chartData)
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
              font: {
                size: 11
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
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
                return '₹' + Number(value).toLocaleString();
              },
              font: {
                size: 10
              }
            },
            grid: {
              color: '#e2e8f0',

            }
          },
          x: {
            ticks: {
              font: {
                size: 10
              }
            },
            grid: {
              display: false
            }
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  private getDatasets(chartData: any): any[] {
    if (this.currentChartType === 'bar') {
      return [
        {
          label: 'Receipts',
          data: chartData.receipts,
          backgroundColor: 'rgba(16, 185, 129, 0.6)',
          borderColor: '#10b981',
          borderWidth: 2,
          borderRadius: 6,
          barPercentage: 0.7,
          categoryPercentage: 0.8
        },
        {
          label: 'Payments',
          data: chartData.payments,
          backgroundColor: 'rgba(239, 68, 68, 0.6)',
          borderColor: '#ef4444',
          borderWidth: 2,
          borderRadius: 6,
          barPercentage: 0.7,
          categoryPercentage: 0.8
        },
        {
          label: 'Net Balance',
          data: chartData.balances,
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: '#3b82f6',
          borderWidth: 2,
          borderRadius: 6,
          type: 'line',
          fill: false,
          tension: 0.4
        }
      ];
    } else {
      // Line chart configuration
      return [
        {
          label: 'Receipts',
          data: chartData.receipts,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'Payments',
          data: chartData.payments,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#ef4444',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'Net Balance',
          data: chartData.balances,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ];
    }
  }

  private prepareChartData() {
    const monthlyData = this.data();

    if (!monthlyData || monthlyData.length === 0) {
      return { months: [], receipts: [], payments: [], balances: [] };
    }

    const months = monthlyData.map(item => item.monthName);
    const receipts = monthlyData.map(item => item.receipts);
    const payments = monthlyData.map(item => item.payments);
    const balances = monthlyData.map(item => item.balance);

    return { months, receipts, payments, balances };
  }

  private updateChartData() {
    if (!this.chart) {
      this.createChart();
      return;
    }

    const chartData = this.prepareChartData();

    this.chart.data.labels = chartData.months;

    // Update datasets while preserving their configuration
    if (this.chart.data.datasets) {
      this.chart.data.datasets[0].data = chartData.receipts;
      this.chart.data.datasets[1].data = chartData.payments;
      this.chart.data.datasets[2].data = chartData.balances;
    }

    this.chart.update();
  }
}
