import {Component, inject, OnInit, output, signal, Input} from '@angular/core';
import {CashbookService} from '../../../app/core/services/cashbook.service';
import { PaymentCategory, ReceiptCategory, TransactionType} from '../../../app/core/model/cashbook.model';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf, NgSwitch, NgSwitchCase} from '@angular/common';
import {addDoc, collection, Firestore} from '@angular/fire/firestore';
type PaymentMode = 'bank' | 'cash';
interface CashbookEntry {
  id?: string;
  date: Date;
  voucherNumber: number;
  transactionType: TransactionType;
  description: string;
  ncoaCode: string;
  paymentMode: PaymentMode;  // Added this field
  bankName?: string;         // Added this field
  accountName?: string;      // Added this field
  accountNumber?: string;    // Added this field
  amount: number;
  balance?: number;

  // Receipt specific fields
  receiptNumber?: string;
  receivedFrom?: string;
  receiptCategory?: ReceiptCategory;

  // Payment specific fields
  dvNumber?: string;
  paidTo?: string;
  paymentCategory?: PaymentCategory;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  month: number;
  year: number;
}
@Component({
  selector: 'app-eaddtransactions',
  imports: [
    FormsModule,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    NgForOf
  ],

  styles: [`
    :host {
      display: block;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    .form-container {
      background: white;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      transition: all 0.3s ease;
    }

    /* Header Styles */
    .form-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 32px 40px;
      position: relative;
      overflow: hidden;
    }

    .form-header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 1%, transparent 1%);
      background-size: 50px 50px;
      animation: shimmer 60s linear infinite;
    }

    @keyframes shimmer {
      0% { transform: translate(0, 0); }
      100% { transform: translate(50px, 50px); }
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 20px;
      position: relative;
      z-index: 1;
    }

    .header-icon {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      padding: 14px;
      backdrop-filter: blur(10px);
    }

    .header-icon svg {
      color: white;
      width: 28px;
      height: 28px;
    }

    .header-text h3 {
      color: white;
      margin: 0;
      font-size: 28px;
      font-weight: 600;
      letter-spacing: -0.5px;
    }

    .header-text p {
      color: rgba(255, 255, 255, 0.9);
      margin: 6px 0 0 0;
      font-size: 15px;
    }

    /* Form Body */
    .form-body {
      padding: 40px;
    }

    /* Transaction Toggle */
    .transaction-toggle {
      display: flex;
      gap: 16px;
      margin-bottom: 32px;
      background: #f8f9fa;
      padding: 8px;
      border-radius: 60px;
      width: fit-content;
    }

    .toggle-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 32px;
      border: none;
      border-radius: 40px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      background: transparent;
      color: #6c757d;
    }

    .toggle-btn svg {
      width: 20px;
      height: 20px;
      transition: transform 0.2s ease;
    }

    .toggle-btn:hover svg {
      transform: scale(1.1);
    }

    .toggle-btn.active {
      background: white;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    }

    .receipt-btn.active {
      color: #10b981;
    }

    .payment-btn.active {
      color: #ef4444;
    }

    /* Form Sections - No Cards, Just Sections */
    .form-section {
      margin-bottom: 32px;
      border-bottom: 1px solid #e9ecef;
      padding-bottom: 24px;
    }

    .form-section:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 24px;
      font-weight: 600;
      font-size: 18px;
      color: #1f2937;
    }

    .section-title svg {
      width: 22px;
      height: 22px;
      color: #667eea;
    }

    .section-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* Form Fields */
    .form-field {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .field-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 600;
      color: #495057;
    }

    .label-text {
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 12px;
    }

    .required-star {
      color: #ef4444;
      font-size: 14px;
    }

    .optional-badge {
      background: #e9ecef;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 500;
      color: #6c757d;
      margin-left: 8px;
    }

    .form-input {
      padding: 12px 16px;
      border: 1.5px solid #e9ecef;
      border-radius: 12px;
      font-size: 14px;
      transition: all 0.3s ease;
      background: white;
      font-family: inherit;
      width: 100%;
      box-sizing: border-box;
    }

    .form-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    }

    .form-input.invalid {
      border-color: #ef4444;
    }

    .form-input.invalid:focus {
      border-color: #ef4444;
      box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
    }

    .form-input:hover:not(:focus) {
      border-color: #ced4da;
    }

    /* Validation Message */
    .validation-message {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #ef4444;
      margin-top: 4px;
    }

    .validation-message svg {
      flex-shrink: 0;
      width: 14px;
      height: 14px;
    }

    /* Error Summary */
    .error-summary {
      background: #fef2f2;
      border-left: 4px solid #ef4444;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 32px;
    }

    .error-summary-header {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
      color: #dc2626;
      margin-bottom: 12px;
      font-size: 14px;
    }

    .error-summary-list {
      margin: 0;
      padding-left: 28px;
      color: #991b1b;
      font-size: 13px;
    }

    .error-summary-list li {
      margin: 6px 0;
    }

    /* Amount Input */
    .amount-input {
      position: relative;
      display: flex;
      align-items: center;
    }

    .currency-symbol {
      position: absolute;
      left: 14px;
      color: #6c757d;
      font-weight: 600;
      pointer-events: none;
      font-size: 16px;
    }

    .amount-field {
      padding-left: 34px;
    }

    /* Category Button Container */
    .category-button-container {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .category-input {
      flex: 1;
    }

    /* Form Actions */
    .form-actions {
      display: flex;
      gap: 20px;
      justify-content: flex-end;
      padding-top: 32px;
      margin-top: 16px;
      border-top: 2px solid #e9ecef;
    }

    .btn-primary, .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 14px 32px;
      border: none;
      border-radius: 14px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: inherit;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: white;
      color: #6c757d;
      border: 1.5px solid #e9ecef;
    }

    .btn-secondary:hover {
      background: #f8f9fa;
      border-color: #ced4da;
      transform: translateY(-1px);
    }

    /* Spinner */
    .spinner {
      display: inline-block;
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .form-header {
        padding: 24px;
      }

      .header-text h3 {
        font-size: 22px;
      }

      .form-body {
        padding: 24px;
      }

      .transaction-toggle {
        width: 100%;
      }

      .toggle-btn {
        flex: 1;
        justify-content: center;
        padding: 10px 20px;
      }

      .form-actions {
        flex-direction: column;
      }

      .btn-primary, .btn-secondary {
        justify-content: center;
      }

      .category-button-container {
        flex-direction: column;
      }

      .btn-select-category {
        width: 100%;
      }
    }

    /* Input number arrows styling */
    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
      opacity: 0.5;
    }

    /* Select dropdown styling */
    select.form-input {
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236c757d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 14px center;
      padding-right: 40px;
    }

    /* Button styles */
    .btn-select-category {
      padding: 12px 24px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.3s ease;
      white-space: nowrap;
    }

    .btn-select-category:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    /* Category Modal specific styles */
    .category-modal {
      max-width: 650px;
      width: 90%;
    }

    .category-search {
      margin-bottom: 24px;
    }

    .category-search-input {
      width: 100%;
      padding: 12px 16px;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      font-size: 14px;
      box-sizing: border-box;
      transition: all 0.3s ease;
    }

    .category-search-input:focus {
      outline: none;
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }

    .category-group-title {
      margin: 0 0 16px 0;
      font-size: 16px;
      color: #1f2937;
      font-weight: 600;
      padding-bottom: 10px;
      border-bottom: 2px solid #10b981;
    }

    .category-items {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 10px;
      margin-bottom: 24px;
    }

    .category-item {
      padding: 12px 16px;
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      cursor: pointer;
      text-align: left;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;
      color: #374151;
    }

    .category-item:hover {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-color: transparent;
      color: white;
      transform: translateX(6px);
    }

    /* Modal overlay and container */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      backdrop-filter: blur(4px);
    }

    .modal-container {
      background-color: white;
      border-radius: 20px;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: modalSlideIn 0.3s ease-out;
      z-index: 10000;
    }

    @keyframes modalSlideIn {
      from {
        transform: translateY(-50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #1f2937;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 28px;
      cursor: pointer;
      color: #9ca3af;
      transition: color 0.3s;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
    }

    .modal-close:hover {
      color: #374151;
      background: #f3f4f6;
    }

    .modal-body {
      padding: 24px;
      max-height: 60vh;
      overflow-y: auto;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px 24px;
      border-top: 1px solid #e5e7eb;
    }

    .btn-cancel {
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s;
      border: none;
      background-color: #f3f4f6;
      color: #6b7280;
    }

    .btn-cancel:hover {
      background-color: #e5e7eb;
    }

    /* Payment Mode Toggle Styles */
    .payment-mode-toggle {
      display: flex;
      gap: 16px;
      width: 100%;
      max-width: 100%;
    }

    .mode-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 14px 24px;
      background: #ffffff;
      border: 2px solid #e5e7eb;
      border-radius: 16px;
      font-size: 15px;
      font-weight: 600;
      color: #6b7280;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: inherit;
      position: relative;
      overflow: hidden;
    }

    .mode-btn::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(59, 130, 246, 0.1);
      transform: translate(-50%, -50%);
      transition: width 0.6s, height 0.6s;
    }

    .mode-btn:hover::before {
      width: 300px;
      height: 300px;
    }

    .mode-btn:hover {
      transform: translateY(-2px);
      border-color: #cbd5e1;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .mode-btn:active {
      transform: translateY(0);
    }

    .mode-btn svg {
      width: 20px;
      height: 20px;
      transition: all 0.3s ease;
    }

    /* Active state for Bank button */
    .mode-btn.bank-btn.active {
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      border-color: #3b82f6;
      color: #1e40af;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
    }

    .mode-btn.bank-btn.active svg {
      color: #3b82f6;
      transform: scale(1.1);
    }

    /* Active state for Cash button */
    .mode-btn.cash-btn.active {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border-color: #22c55e;
      color: #166534;
      box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
    }

    .mode-btn.cash-btn.active svg {
      color: #22c55e;
      transform: scale(1.1);
    }

    /* Hover states for active buttons */
    .mode-btn.bank-btn.active:hover {
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      border-color: #2563eb;
      transform: translateY(-2px);
    }

    .mode-btn.cash-btn.active:hover {
      background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
      border-color: #16a34a;
      transform: translateY(-2px);
    }

    /* Focus states for accessibility */
    .mode-btn:focus {
      outline: none;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
    }

    .mode-btn.bank-btn.active:focus {
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.4);
    }

    .mode-btn.cash-btn.active:focus {
      box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.4);
    }

    /* Info Message */
    .info-message {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 16px;
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border-left: 4px solid #22c55e;
      border-radius: 12px;
      margin: 16px 0;
      font-size: 13px;
      font-weight: 500;
      color: #166534;
    }

    .info-message svg {
      flex-shrink: 0;
      color: #22c55e;
      width: 18px;
      height: 18px;
    }

    /* Responsive styles for payment mode on smaller screens */
    @media (max-width: 768px) {
      .payment-mode-toggle {
        gap: 10px;
        flex-direction: column;
      }

      .mode-btn {
        padding: 12px 20px;
        font-size: 14px;
        gap: 10px;
      }

      .mode-btn svg {
        width: 18px;
        height: 18px;
      }
    }

    /* Large screen optimization */
    @media (min-width: 1400px) {
      .form-container {
        max-width: 1000px;
        margin: 0 auto;
      }

      .form-body {
        padding: 48px;
      }

      .mode-btn {
        padding: 16px 28px;
        font-size: 16px;
        gap: 14px;
      }

      .mode-btn svg {
        width: 22px;
        height: 22px;
      }
    }
  `],
  template: `



    <main id="content" role="main" class="main">
      <!-- Content -->
      <div class="bg-dark">
        <div class="content container-fluid" style="height: 25rem;">
          <!-- Page Header -->
          <div class="page-header page-header-light">
            <div class="row align-items-center">
              <div class="col">
                <h1 class="page-header-title">Dashboard</h1>
              </div>
              <!-- End Col -->

              <div class="col-auto">
                <!-- Daterangepicker -->
                <button id="js-daterangepicker-predefined" class="btn btn-ghost-light btn-sm dropdown-toggle">
                  <i class="bi-calendar-week"></i>
                  <span class="js-daterangepicker-predefined-preview ms-1">Apr 23 - Apr 23, 2026</span>
                </button>
                <!-- End Daterangepicker -->
              </div>
              <!-- End Col -->
            </div>
            <!-- End Row -->

            <!-- Nav Scroller -->
            <div class="js-nav-scroller hs-nav-scroller-horizontal">
            <span class="hs-nav-scroller-arrow-prev hs-nav-scroller-arrow-dark-prev" style="display: none;">
              <a class="hs-nav-scroller-arrow-link" href="javascript:;">
                <i class="bi-chevron-left"></i>
              </a>
            </span>

              <span class="hs-nav-scroller-arrow-next hs-nav-scroller-arrow-dark-next" style="display: none;">
              <a class="hs-nav-scroller-arrow-link" href="javascript:;">
                <i class="bi-chevron-right"></i>
              </a>
            </span>

              <!-- Nav -->
              <ul class="nav nav-tabs nav-tabs-light page-header-tabs" id="pageHeaderTab" role="tablist">
                <li class="nav-item">
                  <a class="nav-link active" href="javascript:;">Overview</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link disabled" href="javascript:;">Status</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link disabled" href="javascript:;">
                    Sessions
                    <span class="badge bg-warning text-dark rounded-pill ms-1">
                    <i class="bi-exclamation-triangle-fill me-1"></i> Verification required
                  </span>
                  </a>
                </li>
              </ul>
              <!-- End Nav -->
            </div>
            <!-- End Nav Scroller -->
          </div>
          <!-- End Page Header -->
        </div>
      </div>
      <!-- End Content -->

      <!-- Content -->
      <div class="content container-fluid" style="margin-top: -17rem;">
        <!-- Card -->
        <div class="card mb-3 mb-lg-5">
          <!-- Header -->
          <div class="card-header card-header-content-sm-between">
            <h4 class="card-header-title mb-2 mb-sm-0">Recent projects</h4>

            <!-- Nav -->
            <ul class="nav nav-segment nav-fill" id="projectsTab" role="tablist">
              <li class="nav-item" data-bs-toggle="chart" data-datasets="0" data-trigger="click" data-action="toggle"
                  role="presentation">
                <a class="nav-link active" href="javascript:;" data-bs-toggle="tab" aria-selected="true" role="tab">This
                  week</a>
              </li>
              <li class="nav-item" data-bs-toggle="chart" data-datasets="1" data-trigger="click" data-action="toggle"
                  role="presentation">
                <a class="nav-link" href="javascript:;" data-bs-toggle="tab" aria-selected="false" tabindex="-1"
                   role="tab">Last week</a>
              </li>
            </ul>
            <!-- End Nav -->
          </div>
          <!-- End Header -->

          <!-- Body -->
          <div class="card-body">
            <div class="row align-items-sm-center mb-4">
              <div class="col-sm mb-3 mb-sm-0">
                <div class="d-flex align-items-center">
                  <span class="h1 mb-0">$7,431.14 USD</span>

                  <span class="text-success ms-2">
                  <i class="bi-graph-up"></i> 25.3%
                </span>
                </div>
              </div>
              <!-- End Col -->

              <div class="col-sm-auto">
                <!-- Legend Indicators -->
                <div class="row fs-6">
                  <div class="col-auto">
                    <span class="legend-indicator bg-primary"></span> Income
                  </div>
                  <div class="col-auto">
                    <span class="legend-indicator bg-info"></span> Expenses
                  </div>
                </div>
                <!-- End Legend Indicators -->
              </div>
              <!-- End Col -->
            </div>
            <!-- End Row -->

            <!-- Bar Chart -->
            <div class="chartjs-custom" style="height: 18rem;">
              <canvas id="updatingLineChart" data-hs-chartjs-options="{
                      &quot;type&quot;: &quot;line&quot;,
                      &quot;data&quot;: {
                         &quot;labels&quot;: [&quot;Feb&quot;,&quot;Jan&quot;,&quot;Mar&quot;,&quot;Apr&quot;,&quot;May&quot;,&quot;Jun&quot;,&quot;Jul&quot;,&quot;Aug&quot;,&quot;Sep&quot;,&quot;Oct&quot;,&quot;Nov&quot;,&quot;Dec&quot;],
                         &quot;datasets&quot;: [{
                          &quot;backgroundColor&quot;: [&quot;rgba(55,125,255, .5)&quot;, &quot;rgba(255, 255, 255, .2)&quot;],
                          &quot;borderColor&quot;: &quot;#377dff&quot;,
                          &quot;borderWidth&quot;: 2,
                          &quot;pointRadius&quot;: 0,
                          &quot;hoverBorderColor&quot;: &quot;#377dff&quot;,
                          &quot;pointBackgroundColor&quot;: &quot;#377dff&quot;,
                          &quot;pointBorderColor&quot;: &quot;#fff&quot;,
                          &quot;pointHoverRadius&quot;: 0,
                          &quot;tension&quot;: 0.4
                        },
                        {
                          &quot;backgroundColor&quot;: [&quot;rgba(0, 201, 219, .5)&quot;, &quot;rgba(255, 255, 255, .2)&quot;],
                          &quot;borderColor&quot;: &quot;#00c9db&quot;,
                          &quot;borderWidth&quot;: 2,
                          &quot;pointRadius&quot;: 0,
                          &quot;hoverBorderColor&quot;: &quot;#00c9db&quot;,
                          &quot;pointBackgroundColor&quot;: &quot;#00c9db&quot;,
                          &quot;pointBorderColor&quot;: &quot;#fff&quot;,
                          &quot;pointHoverRadius&quot;: 0,
                          &quot;tension&quot;: 0.4
                        }]
                      },
                      &quot;options&quot;: {
                        &quot;gradientPosition&quot;: {&quot;y1&quot;: 200},
                         &quot;scales&quot;: {
                            &quot;y&quot;: {
                              &quot;grid&quot;: {
                                &quot;color&quot;: &quot;#e7eaf3&quot;,
                                &quot;drawBorder&quot;: false,
                                &quot;zeroLineColor&quot;: &quot;#e7eaf3&quot;
                              },
                              &quot;ticks&quot;: {
                                &quot;min&quot;: 0,
                                &quot;max&quot;: 100,
                                &quot;stepSize&quot;: 20,
                                &quot;fontColor&quot;: &quot;#97a4af&quot;,
                                &quot;fontFamily&quot;: &quot;Open Sans, sans-serif&quot;,
                                &quot;padding&quot;: 10,
                                &quot;postfix&quot;: &quot;k&quot;
                              }
                            },
                            &quot;x&quot;: {
                              &quot;grid&quot;: {
                                &quot;display&quot;: false,
                                &quot;drawBorder&quot;: false
                              },
                              &quot;ticks&quot;: {
                                &quot;fontSize&quot;: 12,
                                &quot;fontColor&quot;: &quot;#97a4af&quot;,
                                &quot;fontFamily&quot;: &quot;Open Sans, sans-serif&quot;,
                                &quot;padding&quot;: 5
                              }
                            }
                        },
                        &quot;plugins&quot;: {
                          &quot;tooltip&quot;: {
                            &quot;prefix&quot;: &quot;$&quot;,
                            &quot;postfix&quot;: &quot;k&quot;,
                            &quot;hasIndicator&quot;: true,
                            &quot;mode&quot;: &quot;index&quot;,
                            &quot;intersect&quot;: false,
                            &quot;lineMode&quot;: true,
                            &quot;lineWithLineColor&quot;: &quot;rgba(19, 33, 68, 0.075)&quot;
                          }
                        },
                        &quot;hover&quot;: {
                          &quot;mode&quot;: &quot;nearest&quot;,
                          &quot;intersect&quot;: true
                        }
                      }
                    }" width="852" height="288"
                      style="display: block; box-sizing: border-box; height: 288px; width: 852px;">
              </canvas>
            </div>
            <!-- End Bar Chart -->
          </div>
          <!-- End Body -->

          <!-- Card Footer -->
          <a class="card-footer text-center" href="./projects.html">
            View all projects <i class="bi-chevron-right"></i>
          </a>
          <!-- End Card Footer -->
        </div>



      </div>

    </main>



    <div class="form-container">
      <div class="form-header">
        <div class="header-content">
          <div class="header-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
            </svg>
          </div>
          <div class="header-text">
            <h3>New Transaction Entry</h3>
            <p>Record your financial transactions with ease</p>
          </div>
        </div>
      </div>

      <div class="form-body">
        <form #entryForm="ngForm" (ngSubmit)="onSubmit()">
          <!-- Transaction Type Toggle -->
          <div class="transaction-toggle">
            <button type="button"
                    [class.active]="entry.transactionType === 'receipt'"
                    (click)="setTransactionType('receipt')"
                    class="toggle-btn receipt-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
              </svg>
              Receipt
            </button>
            <button type="button"
                    [class.active]="entry.transactionType === 'payment'"
                    (click)="setTransactionType('payment')"
                    class="toggle-btn payment-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
              </svg>
              Payment
            </button>
          </div>

          <div class="form-grid">
            <!-- Basic Information Section -->
            <div class="form-section">
              <div class="section-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor"/>
                </svg>
                <span>Basic Information</span>
              </div>
              <div class="section-content">
                <div class="form-field">
                  <label class="field-label">
                    <span class="label-text">Date</span>
                    <span class="required-star">*</span>
                  </label>
                  <input type="date"
                         class="form-input"
                         [class.invalid]="dateInvalid && dateTouched"
                         [(ngModel)]="dateString"
                         (ngModelChange)="onDateChange($event)"
                         name="date"
                         required
                         (blur)="dateTouched = true">
                  <div class="validation-message" *ngIf="dateInvalid && dateTouched">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                    </svg>
                    Date is required
                  </div>
                </div>

                <div class="form-field">
                  <label class="field-label">
                    <span class="label-text">Voucher Number</span>
                    <span class="required-star">*</span>
                  </label>
                  <input type="number"
                         class="form-input"
                         [class.invalid]="voucherNumberInvalid && voucherNumberTouched"
                         [(ngModel)]="entry.voucherNumber"
                         name="voucherNumber"
                         required
                         min="1"
                         (blur)="voucherNumberTouched = true"
                         placeholder="Enter voucher number">
                  <div class="validation-message" *ngIf="voucherNumberInvalid && voucherNumberTouched">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                    </svg>
                    <span *ngIf="!entry.voucherNumber">Voucher number is required</span>
                    <span *ngIf="entry.voucherNumber && entry.voucherNumber < 1">Voucher number must be greater than 0</span>
                  </div>
                </div>

                <!-- Updated Category Field - Textbox with Select Category Button -->
                <div class="form-field">
                  <label class="field-label">
                    <span class="label-text">Category</span>
                    <span class="required-star">*</span>
                  </label>
                  <div style="display: flex; gap: 8px; align-items: center;">
                    <input type="text"
                           class="form-input"
                           [class.invalid]="categoryInvalid && categoryTouched"
                           [(ngModel)]="currentCategory"
                           name="category"
                           required
                           (blur)="categoryTouched = true"
                           placeholder="Enter category or click 'Select Category'"
                           style="flex: 1;">
                    <button type="button"
                            class="btn-select-category"
                            (click)="openCategoryModal()">
                      Select Category
                    </button>
                  </div>
                  <div class="validation-message" *ngIf="categoryInvalid && categoryTouched">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                    </svg>
                    Please select or enter a category
                  </div>
                </div>
              </div>
            </div>

            <!-- Party Information Section -->
            <div class="form-section">
              <div class="section-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
                </svg>
                <span>Party Information</span>
              </div>
              <div class="section-content">
                <div class="form-field" *ngIf="entry.transactionType === 'receipt'">
                  <label class="field-label">
                    <span class="label-text">Received From</span>
                    <span class="required-star">*</span>
                  </label>
                  <input type="text"
                         class="form-input"
                         [class.invalid]="receivedFromInvalid && receivedFromTouched"
                         [(ngModel)]="entry.receivedFrom"
                         name="receivedFrom"
                         required
                         (blur)="receivedFromTouched = true"
                         placeholder="Enter sender name">
                  <div class="validation-message" *ngIf="receivedFromInvalid && receivedFromTouched">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                    </svg>
                    Please enter the sender's name
                  </div>
                </div>

                <div class="form-field" *ngIf="entry.transactionType === 'payment'">
                  <label class="field-label">
                    <span class="label-text">Paid To</span>
                    <span class="required-star">*</span>
                  </label>
                  <input type="text"
                         class="form-input"
                         [class.invalid]="paidToInvalid && paidToTouched"
                         [(ngModel)]="entry.paidTo"
                         name="paidTo"
                         required
                         (blur)="paidToTouched = true"
                         placeholder="Enter payee name">
                  <div class="validation-message" *ngIf="paidToInvalid && paidToTouched">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                    </svg>
                    Please enter the payee's name
                  </div>
                </div>

                <div class="form-field">
                  <label class="field-label">
                    <span class="label-text">Description</span>
                    <span class="required-star">*</span>
                  </label>
                  <input type="text"
                         class="form-input"
                         [class.invalid]="descriptionInvalid && descriptionTouched"
                         [(ngModel)]="entry.description"
                         name="description"
                         required
                         minlength="3"
                         maxlength="200"
                         (blur)="descriptionTouched = true"
                         placeholder="Enter transaction description">
                  <div class="validation-message" *ngIf="descriptionInvalid && descriptionTouched">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                    </svg>
                    <span *ngIf="!entry.description">Description is required</span>
                    <span *ngIf="entry.description && entry.description.length < 3">Description must be at least 3 characters</span>
                    <span *ngIf="entry.description && entry.description.length > 200">Description cannot exceed 200 characters</span>
                  </div>
                </div>

                <div class="form-field" *ngIf="entry.transactionType === 'receipt'">
                  <label class="field-label">Receipt Number</label>
                  <input type="text"
                         class="form-input"
                         [class.invalid]="receiptNumberInvalid"
                         [(ngModel)]="entry.receiptNumber"
                         name="receiptNumber"
                         maxlength="50"
                         placeholder="Optional">
                  <div class="validation-message" *ngIf="receiptNumberInvalid">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                    </svg>
                    Receipt number cannot exceed 50 characters
                  </div>
                </div>

                <div class="form-field" *ngIf="entry.transactionType === 'payment'">
                  <label class="field-label">DV Number</label>
                  <input type="text"
                         class="form-input"
                         [class.invalid]="dvNumberInvalid"
                         [(ngModel)]="entry.dvNumber"
                         name="dvNumber"
                         maxlength="50"
                         placeholder="Optional">
                  <div class="validation-message" *ngIf="dvNumberInvalid">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                    </svg>
                    DV number cannot exceed 50 characters
                  </div>
                </div>
              </div>
            </div>

            <!-- Financial Information Section -->
            <!-- Financial Information Section -->
            <div class="form-section">
              <div class="section-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" fill="currentColor"/>
                </svg>
                <span>Financial Information</span>
              </div>
              <div class="section-content">
                <div class="form-field">
                  <label class="field-label">
                    <span class="label-text">NCOA Code</span>
                    <span class="required-star">*</span>
                  </label>
                  <input type="text"
                         class="form-input"
                         [class.invalid]="ncoaCodeInvalid && ncoaCodeTouched"
                         [(ngModel)]="entry.ncoaCode"
                         name="ncoaCode"
                         required
                         pattern="[A-Z0-9-]+"
                         (blur)="ncoaCodeTouched = true"
                         placeholder="Enter NCOA code">
                  <div class="validation-message" *ngIf="ncoaCodeInvalid && ncoaCodeTouched">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                    </svg>
                    <span *ngIf="!entry.ncoaCode">NCOA code is required</span>
                    <span *ngIf="entry.ncoaCode && !isNcoaCodeValid(entry.ncoaCode)">
          NCOA code can only contain uppercase letters, numbers, and hyphens
        </span>
                  </div>
                </div>

                <!-- Bank/Cash Selection -->
                <div class="form-field">
                  <label class="field-label">
                    <span class="label-text">Payment Mode</span>
                    <span class="required-star">*</span>
                  </label>
                  <div class="payment-mode-toggle">
                    <button type="button"
                            [class.active]="selectedPaymentMode === 'bank'"
                            (click)="setPaymentMode('bank')"
                            class="mode-btn bank-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M4 10h16v2H4zM6 6h12v2H6z" fill="currentColor"/>
                        <rect x="4" y="12" width="16" height="2" fill="currentColor"/>
                        <path d="M12 2L2 7v2h20V7l-10-5z" fill="currentColor"/>
                      </svg>
                      Bank
                    </button>
                    <button type="button"
                            [class.active]="selectedPaymentMode === 'cash'"
                            (click)="setPaymentMode('cash')"
                            class="mode-btn cash-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                      </svg>
                      Cash
                    </button>
                  </div>
                </div>

                <!-- Bank Fields - Only show when Bank is selected -->
                <ng-container *ngIf="selectedPaymentMode === 'bank'">
                  <div class="form-field">
                    <label class="field-label">
                      <span class="label-text">Bank Name</span>
                      <span class="required-star">*</span>
                    </label>
                    <select class="form-input"
                            [class.invalid]="bankNameInvalid && bankNameTouched"
                            [(ngModel)]="entry.bankName"
                            name="bankName"
                            required
                            (blur)="bankNameTouched = true">
                      <option value="" disabled selected>Select Bank</option>
                      <option *ngFor="let bank of banks" [value]="bank">
                        {{bank}}
                      </option>
                    </select>
                    <div class="validation-message" *ngIf="bankNameInvalid && bankNameTouched">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                      </svg>
                      Please select a bank
                    </div>
                  </div>

                  <div class="form-field">
                    <label class="field-label">
                      <span class="label-text">Account Name</span>
                      <span class="required-star">*</span>
                    </label>
                    <input type="text"
                           class="form-input"
                           [class.invalid]="accountNameInvalid && accountNameTouched"
                           [(ngModel)]="entry.accountName"
                           name="accountName"
                           required
                           (blur)="accountNameTouched = true"
                           placeholder="Enter account name">
                    <div class="validation-message" *ngIf="accountNameInvalid && accountNameTouched">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                      </svg>
                      Account name is required
                    </div>
                  </div>

                  <div class="form-field">
                    <label class="field-label">
                      <span class="label-text">Account Number</span>
                      <span class="required-star">*</span>
                    </label>
                    <input type="text"
                           class="form-input"
                           [class.invalid]="accountNumberInvalid && accountNumberTouched"
                           [(ngModel)]="entry.accountNumber"
                           name="accountNumber"
                           required
                           pattern="[0-9]{10}"
                           (blur)="accountNumberTouched = true"
                           placeholder="Enter 10-digit account number">
                    <div class="validation-message" *ngIf="accountNumberInvalid && accountNumberTouched">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                      </svg>
                      <span *ngIf="!entry.accountNumber">Account number is required</span>
                      <span *ngIf="entry.accountNumber && !isAccountNumberValid(entry.accountNumber)">Account number must be exactly 10 digits</span>
                    </div>
                  </div>
                </ng-container>

                <!-- Note for Cash transactions -->
                <div class="info-message" *ngIf="selectedPaymentMode === 'cash'">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                  </svg>
                  <span>Cash transaction - no bank details required</span>
                </div>

                <div class="form-field">
                  <label class="field-label">
                    <span class="label-text">Amount</span>
                    <span class="required-star">*</span>
                  </label>
                  <div class="amount-input">
                    <span class="currency-symbol">₦</span>
                    <input type="number"
                           class="form-input amount-field"
                           [class.invalid]="amountInvalid && amountTouched"
                           [(ngModel)]="entry.amount"
                           name="amount"
                           required
                           min="0.01"
                           step="0.01"
                           (blur)="amountTouched = true"
                           placeholder="0.00">
                  </div>
                  <div class="validation-message" *ngIf="amountInvalid && amountTouched">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                    </svg>
                    <span *ngIf="!entry.amount || entry.amount === 0">Amount is required</span>
                    <span *ngIf="entry.amount && entry.amount < 0.01">Amount must be greater than 0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Error Summary -->
          <div class="error-summary" *ngIf="showErrorSummary && !isFormValid()">
            <div class="error-summary-header">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
              </svg>
              <span>Please fix the following errors:</span>
            </div>
            <ul class="error-summary-list">
              <li *ngIf="dateInvalid">Date is required</li>
              <li *ngIf="voucherNumberInvalid">Valid voucher number is required (must be greater than 0)</li>
              <li *ngIf="categoryInvalid">Category is required</li>
              <li *ngIf="entry.transactionType === 'receipt' && receivedFromInvalid">Received From is required</li>
              <li *ngIf="entry.transactionType === 'payment' && paidToInvalid">Paid To is required</li>
              <li *ngIf="descriptionInvalid">
                <span *ngIf="!entry.description">Description is required</span>
                <span *ngIf="entry.description && entry.description.length < 3">Description must be at least 3 characters</span>
              </li>
              <li *ngIf="ncoaCodeInvalid">Valid NCOA code is required</li>
              <li *ngIf="!selectedPaymentMode">Payment mode is required</li>
              <li *ngIf="selectedPaymentMode === 'bank' && bankNameInvalid">Bank name is required</li>
              <li *ngIf="selectedPaymentMode === 'bank' && accountNameInvalid">Account name is required</li>
              <li *ngIf="selectedPaymentMode === 'bank' && accountNumberInvalid">
                <span *ngIf="!entry.accountNumber">Account number is required</span>
                <span *ngIf="entry.accountNumber && !isAccountNumberValid(entry.accountNumber)">Account number must be exactly 10 digits</span>
              </li>
              <li *ngIf="amountInvalid">Valid amount is required (must be greater than 0)</li>
            </ul>
          </div>

          <!-- Submit Button -->
          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="resetForm()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/>
              </svg>
              Reset
            </button>
            <button type="submit" class="btn-primary" [disabled]="submitting() || !isFormValid()">
              <span *ngIf="submitting()" class="spinner"></span>
              <span *ngIf="!submitting()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
            </svg>
            Add Transaction
          </span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Category Selection Modal -->
    <div class="modal-overlay" *ngIf="showCategoryModal" (click)="closeCategoryModal()">
      <div class="modal-container category-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Select Category</h3>
          <button type="button" class="modal-close" (click)="closeCategoryModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="category-search">
            <input type="text"
                   class="category-search-input"
                   [(ngModel)]="categorySearchTerm"
                   placeholder="Search categories..."
                   (input)="filterCategories()">
          </div>

          <div class="categories-list" *ngIf="entry.transactionType === 'receipt'">
            <h4 class="category-group-title">Receipt Categories</h4>
            <div class="category-items">
              <button *ngFor="let cat of filteredReceiptCategories"
                      type="button"
                      class="category-item"
                      (click)="selectCategory(cat)">
                {{cat}}
              </button>
            </div>
          </div>

          <div class="categories-list" *ngIf="entry.transactionType === 'payment'">
            <h4 class="category-group-title">Payment Categories</h4>
            <div class="category-items">
              <button *ngFor="let cat of filteredPaymentCategories"
                      type="button"
                      class="category-item"
                      (click)="selectCategory(cat)">
                {{cat}}
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-cancel" (click)="closeCategoryModal()">Close</button>
        </div>
      </div>
    </div>
  `,
})
export class Eaddtransactions implements OnInit {
  private firestore = inject(Firestore);
  @Input() collectionData: string = 'expense';
  submitting = signal(false);
  entryAdded = output<void>();

  receiptCategories: ReceiptCategory[] = [
    'Tax Revenue', 'Fees & Charges', 'Licenses', 'Fines & Penalties', 'Grants & Aids', 'Other Receipts'
  ];

  paymentCategories: PaymentCategory[] = [
    'Personnel Services', 'Maintenance & Operating', 'Financial Expenses',
    'Capital Outlay', 'Debt Service', 'Other Payments'
  ];

  banks: string[] = [
    'Central Bank of Nigeria',
    'First Bank of Nigeria',
    'GTBank (Guaranty Trust Bank)',
    'United Bank for Africa (UBA)',
    'Access Bank',
    'Zenith Bank',
    'Ecobank Nigeria',
    'Fidelity Bank',
    'Union Bank of Nigeria',
    'Stanbic IBTC Bank',
    'Sterling Bank',
    'Polaris Bank',
    'Providus Bank',
    'Wema Bank'
  ];

  // Payment mode selection
  selectedPaymentMode: PaymentMode = 'bank';

  // Validation touch states
  dateTouched = false;
  voucherNumberTouched = false;
  categoryTouched = false;
  receivedFromTouched = false;
  paidToTouched = false;
  descriptionTouched = false;
  ncoaCodeTouched = false;
  bankNameTouched = false;
  accountNameTouched = false;
  accountNumberTouched = false;
  amountTouched = false;
  showErrorSummary = false;

  // Date string for the input field
  dateString: string = '';

  getTodayDate(): Date {
    return new Date();
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  updateDateString() {
    if (this.entry.date) {
      this.dateString = this.formatDateForInput(this.entry.date);
    }
  }

  onDateChange(dateValue: string) {
    if (dateValue) {
      this.entry.date = new Date(dateValue);
      this.updateDateString();
      this.entry.month = this.entry.date.getMonth() + 1;
      this.entry.year = this.entry.date.getFullYear();
    }
  }

  entry: Partial<CashbookEntry> = {
    transactionType: 'receipt',
    date: this.getTodayDate(),
    voucherNumber: 0,
    description: '',
    ncoaCode: '',
    paymentMode: 'bank',
    amount: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  };

  // Category Modal properties
  showCategoryModal = false;
  categorySearchTerm = '';
  filteredReceiptCategories: ReceiptCategory[] = [];
  filteredPaymentCategories: PaymentCategory[] = [];

  get currentCategory(): string {
    if (this.entry.transactionType === 'receipt') {
      return this.entry.receiptCategory || '';
    } else {
      return this.entry.paymentCategory || '';
    }
  }

  set currentCategory(value: string) {
    if (this.entry.transactionType === 'receipt') {
      this.entry.receiptCategory = value as ReceiptCategory;
    } else {
      this.entry.paymentCategory = value as PaymentCategory;
    }
  }

  // Validation getters
  get dateInvalid(): boolean {
    return !this.entry.date;
  }

  get voucherNumberInvalid(): boolean {
    return !this.entry.voucherNumber || this.entry.voucherNumber < 1;
  }

  get categoryInvalid(): boolean {
    if (this.entry.transactionType === 'receipt') {
      return !this.entry.receiptCategory;
    } else {
      return !this.entry.paymentCategory;
    }
  }

  get receivedFromInvalid(): boolean {
    return this.entry.transactionType === 'receipt' && !this.entry.receivedFrom;
  }

  get paidToInvalid(): boolean {
    return this.entry.transactionType === 'payment' && !this.entry.paidTo;
  }

  get descriptionInvalid(): boolean {
    return !this.entry.description || this.entry.description.length < 3 || this.entry.description.length > 200;
  }

  get ncoaCodeInvalid(): boolean {
    if (!this.entry.ncoaCode) return true;
    const ncoaCodePattern = /^[A-Z0-9-]+$/;
    return !ncoaCodePattern.test(this.entry.ncoaCode);
  }

  get bankNameInvalid(): boolean {
    return this.selectedPaymentMode === 'bank' && (!this.entry.bankName || this.entry.bankName.trim() === '');
  }

  get accountNameInvalid(): boolean {
    return this.selectedPaymentMode === 'bank' && (!this.entry.accountName || this.entry.accountName.trim() === '');
  }

  get accountNumberInvalid(): boolean {
    if (this.selectedPaymentMode !== 'bank') return false;
    if (!this.entry.accountNumber) return true;
    const accountNumberPattern = /^[0-9]{10}$/;
    return !accountNumberPattern.test(this.entry.accountNumber);
  }

  get amountInvalid(): boolean {
    return !this.entry.amount || this.entry.amount < 0.01;
  }

  get receiptNumberInvalid(): boolean {
    return this.entry.receiptNumber ? this.entry.receiptNumber.length > 50 : false;
  }

  get dvNumberInvalid(): boolean {
    return this.entry.dvNumber ? this.entry.dvNumber.length > 50 : false;
  }

  ngOnInit() {
    console.log('Component initialized');
    console.log('Banks array:', this.banks);

    this.filteredReceiptCategories = [...this.receiptCategories];
    this.filteredPaymentCategories = [...this.paymentCategories];
    this.updateDateString();
  }

  setTransactionType(type: 'receipt' | 'payment') {
    this.entry.transactionType = type;
    if (type === 'receipt') {
      this.entry.receiptCategory = undefined;
      this.entry.paymentCategory = undefined;
    } else {
      this.entry.receiptCategory = undefined;
      this.entry.paymentCategory = undefined;
    }
    this.categoryTouched = false;
    this.filterCategories();
  }

  setPaymentMode(mode: PaymentMode) {
    this.selectedPaymentMode = mode;
    this.entry.paymentMode = mode;

    // Clear bank-related fields when switching to cash
    if (mode === 'cash') {
      this.entry.bankName = undefined;
      this.entry.accountName = undefined;
      this.entry.accountNumber = undefined;
      this.bankNameTouched = false;
      this.accountNameTouched = false;
      this.accountNumberTouched = false;
    }
  }

  isFormValid(): boolean {
    let isValid = !this.dateInvalid &&
      !this.voucherNumberInvalid &&
      !this.categoryInvalid &&
      !this.descriptionInvalid &&
      !this.ncoaCodeInvalid &&
      !this.amountInvalid &&
      !!this.selectedPaymentMode &&
      (this.entry.transactionType === 'receipt' ? !this.receivedFromInvalid : !this.paidToInvalid);

    // Add bank-specific validations
    if (this.selectedPaymentMode === 'bank') {
      isValid = isValid && !this.bankNameInvalid && !this.accountNameInvalid && !this.accountNumberInvalid;
    }

    return isValid;
  }

  isAccountNumberValid(accountNumber: string): boolean {
    if (!accountNumber) return false;
    return /^[0-9]{10}$/.test(accountNumber);
  }

  // Category Modal methods
  openCategoryModal() {
    this.categorySearchTerm = '';
    this.filterCategories();
    this.showCategoryModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeCategoryModal() {
    this.showCategoryModal = false;
    this.categorySearchTerm = '';
    document.body.style.overflow = '';
  }

  filterCategories() {
    const searchTerm = this.categorySearchTerm.toLowerCase().trim();

    if (this.entry.transactionType === 'receipt') {
      if (searchTerm === '') {
        this.filteredReceiptCategories = [...this.receiptCategories];
      } else {
        this.filteredReceiptCategories = this.receiptCategories.filter(cat =>
          cat.toLowerCase().includes(searchTerm)
        );
      }
    } else {
      if (searchTerm === '') {
        this.filteredPaymentCategories = [...this.paymentCategories];
      } else {
        this.filteredPaymentCategories = this.paymentCategories.filter(cat =>
          cat.toLowerCase().includes(searchTerm)
        );
      }
    }
  }

  selectCategory(category: string) {
    this.currentCategory = category;
    this.categoryTouched = true;
    this.closeCategoryModal();
  }

  async onSubmit() {
    this.showErrorSummary = true;

    this.dateTouched = true;
    this.voucherNumberTouched = true;
    this.categoryTouched = true;
    this.descriptionTouched = true;
    this.ncoaCodeTouched = true;
    this.amountTouched = true;

    if (this.selectedPaymentMode === 'bank') {
      this.bankNameTouched = true;
      this.accountNameTouched = true;
      this.accountNumberTouched = true;
    }

    if (this.entry.transactionType === 'receipt') {
      this.receivedFromTouched = true;
    } else {
      this.paidToTouched = true;
    }

    if (!this.isFormValid()) {
      const errorSummary = document.querySelector('.error-summary');
      if (errorSummary) {
        errorSummary.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    this.submitting.set(true);

    const now = new Date();

    // Build the base entry without undefined values
    const baseEntry: any = {
      date: this.entry.date!,
      voucherNumber: this.entry.voucherNumber!,
      transactionType: this.entry.transactionType as TransactionType,
      description: this.entry.description!,
      ncoaCode: this.entry.ncoaCode!,
      paymentMode: this.selectedPaymentMode,
      amount: this.entry.amount!,
      month: new Date(this.entry.date!).getMonth() + 1,
      year: new Date(this.entry.date!).getFullYear(),
      createdBy: 'current-user'
    };

    // Add bank-specific fields if payment mode is bank
    if (this.selectedPaymentMode === 'bank') {
      baseEntry.bankName = this.entry.bankName;
      baseEntry.accountName = this.entry.accountName;
      baseEntry.accountNumber = this.entry.accountNumber;
    }

    // Add receipt-specific fields only if they have values
    if (this.entry.transactionType === 'receipt') {
      if (this.entry.receiptNumber) {
        baseEntry.receiptNumber = this.entry.receiptNumber;
      }
      if (this.entry.receivedFrom) {
        baseEntry.receivedFrom = this.entry.receivedFrom;
      }
      if (this.entry.receiptCategory) {
        baseEntry.receiptCategory = this.entry.receiptCategory;
      }
    }
    // Add payment-specific fields only if they have values
    else if (this.entry.transactionType === 'payment') {
      if (this.entry.dvNumber) {
        baseEntry.dvNumber = this.entry.dvNumber;
      }
      if (this.entry.paidTo) {
        baseEntry.paidTo = this.entry.paidTo;
      }
      if (this.entry.paymentCategory) {
        baseEntry.paymentCategory = this.entry.paymentCategory;
      }
    }

    // Add timestamps
    const entryWithTimestamps = {
      ...baseEntry,
      createdAt: now,
      updatedAt: now
    };

    try {
      const cashbookCollection = collection(this.firestore, this.collectionData);
      await addDoc(cashbookCollection, entryWithTimestamps);

      console.log('Transaction saved successfully:', entryWithTimestamps);

      this.resetForm();
      this.submitting.set(false);
      this.entryAdded.emit();
      this.showErrorSummary = false;
    } catch (error) {
      console.error('Error adding entry:', error);
      this.submitting.set(false);
      alert('Error adding entry. Please try again.');
    }
  }

  resetForm() {
    this.entry = {
      transactionType: 'receipt',
      date: this.getTodayDate(),
      voucherNumber: 0,
      description: '',
      ncoaCode: '',
      paymentMode: 'bank',
      amount: 0,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    };

    this.selectedPaymentMode = 'bank';

    this.dateTouched = false;
    this.voucherNumberTouched = false;
    this.categoryTouched = false;
    this.receivedFromTouched = false;
    this.paidToTouched = false;
    this.descriptionTouched = false;
    this.ncoaCodeTouched = false;
    this.bankNameTouched = false;
    this.accountNameTouched = false;
    this.accountNumberTouched = false;
    this.amountTouched = false;
    this.showErrorSummary = false;

    this.categorySearchTerm = '';
    this.filterCategories();

    this.updateDateString();
  }

  isNcoaCodeValid(code: string): boolean {
    if (!code) return false;
    return /^[A-Z0-9-]+$/.test(code);
  }
}
