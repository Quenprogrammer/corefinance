import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardStats } from '../../../core/model/cashbook.model';
import {TransactionChartComponent} from '../../transaction-chart/transaction-chart';

@Component({
  selector: 'app-dashboard-stats',
  standalone: true,
  imports: [CommonModule, TransactionChartComponent],
  template: `
    <div class="dashboard-container">
      <div class="stats-grid">
        <!-- Receipts Card -->
        <div class="stat-card receipt-card">
          <div class="stat-card-inner">
            <div class="stat-header">
              <div class="stat-icon-wrapper">
                <div class="stat-icon receipt-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                  </svg>
                </div>
              </div>
              <div class="stat-trend positive">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z" fill="currentColor"/>
                </svg>
                <span>+12.5%</span>
              </div>
            </div>
            <div class="stat-content">
              <h3 class="stat-value">₦{{stats().totalReceipts | number:'1.2-2'}}</h3>
              <p class="stat-label">Total Receipts</p>
              <div class="stat-meta">
                <span class="stat-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                  </svg>
                  {{stats().receiptCount}} transactions
                </span>
              </div>
            </div>
          </div>
          <div class="card-shine"></div>
        </div>

        <!-- Payments Card -->
        <div class="stat-card payment-card">
          <div class="stat-card-inner">
            <div class="stat-header">
              <div class="stat-icon-wrapper">
                <div class="stat-icon payment-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                  </svg>
                </div>
              </div>
              <div class="stat-trend negative">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6h-6z" fill="currentColor"/>
                </svg>
                <span>-8.3%</span>
              </div>
            </div>
            <div class="stat-content">
              <h3 class="stat-value">₦{{stats().totalPayments | number:'1.2-2'}}</h3>
              <p class="stat-label">Total Payments</p>
              <div class="stat-meta">
                <span class="stat-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                  </svg>
                  {{stats().paymentCount}} transactions
                </span>
              </div>
            </div>
          </div>
          <div class="card-shine"></div>
        </div>

        <!-- Balance Card -->
        <div class="stat-card balance-card">
          <div class="stat-card-inner">
            <div class="stat-header">
              <div class="stat-icon-wrapper">
                <div class="stat-icon balance-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" fill="currentColor"/>
                  </svg>
                </div>
              </div>
              <div class="stat-trend neutral">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M4 12h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span>Stable</span>
              </div>
            </div>
            <div class="stat-content">
              <h3 class="stat-value">₦{{stats().currentBalance | number:'1.2-2'}}</h3>
              <p class="stat-label">Current Balance</p>
              <div class="stat-meta">
                <span class="stat-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                  </svg>
                  Running balance
                </span>
              </div>
            </div>
          </div>
          <div class="card-shine"></div>
        </div>

        <!-- Average Transaction Card -->
        <div class="stat-card average-card">
          <div class="stat-card-inner">
            <div class="stat-header">
              <div class="stat-icon-wrapper">
                <div class="stat-icon average-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor"/>
                  </svg>
                </div>
              </div>
              <div class="stat-trend positive">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z" fill="currentColor"/>
                </svg>
                <span>+5.2%</span>
              </div>
            </div>
            <div class="stat-content">
              <h3 class="stat-value">₦{{stats().averageTransaction | number:'1.2-2'}}</h3>
              <p class="stat-label">Average Transaction</p>
              <div class="stat-meta">
                <span class="stat-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor"/>
                  </svg>
                  All transactions
                </span>
              </div>
            </div>
          </div>
          <div class="card-shine"></div>
        </div>
      </div>

      <!-- Chart Section -->
      <div class="chart-container">
        <div class="chart-header">
          <h3 class="chart-title">Transaction Overview</h3>
          <div class="chart-legend">
            <span class="legend-item">
              <span class="legend-color receipts-color"></span>
              Receipts
            </span>
            <span class="legend-item">
              <span class="legend-color payments-color"></span>
              Payments
            </span>
          </div>
        </div>
        <div class="chart-wrapper">
<app-transaction-chart></app-transaction-chart>
         </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    .dashboard-container {
      padding: 20px;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    /* Stat Card Base Styles */
    .stat-card {
      position: relative;
      border-radius: 20px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      background: white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .stat-card-inner {
      position: relative;
      padding: 20px;
      z-index: 2;
      background: white;
    }

    /* Card Colors - Subtle Gradients */
    .receipt-card {
      background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
      border-left: 4px solid #4c9aff;
    }

    .payment-card {
      background: linear-gradient(135deg, #ffffff 0%, #fff8f8 100%);
      border-left: 4px solid #ff6b6b;
    }

    .balance-card {
      background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
      border-left: 4px solid #51cf66;
    }

    .average-card {
      background: linear-gradient(135deg, #ffffff 0%, #fff9e6 100%);
      border-left: 4px solid #ffd43b;
    }

    /* Icon Styles */
    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .stat-icon-wrapper {
      margin-bottom: 0;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .receipt-icon {
      background: linear-gradient(135deg, #4c9aff15 0%, #4c9aff25 100%);
      color: #4c9aff;
    }

    .payment-icon {
      background: linear-gradient(135deg, #ff6b6b15 0%, #ff6b6b25 100%);
      color: #ff6b6b;
    }

    .balance-icon {
      background: linear-gradient(135deg, #51cf6615 0%, #51cf6625 100%);
      color: #51cf66;
    }

    .average-icon {
      background: linear-gradient(135deg, #ffd43b15 0%, #ffd43b25 100%);
      color: #ffd43b;
    }

    .stat-card:hover .stat-icon {
      transform: scale(1.02);
    }

    /* Content Styles */
    .stat-content {
      color: #1f2937;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 6px 0;
      letter-spacing: -0.3px;
      line-height: 1.2;
      color: #111827;
    }

    .stat-label {
      font-size: 13px;
      font-weight: 500;
      margin: 0 0 10px 0;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .stat-meta {
      margin-top: 8px;
    }

    .stat-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 8px;
      background: #f3f4f6;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
      color: #6b7280;
    }

    .stat-badge svg {
      opacity: 0.7;
    }

    /* Trend Indicators */
    .stat-trend {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      background: rgba(0, 0, 0, 0.03);
    }

    .stat-trend.positive {
      color: #10b981;
    }

    .stat-trend.negative {
      color: #ef4444;
    }

    .stat-trend.neutral {
      color: #f59e0b;
    }

    /* Shine Effect */
    .card-shine {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
      transform: translateX(-100%);
      transition: transform 0.6s ease;
      pointer-events: none;
    }

    .stat-card:hover .card-shine {
      transform: translateX(100%);
    }

    /* Chart Section */
    .chart-container {
      background: white;
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1);
      margin-top: 24px;
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .chart-title {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin: 0;
    }

    .chart-legend {
      display: flex;
      gap: 20px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #6b7280;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 3px;
    }

    .receipts-color {
      background: linear-gradient(135deg, #4c9aff, #667eea);
    }

    .payments-color {
      background: linear-gradient(135deg, #ff6b6b, #f5576c);
    }

    .chart-wrapper {
      position: relative;
      width: 100%;
      min-height: 400px;
      background: #fafbfc;
      border-radius: 12px;
      padding: 16px;
    }

    /* Animation for initial load */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .stat-card {
      animation: fadeInUp 0.4s ease-out forwards;
      opacity: 0;
    }

    .stat-card:nth-child(1) { animation-delay: 0.05s; }
    .stat-card:nth-child(2) { animation-delay: 0.1s; }
    .stat-card:nth-child(3) { animation-delay: 0.15s; }
    .stat-card:nth-child(4) { animation-delay: 0.2s; }

    .chart-container {
      animation: fadeInUp 0.5s ease-out forwards;
      animation-delay: 0.25s;
      opacity: 0;
    }

    /* Responsive Design */
    @media (max-width: 1200px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
      }
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .stat-value {
        font-size: 24px;
      }

      .stat-card-inner {
        padding: 16px;
      }

      .stat-icon {
        width: 40px;
        height: 40px;
      }

      .chart-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .chart-wrapper {
        min-height: 300px;
        padding: 12px;
      }
    }

    /* Loading State */
    .loading .stat-value {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 6px;
      color: transparent;
      width: 70%;
    }

    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* Dark Mode Support */
    @media (prefers-color-scheme: dark) {
      .stat-card {
        background: #1f2937;
      }

      .stat-card-inner {
        background: #1f2937;
      }

      .receipt-card {
        background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
      }

      .payment-card {
        background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
      }

      .balance-card {
        background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
      }

      .average-card {
        background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
      }

      .stat-value {
        color: #f3f4f6;
      }

      .stat-label {
        color: #9ca3af;
      }

      .stat-badge {
        background: #374151;
        color: #9ca3af;
      }

      .chart-container {
        background: #1f2937;
      }

      .chart-title {
        color: #f3f4f6;
      }

      .chart-wrapper {
        background: #111827;
      }
    }
  `]
})
export class DashboardStatsComponent {
  stats = input.required<DashboardStats>();
}
