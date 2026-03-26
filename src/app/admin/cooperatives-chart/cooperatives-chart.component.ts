import { Component, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import Chart from 'chart.js/auto';
import { DecimalPipe } from "@angular/common";

@Component({
  selector: 'ims-cooperatives-chart',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './cooperatives-chart.component.html',
  styleUrl: './cooperatives-chart.component.scss'
})
export class CooperativesChartComponent implements AfterViewInit, OnDestroy {
  // ============================================
  // WEEKLY BAR CHART - Period Switching
  // ============================================

  // ViewChild reference for the bar chart
  @ViewChild('updatingBarChart') updatingBarChartRef!: ElementRef;

  // Chart instance
  private barChart?: Chart<'bar', number[], string>;

  // Data and state
  currentPeriod: 'thisWeek' | 'lastWeek' = 'thisWeek';

  private weeklyData = {
    thisWeek: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      new: [1200, 1900, 1500, 2200, 1800, 1400, 1600]
    },
    lastWeek: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      new: [1000, 1700, 1300, 2000, 1600, 1200, 1400]
    }
  };

  // ============= LIFECYCLE HOOKS =============
  ngAfterViewInit() {
    this.initializeBarChart();
  }

  ngOnDestroy() {
    this.destroyBarChart();
  }

  // ============= CHART METHODS =============

  // Initialize chart
  private initializeBarChart() {
    if (!this.updatingBarChartRef) return;

    const data = this.weeklyData[this.currentPeriod];

    this.barChart = new Chart(this.updatingBarChartRef.nativeElement, {
      type: "bar",
      data: {
        labels: data.labels,
        datasets: [
          {
            label: "New",
            data: data.new,
            backgroundColor: "red",
            hoverBackgroundColor: "red",
            borderColor: "red",
            borderRadius: 4,
            barPercentage: 0.6,
            categoryPercentage: 0.8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: "#e7eaf3" },
            ticks: {
              stepSize: 100,
              font: { size: 12, family: "Open Sans, sans-serif" },
              color: "#97a4af",
              padding: 10,
            },
            border: { display: false }
          },
          x: {
            grid: { display: false },
            ticks: {
              font: { size: 12, family: "Open Sans, sans-serif" },
              color: "#97a4af",
              padding: 5
            },
            border: { display: false }
          }
        },
        plugins: {
          legend: { display: false }, // Legend is handled in the HTML
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.dataset.label}: ${context.raw}`;
              }
            }
          }
        }
      }
    });
  }

  // Period switch method
  switchPeriod(period: 'thisWeek' | 'lastWeek') {
    this.currentPeriod = period;
    this.updateBarChartData();
  }

  // Update method for period switching
  private updateBarChartData() {
    if (!this.barChart) return;

    const data = this.weeklyData[this.currentPeriod];

    this.barChart.data.labels = data.labels;
    this.barChart.data.datasets[0].data = data.new;
    this.barChart.update();
  }

  // Destroy method
  private destroyBarChart() {
    this.barChart?.destroy();
  }

  // ============================================
  // OPTIONAL: Calculate percentage for display
  // ============================================
  getPercentageChange(): string {
    const thisWeekTotal = this.weeklyData.thisWeek.new.reduce((a, b) => a + b, 0);
    const lastWeekTotal = this.weeklyData.lastWeek.new.reduce((a, b) => a + b, 0);
    const change = ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100;
    return change.toFixed(1);
  }

  getAveragePercentage(): string {
    const total = this.weeklyData[this.currentPeriod].new.reduce((a, b) => a + b, 0);
    const average = total / this.weeklyData[this.currentPeriod].new.length;
    return ((average / 100) * 35).toFixed(0); // Calculate 35% of average for display
  }
}