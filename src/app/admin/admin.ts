import {Component, ElementRef, ViewChild} from '@angular/core';
import {AuthService} from '../../services/guard/auth/auth';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {CurrencyPipe, DatePipe, DecimalPipe, NgClass, NgForOf, NgIf, SlicePipe} from '@angular/common';
import { Chart, registerables } from 'chart.js';
import {FormsModule} from '@angular/forms';
import {CooperativesChartComponent} from './cooperatives-chart/cooperatives-chart.component';
@Component({
  selector: 'app-admin',
  imports: [
    RouterLink,
    NgForOf,
    CurrencyPipe,
    DatePipe,
    FormsModule,
    NgIf,
    RouterLinkActive,
    DecimalPipe,
    NgClass,
    SlicePipe,
    CooperativesChartComponent,


  ],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin {
  constructor(private auth: AuthService, private router: Router) {}

  logout() {
    this.auth.logout();
    this.router.navigate(['/']); // back to login
  }
  @ViewChild('areaChart') areaChartRef!: ElementRef;
  @ViewChild('doughnutChart') doughnutChartRef!: ElementRef;

  sidebarCollapsed = false;
  activeSubmenu: string | null = null;
  searchQuery = '';
  isDarkMode = false;
  showNotifications = false;
  showUserMenu = false;
  selectedPeriod = 'This Month';

  stats = [
    {
      label: 'Total Balance',
      value: 'KES 2,456,789',
      trend: '+12.5% from last month',
      trendPositive: true,
      icon: 'fa-wallet',
      iconClass: 'bg-primary bg-gradient text-white'
    },
    {
      label: 'Total Income',
      value: 'KES 456,789',
      trend: '+8.2% from last month',
      trendPositive: true,
      icon: 'fa-arrow-up',
      iconClass: 'bg-success bg-gradient text-white'
    },
    {
      label: 'Total Expenses',
      value: 'KES 234,567',
      trend: '-3.1% from last month',
      trendPositive: false,
      icon: 'fa-arrow-down',
      iconClass: 'bg-danger bg-gradient text-white'
    },
    {
      label: 'Pending Approvals',
      value: '23',
      trend: 'Awaiting review',
      trendPositive: true,
      icon: 'fa-clock',
      iconClass: 'bg-warning bg-gradient text-white'
    }
  ];

  recentTransactions = [
    { id: 1, description: 'Office Supplies - Stationery', category: 'Operations', amount: 45600, type: 'expense', date: '2024-01-15', status: 'completed', user: 'John Doe', reference: 'INV-001' },
    { id: 2, description: 'Client Payment - ABC Corporation', category: 'Revenue', amount: 250000, type: 'income', date: '2024-01-15', status: 'completed', user: 'Sarah Kim', reference: 'PAY-002' },
    { id: 3, description: 'Employee Salaries - January', category: 'Payroll', amount: 180000, type: 'expense', date: '2024-01-14', status: 'pending', user: 'HR Dept', reference: 'SAL-003' },
    { id: 4, description: 'Consulting Services - Tech Solutions', category: 'Services', amount: 75000, type: 'income', date: '2024-01-14', status: 'completed', user: 'Mike Chen', reference: 'INV-004' },
    { id: 5, description: 'Internet & Phone Bills', category: 'Utilities', amount: 15000, type: 'expense', date: '2024-01-13', status: 'completed', user: 'Admin', reference: 'UTL-005' }
  ];

  pendingApprovals = [
    { id: 1, description: 'Travel Reimbursement - Nairobi Trip', user: 'Alice Kimani', amount: 25000, date: '2024-01-15', priority: 'high', department: 'Sales' },
    { id: 2, description: 'Vendor Payment - Office Furniture', user: 'Bob Otieno', amount: 150000, date: '2024-01-15', priority: 'medium', department: 'Operations' },
    { id: 3, description: 'Petty Cash Request - Tea & Coffee', user: 'Carol Wanjiku', amount: 5000, date: '2024-01-14', priority: 'low', department: 'Admin' }
  ];

  ncoaCodes = [
    { code: '1001', description: 'Cash in Bank - Operating', balance: 1456789, trend: '+2.5%', category: 'Assets' },
    { code: '1002', description: 'Cash in Bank - Payroll', balance: 1000000, trend: '0%', category: 'Assets' },
    { code: '2001', description: 'Accounts Payable', balance: 567890, trend: '-5.2%', category: 'Liabilities' },
    { code: '3001', description: 'Revenue - Consulting', balance: 850000, trend: '+12.3%', category: 'Revenue' }
  ];

  budgetData = [
    { category: 'Operations', budget: 500000, actual: 425000, remaining: 75000 },
    { category: 'Marketing', budget: 300000, actual: 275000, remaining: 25000 },
    { category: 'Payroll', budget: 600000, actual: 580000, remaining: 20000 },
    { category: 'IT Services', budget: 200000, actual: 145000, remaining: 55000 }
  ];

  notifications = [
    { id: 1, message: 'New transaction requires approval', time: '5 min ago', type: 'warning', read: false },
    { id: 2, message: 'Month-end closing in 3 days', time: '1 hour ago', type: 'info', read: false },
    { id: 3, message: 'Budget alert: Marketing at 92%', time: '2 hours ago', type: 'danger', read: true }
  ];

  quickActions = [
    { icon: 'fa-plus-circle', label: 'New Transaction', color: '#0d6efd', route: '/transactions/new' },
    { icon: 'fa-upload', label: 'Bulk Upload', color: '#198754', route: '/transactions/bulk-upload' },
    { icon: 'fa-file-pdf', label: 'Generate Report', color: '#ffc107', route: '/reports' },
    { icon: 'fa-check-circle', label: 'Approvals', color: '#dc3545', route: '/transactions/approve' }
  ];

  get filteredTransactions() {
    return this.recentTransactions.filter(t =>
      t.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  get unreadNotifications(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  ngOnInit(): void {
    this.checkTheme();
  }

  ngAfterViewInit(): void {
    this.createCharts();
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleSubmenu(menu: string): void {
    this.activeSubmenu = this.activeSubmenu === menu ? null : menu;
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    document.body.classList.toggle('dark-theme', this.isDarkMode);
  }

  markAsRead(notificationId: number): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  private checkTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';
    document.body.classList.toggle('dark-theme', this.isDarkMode);
  }

  private createCharts(): void {
    // Area Chart
    new Chart(this.areaChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Income',
            data: [450000, 520000, 480000, 600000, 580000, 620000, 590000, 630000, 610000, 650000, 670000, 700000],
            borderColor: '#198754',
            backgroundColor: 'rgba(25, 135, 84, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Expenses',
            data: [380000, 420000, 450000, 390000, 410000, 430000, 400000, 420000, 440000, 460000, 480000, 500000],
            borderColor: '#dc3545',
            backgroundColor: 'rgba(220, 53, 69, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });

    // Doughnut Chart
    new Chart(this.doughnutChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Operations', 'Marketing', 'Payroll', 'IT', 'Others'],
        datasets: [{
          data: [35, 20, 25, 15, 5],
          backgroundColor: ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6c757d'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        },
        cutout: '70%'
      }
    });
  }
}
