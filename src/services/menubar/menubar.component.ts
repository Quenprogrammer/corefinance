import {Component, inject, Input} from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import { ModalService } from './modal.service';

@Component({
  selector: 'ims-menubar',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink],
  styles: [`
    .open-modal-btn {

      background-color: #0d6efd; /* default color (blue example) */
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .open-modal-btn:hover {
      background-color: #dc3545; /* red */
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999 !important;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-container {
      background: white;
      border-radius: 24px;
      width: 90%;
      max-width: 450px;
      max-height: 90vh;
      overflow: hidden;
      animation: slideIn 0.3s ease;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }

    @keyframes slideIn {
      from {
        transform: translateY(30px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: white;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #1f2937;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 6px;
      color: #6b7280;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: #f3f4f6;
      transform: rotate(90deg);
    }

    .modal-body {
      padding: 20px;
      max-height: calc(90vh - 140px);
      overflow-y: auto;
    }

    .menu-items {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 16px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      background: white;
      text-decoration: none;
    }

    .menu-item:hover {
      background: #f9fafb;
      transform: translateX(4px);
    }

    .menu-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      color: white;
      flex-shrink: 0;
    }

    .menu-content {
      flex: 1;
    }

    .menu-title {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
    }

    .menu-description {
      margin: 0;
      font-size: 12px;
      color: #6b7280;
      line-height: 1.4;
    }

    .menu-arrow {
      color: #9ca3af;
      font-size: 18px;
      transition: all 0.2s;
    }

    .menu-item:hover .menu-arrow {
      transform: translateX(4px);
      color: #667eea;
    }

    .modal-body::-webkit-scrollbar {
      width: 6px;
    }

    .modal-body::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    .modal-body::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }

    .modal-body::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }

    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: flex-end;
      background: white;
    }

    .btn-cancel {
      padding: 8px 20px;
      background: #f3f4f6;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      color: #6b7280;
      transition: all 0.2s;
    }

    .btn-cancel:hover {
      background: #e5e7eb;
    }
    .header-glass {
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(20px);

      margin-bottom: 32px;

      box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.5), 0 8px 24px -6px rgba(0, 0, 0, 0.3);
      transition: all 0.3s ease;
    }

    .header-glass:hover {
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
    }

    .header-glass .header-content {
      padding: 10px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .header-glass .logo-section {
      display: flex;
      align-items: center;
      gap: 1px;
    }

    .header-glass .logo-section .logo-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    .header-glass .logo-section .logo-text h1 {
      font-size: 24px;
      font-weight: 700;
      background: linear-gradient(135deg, #fff, #a8c0ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .header-glass .logo-section .logo-text span {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.7);
    }
  `],
  template: `
    <div class="">
      <div class="header-glass bg-dark ">
        <div class="header-content">
          <div class="logo-section">

            <div class="logo-text">
              <h1>{{ title }}</h1>
              <span>{{ subtitle }}</span>
            </div>
          </div>
          <button class="open-modal-btn" (click)="modalService.open()">
      Menu
          </button>
        </div>
      </div>
    </div>
    <div class="modal-overlay" *ngIf="modalService.isOpen()" (click)="modalService.close()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Navigation Menu</h3>
          <button class="close-btn" (click)="modalService.close()">✕</button>
        </div>
        <div class="modal-body">
          <div class="menu-items">
            <a class="menu-item" *ngFor="let item of menuItems"
               [routerLink]="item.link === '/logout' ? null : item.link"
               (click)="item.link === '/logout' ? logout() : modalService.close()">
              <div class="menu-icon" [style.background]="item.gradient">
                <i [class]="item.icon"></i>
              </div>
              <div class="menu-content">
                <h4 class="menu-title">{{ item.name }}</h4>
                <p class="menu-description">{{ item.description }}</p>
              </div>
              <div class="menu-arrow">
                <i class="bi bi-chevron-right"></i>
              </div>
            </a>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" (click)="modalService.close()">Close Menu</button>
        </div>
      </div>
    </div>
  `,

})
export class MenubarComponent {
  @Input() title: string = 'Cooperative Dashboard';
  @Input() subtitle: string = 'Management System';

  private router = inject(Router);

  private getCooperativeId(): string {
    const cooperativeId = this.router.url.split('/')[2];
    if (cooperativeId && cooperativeId !== 'cooperative') {
      return cooperativeId;
    }
    return sessionStorage.getItem('cooperativeId') || '';
  }

  menuItems = [
    {
      name: 'Accounts',
      icon: 'bi bi-grid-1x2-fill',
      link: this.getDashboardLink(),
      description: 'View your cooperative overview and statistics',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      name: 'Backup Data',
      icon: 'bi bi-grid-1x2-fill',
      link: this.getDashboardLink(),
      description: 'View your cooperative overview and statistics',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      name: 'Help center',
      icon: 'bi bi-people-fill',
      link: '/members',
      description: 'Manage all cooperative members',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      name: 'Export All Data',
      icon: 'bi bi-person-plus-fill',
      link: '/add-member',
      description: 'Register a new member to the cooperative',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      name: 'Restore Default',
      icon: 'bi bi-person-circle',
      link: '/profile',
      description: 'View and update your profile information',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    },
    {
      name: 'Notifications',
      icon: 'bi bi-bell-fill',
      link: '/notifications',
      description: 'Check your recent alerts and updates',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    },
    {
      name: 'Logout',
      icon: 'bi bi-box-arrow-right',
      link: '/logout',
      description: 'Sign out from your account',
      gradient: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)'
    }
  ];

  constructor(public modalService: ModalService) {}

  // Logout function to clear all sessions
  logout(): void {
    // Clear all session storage
    sessionStorage.clear();

    // Clear all local storage (if any)
    localStorage.clear();

    // Clear all cookies
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // Close the modal if open
    this.modalService.close();

    // Navigate to login page
    this.router.navigate(['/account-login']);
  }

  navigateTo(link: string) {
    if (link === '/logout') {
      this.logout();
    } else {
      this.modalService.close();
      this.router.navigate([link]);
    }
  }

  getDashboardLink(): string {
    return `/cooperative/${this.getCooperativeId()}`;
  }
}
