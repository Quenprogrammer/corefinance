import { Component, input, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardStats } from '../../../core/model/cashbook.model';
import { TransactionChartComponent } from '../../transaction-chart/transaction-chart';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-dashboard-stats',
  standalone: true,
  imports: [CommonModule, TransactionChartComponent, RouterLink],
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
                  ₦
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
      </div>

      <!-- Chart Section -->
      <div class="chart-container" #chartContainer>
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
          <div class="container py-4">
            <div class="row g-4">
              @for (item of menu; track item.icon) {
                <div class="col-6 col-md-4 col-lg-3">
                  <div class="card h-100 menu-card" [routerLink]="item.link">
                    <div class="card-body d-flex flex-column align-items-center justify-content-center text-center">
                      <!-- Centered Image with responsive sizing and graceful fallback -->
                      <div class="img-wrapper mb-3">
                        <img [src]="item.icon" alt="{{ item.name }}" class="menu-img" loading="lazy">
                      </div>
                      <!-- Centered Title / Text -->
                      <h6 class="card-title mb-0">{{ item.name }}</h6>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
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
      font-size: 20px;
      font-weight: bold;
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

    /* Animation for initial load - FIXED to not hide the chart */
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

    /* Chart container starts visible but with fade animation */
    .chart-container {
      animation: fadeInUp 0.5s ease-out forwards;
      animation-delay: 0.25s;
      opacity: 1; /* Changed from 0 to 1 */
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

    /* Dark Mode Support */
    @media (prefers-color-scheme: dark) {
      .stat-card {
        background: #1f2937;
      }

      .stat-card-inner {
        background: #1f2937;
      }

      .receipt-card,
      .payment-card,
      .balance-card,
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

    /* ========== GLOBAL / COMPONENT STYLES ========== */
    /* Ensures consistent box-sizing and smooth rendering */
    .menu-card {
      transition: transform 0.25s ease, box-shadow 0.3s ease;
      border: none;
      border-radius: 1.25rem;
      background:#1f2937;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.02);
      overflow: hidden;
      cursor: pointer;
    }

    /* Interactive hover effect: subtle lift + deeper shadow */
    .menu-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 20px 30px -12px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.05);
    }

    /* Card body: flex column centering both horizontally and vertically */
    .menu-card .card-body {
      padding: 1.75rem 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      min-height: 180px;
      background: #1f2937;
      border-radius: 1.25rem;
    }

    /* Image wrapper for consistent sizing and centering */
    .img-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
    }

    /* Image styling: fixed width with max-width for responsiveness, maintain aspect ratio */
    .menu-img {
      width: 100px;
      max-width: 80%;
      height: auto;
      object-fit: contain;
      transition: transform 0.2s ease;
      display: block;
      margin: 0 auto;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.05));
    }

    /* Slight image zoom on card hover for extra liveliness */
    .menu-card:hover .menu-img {
      transform: scale(1.02);
    }

    /* Title / Text styling: centered, modern typography */
    .card-title {
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: -0.01em;
      color: white;
      margin-top: 0.5rem;
      margin-bottom: 0;
      line-height: 1.4;
      transition: color 0.2s;
      word-break: break-word;
      max-width: 100%;
    }

    /* On hover, text gets slightly richer color */
    .menu-card:hover .card-title {
      color: #0f172a;
    }

    /* Additional responsive tweaks: for very small devices (<=480px) adjust image size and padding */
    @media (max-width: 576px) {
      .menu-img {
        width: 70px;
      }
      .menu-card .card-body {
        padding: 1.25rem 0.75rem;
        min-height: 150px;
      }
      .card-title {
        font-size: 0.85rem;
      }
    }

    /* For medium screens where grid looks neat, keep image width balanced */
    @media (min-width: 768px) and (max-width: 991px) {
      .menu-img {
        width: 90px;
      }
    }

    /* Optional: active/tap effect for mobile */
    .menu-card:active {
      transform: translateY(-2px);
      transition: transform 0.05s;
    }

  `]
})
export class DashboardStatsComponent implements AfterViewInit {
  stats = input.required<DashboardStats>();
  isChartVisible = false;

  @ViewChild('chartContainer') chartContainer!: ElementRef;

  ngAfterViewInit() {
    // Use Intersection Observer to detect when chart container is visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isChartVisible) {
          // Small delay to ensure container is fully rendered
          setTimeout(() => {
            this.isChartVisible = true;
          }, 100);
          observer.disconnect(); // Stop observing once chart is loaded
        }
      });
    }, { threshold: 0.1 });

    observer.observe(this.chartContainer.nativeElement);
  }

  menu=[
    {icon:"cashbook/1.png", name:"Add Transaction", link:"/add-transactions"},
    {icon:"cashbook/4.png", name:"Cashbook", link:"/admin"},

    {icon:"cashbook/3.png", name:"Payment Categories", link:"/ledger2"},


    {icon:"cashbook/6.png", name:"Receipt Categories", link:"/ledger"},



    {icon:"cashbook/11.png", name:"Transactions",link:"/transactions" },


    {icon:"cashbook/14.svg", name:"Monthly Analysis", link:"/monthly-transactions-details"},
    {icon:"cashbook/8.png", name:"Payment Transactions", link:"/payments-categories"},
    {icon:"cashbook/9.png", name:"Receipt Transactions", link:"/receipts-categories"},
    {icon:"cashbook/13.svg", name:"Export To Excel", link:"/exportData"},
    {icon:"cashbook/12.png", name:"Report A problem" , link:"/complain"},
  ]
}
