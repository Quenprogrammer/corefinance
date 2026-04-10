import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExportAllDataService } from '../../services/export-all-data.service';
import { CompletePdfExportService } from '../../services/complete-pdf-export.service';

@Component({
  selector: 'app-export-excel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="full-page-wrapper">
      <div class="export-card">
        <div class="export-header">
          <div class="header-icon">
            <span class="icon-emoji">📥</span>
          </div>
          <div class="header-text">
            <h3>Export Reports</h3>
            <p>Download your financial data in multiple formats</p>
          </div>
        </div>

        <!-- Year Selector -->
        <div class="year-row">
          <div class="year-selector">
            <span class="year-label">
              <span class="icon-emoji">📅</span>
              <span>Financial Year</span>
            </span>
            <select
              class="year-select"
              [(ngModel)]="selectedYear"
              (change)="onYearChange()"
              [disabled]="isExporting">
              <option *ngFor="let year of years" [value]="year">{{ year }}</option>
            </select>
          </div>
        </div>

        <!-- Buttons Container - Centered -->
        <div class="buttons-container">
          <div class="export-buttons-grid">
            <!-- Excel Export Button -->
            <button class="export-btn excel-btn" (click)="exportAllData()" [disabled]="isExporting">
              <div class="btn-icon">
                <span class="icon-emoji">📊</span>
              </div>
              <div class="btn-content">
                <span class="btn-title">Excel Export</span>
                <span class="btn-description">Complete data with multiple sheets for {{ selectedYear }}</span>
              </div>
              <div class="btn-status" *ngIf="isExporting && exportingType === 'excel'">
                <div class="spinner"></div>
              </div>
              <div class="btn-arrow" *ngIf="!(isExporting && exportingType === 'excel')">
                <span class="icon-emoji">→</span>
              </div>
            </button>

            <!-- PDF Export Button -->
            <button class="export-btn pdf-btn" (click)="exportToPDF()" [disabled]="isExporting">
              <div class="btn-icon">
                <span class="icon-emoji">📄</span>
              </div>
              <div class="btn-content">
                <span class="btn-title">PDF Export</span>
                <span class="btn-description">Professional formatted report for {{ selectedYear }}</span>
              </div>
              <div class="btn-status" *ngIf="isExporting && exportingType === 'pdf'">
                <div class="spinner"></div>
              </div>
              <div class="btn-arrow" *ngIf="!(isExporting && exportingType === 'pdf')">
                <span class="icon-emoji">→</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Success Message -->
        <div class="success-message" *ngIf="showSuccess">
          <span class="icon-emoji">✅</span>
          <div class="success-content">
            <strong>{{ successMessage }}</strong>
            <p>Your file has been generated successfully</p>
          </div>
          <button class="close-success" (click)="showSuccess = false">
            <span class="icon-emoji">✕</span>
          </button>
        </div>

        <!-- Info Note -->
        <div class="info-note">
          <span class="icon-emoji">ℹ️</span>
          <div class="info-content">
            <strong>Note:</strong> Excel export includes 6 sheets (Summary, Transactions, Monthly Report, Receipt Analysis, Payment Analysis, Statistics). PDF export includes a complete formatted report.
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Full Page Wrapper - Horizontal & Vertical Centering */
    .full-page-wrapper {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100vw;
      height: 100vh;

      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      overflow: auto;
      animation: fadeIn 0.5s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    /* Card Styles */
    .export-card {
      max-width: 800px;
      width: 100%;
      background: white;
      border-radius: 2rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
      animation: slideUp 0.5s cubic-bezier(0.2, 0.9, 0.4, 1.1);
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Header */
    .export-header {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      padding: 1.75rem 2rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .header-icon {
      width: 56px;
      height: 56px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-emoji {
      font-size: 1.75rem;
    }

    .header-text h3 {
      margin: 0;
      color: white;
      font-size: 1.5rem;
      font-weight: 600;
      letter-spacing: -0.025em;
    }

    .header-text p {
      margin: 0.25rem 0 0;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.875rem;
    }

    /* Year Selector Row */
    .year-row {
      padding: 1.25rem 2rem 0 2rem;
      display: flex;
      justify-content: flex-end;
      background: white;
    }

    .year-selector {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      background: #f8fafc;
      padding: 0.5rem 1.2rem;
      border-radius: 2rem;
      border: 1px solid #e2e8f0;
      transition: all 0.2s;
    }

    .year-label {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.85rem;
      font-weight: 500;
      color: #1e293b;
    }

    .year-select {
      background: white;
      border: 1px solid #cbd5e1;
      border-radius: 1.5rem;
      padding: 0.4rem 1rem;
      font-size: 0.85rem;
      font-weight: 500;
      color: #0f172a;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
    }

    .year-select:hover:not(:disabled) {
      border-color: #3b82f6;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .year-select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    }

    .year-select:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Buttons Container - Center Alignment */
    .buttons-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
    }

    .export-buttons-grid {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      width: 100%;
      max-width: 500px;
    }

    /* Export Button */
    .export-btn {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      border: none;
      border-radius: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      width: 100%;
      text-align: left;
    }

    .export-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s ease;
    }

    .export-btn:hover::before {
      left: 100%;
    }

    .export-btn:hover {
      transform: translateY(-2px);
    }

    .export-btn:active {
      transform: translateY(0);
    }

    .export-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    /* Excel Button */
    .excel-btn {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
    }

    .excel-btn:hover {
      box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
    }

    /* PDF Button */
    .pdf-btn {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
    }

    .pdf-btn:hover {
      box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
    }

    .btn-icon {
      width: 48px;
      height: 48px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .btn-icon .icon-emoji {
      font-size: 1.5rem;
    }

    .btn-content {
      flex: 1;
    }

    .btn-title {
      display: block;
      font-size: 1rem;
      font-weight: 600;
      color: white;
      margin-bottom: 0.25rem;
    }

    .btn-description {
      display: block;
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.8);
    }

    .btn-arrow {
      width: 32px;
      height: 32px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .export-btn:hover .btn-arrow {
      transform: translateX(4px);
      background: rgba(255, 255, 255, 0.3);
    }

    .btn-arrow .icon-emoji {
      font-size: 1rem;
      color: white;
    }

    .btn-status {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Success Message */
    .success-message {
      margin: 0 2rem 1.5rem 2rem;
      padding: 1rem;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .success-message .icon-emoji {
      font-size: 1.5rem;
    }

    .success-content {
      flex: 1;
    }

    .success-content strong {
      display: block;
      font-size: 0.875rem;
      color: #059669;
    }

    .success-content p {
      margin: 0;
      font-size: 0.75rem;
      color: #166534;
    }

    .close-success {
      width: 24px;
      height: 24px;
      border: none;
      background: rgba(16, 185, 129, 0.1);
      border-radius: 0.5rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .close-success:hover {
      background: rgba(16, 185, 129, 0.2);
    }

    .close-success .icon-emoji {
      font-size: 0.75rem;
    }

    /* Info Note */
    .info-note {
      margin: 0 2rem 2rem 2rem;
      padding: 1rem;
      background: #fefce8;
      border-left: 4px solid #eab308;
      border-radius: 0.75rem;
      display: flex;
      gap: 0.75rem;
    }

    .info-note .icon-emoji {
      font-size: 1.25rem;
    }

    .info-content {
      flex: 1;
      font-size: 0.75rem;
      color: #854d0e;
      line-height: 1.5;
    }

    .info-content strong {
      font-weight: 600;
    }

    /* Responsive */
    @media (max-width: 640px) {
      .full-page-wrapper {
        padding: 1rem;
      }

      .export-card {
        max-width: 100%;
      }

      .export-header {
        padding: 1.25rem;
      }

      .header-icon {
        width: 44px;
        height: 44px;
      }

      .icon-emoji {
        font-size: 1.25rem;
      }

      .header-text h3 {
        font-size: 1.25rem;
      }

      .buttons-container {
        padding: 1.25rem;
      }

      .export-btn {
        padding: 1rem;
      }

      .btn-icon {
        width: 40px;
        height: 40px;
      }

      .btn-icon .icon-emoji {
        font-size: 1.25rem;
      }

      .btn-title {
        font-size: 0.875rem;
      }

      .btn-description {
        font-size: 0.7rem;
      }

      .year-row {
        padding: 1rem 1.25rem 0 1.25rem;
      }

      .year-selector {
        padding: 0.4rem 1rem;
      }

      .info-note {
        margin: 0 1rem 1rem 1rem;
      }

      .success-message {
        margin: 0 1rem 1rem 1rem;
      }
    }

    /* Large screens adjustment */
    @media (min-width: 1600px) {
      .export-card {
        max-width: 900px;
      }

      .export-buttons-grid {
        max-width: 600px;
      }
    }
  `]
})
export class ExportExcel {
  private exportAllService = inject(ExportAllDataService);
  private completePdfExport = inject(CompletePdfExportService);

  isExporting = false;
  exportingType: 'excel' | 'pdf' | null = null;
  selectedYear = new Date().getFullYear();
  showSuccess = false;
  successMessage = '';
  years: number[] = [];

  constructor() {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 5; i <= currentYear + 2; i++) {
      this.years.push(i);
    }
  }

  onYearChange() {
    console.log('Year changed to:', this.selectedYear);
  }

  async exportAllData() {
    this.isExporting = true;
    this.exportingType = 'excel';
    try {
      await this.exportAllService.exportAllData(this.selectedYear);
      this.showSuccessMessage('Excel file generated successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      this.showErrorMessage('Failed to export data. Please try again.');
    } finally {
      this.isExporting = false;
      this.exportingType = null;
    }
  }

  async exportToPDF() {
    this.isExporting = true;
    this.exportingType = 'pdf';
    try {
      await this.completePdfExport.exportCompleteReport(this.selectedYear);
      this.showSuccessMessage('PDF report generated successfully!');
    } catch (error) {
      console.error('PDF export failed:', error);
      this.showErrorMessage('Failed to generate PDF. Please try again.');
    } finally {
      this.isExporting = false;
      this.exportingType = null;
    }
  }

  private showSuccessMessage(message: string) {
    this.successMessage = message;
    this.showSuccess = true;
    setTimeout(() => {
      this.showSuccess = false;
    }, 5000);
  }

  private showErrorMessage(message: string) {
    alert(message);
  }
}
