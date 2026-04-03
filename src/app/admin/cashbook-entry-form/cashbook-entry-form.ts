import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CashbookService } from '../../core/services/cashbook.service';
import { CashbookEntry, TransactionType, ReceiptCategory, PaymentCategory } from '../../core/model/cashbook.model';

@Component({
  selector: 'app-cashbook-entry-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
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
                         [(ngModel)]="entry.date"
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

                <div class="form-field">
                  <label class="field-label">
                    <span class="label-text">Category</span>
                    <span class="required-star">*</span>
                  </label>
                  <select class="form-input"
                          [class.invalid]="categoryInvalid && categoryTouched"
                          [(ngModel)]="currentCategory"
                          name="category"
                          required
                          (blur)="categoryTouched = true">
                    <option value="" disabled>Select Category</option>
                    <optgroup label="Receipt Categories" *ngIf="entry.transactionType === 'receipt'">
                      <option *ngFor="let cat of receiptCategories" [value]="cat">{{cat}}</option>
                    </optgroup>
                    <optgroup label="Payment Categories" *ngIf="entry.transactionType === 'payment'">
                      <option *ngFor="let cat of paymentCategories" [value]="cat">{{cat}}</option>
                    </optgroup>
                  </select>
                  <div class="validation-message" *ngIf="categoryInvalid && categoryTouched">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                    </svg>
                    Please select a category
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

                <div class="form-field">
                  <label class="field-label">
                    <span class="label-text">Bank Account</span>
                    <span class="required-star">*</span>
                  </label>
                  <select class="form-input"
                          [class.invalid]="bankAccountInvalid && bankAccountTouched"
                          [(ngModel)]="entry.bankAccount"
                          name="bankAccount"
                          required
                          (blur)="bankAccountTouched = true">
                    <option value="" disabled>Select Bank</option>
                    <option *ngFor="let bank of banks" [value]="bank">{{bank}}</option>
                  </select>
                  <div class="validation-message" *ngIf="bankAccountInvalid && bankAccountTouched">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                    </svg>
                    Please select a bank account
                  </div>
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
              <li *ngIf="bankAccountInvalid">Bank account is required</li>
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
  `,
  styles: [`
    :host {
      display: block;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    .form-container {
      background: white;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      transition: all 0.3s ease;
    }

    /* Header Styles */
    .form-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 24px 32px;
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
      gap: 16px;
      position: relative;
      z-index: 1;
    }

    .header-icon {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      padding: 12px;
      backdrop-filter: blur(10px);
    }

    .header-icon svg {
      color: white;
    }

    .header-text h3 {
      color: white;
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      letter-spacing: -0.5px;
    }

    .header-text p {
      color: rgba(255, 255, 255, 0.9);
      margin: 4px 0 0 0;
      font-size: 14px;
    }

    /* Form Body */
    .form-body {
      padding: 32px;
    }

    /* Transaction Toggle */
    .transaction-toggle {
      display: flex;
      gap: 12px;
      margin-bottom: 32px;
      background: #f8f9fa;
      padding: 6px;
      border-radius: 60px;
      width: fit-content;
    }

    .toggle-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 24px;
      border: none;
      border-radius: 40px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      background: transparent;
      color: #6c757d;
    }

    .toggle-btn svg {
      transition: transform 0.2s ease;
    }

    .toggle-btn:hover svg {
      transform: scale(1.1);
    }

    .toggle-btn.active {
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .receipt-btn.active {
      color: #28a745;
    }

    .payment-btn.active {
      color: #dc3545;
    }

    /* Form Grid */
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    /* Form Sections */
    .form-section {
      background: #f8f9fa;
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .form-section:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      transform: translateY(-2px);
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px 20px;
      background: white;
      border-bottom: 2px solid #e9ecef;
      font-weight: 600;
      color: #495057;
    }

    .section-title svg {
      color: #667eea;
    }

    .section-content {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 20px;
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
      gap: 4px;
      font-size: 13px;
      font-weight: 500;
      color: #495057;
    }

    .label-text {
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 12px;
    }

    .required-star {
      color: #dc3545;
      font-size: 14px;
    }

    .form-input {
      padding: 10px 14px;
      border: 1.5px solid #e9ecef;
      border-radius: 10px;
      font-size: 14px;
      transition: all 0.3s ease;
      background: white;
      font-family: inherit;
    }

    .form-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-input.invalid {
      border-color: #dc3545;
    }

    .form-input.invalid:focus {
      border-color: #dc3545;
      box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
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
      color: #dc3545;
      margin-top: 4px;
    }

    .validation-message svg {
      flex-shrink: 0;
    }

    /* Error Summary */
    .error-summary {
      background: #fff3f3;
      border-left: 4px solid #dc3545;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }

    .error-summary-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #dc3545;
      margin-bottom: 12px;
    }

    .error-summary-list {
      margin: 0;
      padding-left: 24px;
      color: #721c24;
      font-size: 13px;
    }

    .error-summary-list li {
      margin: 4px 0;
    }

    /* Amount Input */
    .amount-input {
      position: relative;
      display: flex;
      align-items: center;
    }

    .currency-symbol {
      position: absolute;
      left: 12px;
      color: #6c757d;
      font-weight: 500;
      pointer-events: none;
    }

    .amount-field {
      padding-left: 28px;
    }

    /* Form Actions */
    .form-actions {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
      padding-top: 24px;
      border-top: 2px solid #e9ecef;
    }

    .btn-primary, .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 28px;
      border: none;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500;
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
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
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
      .form-body {
        padding: 20px;
      }

      .form-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .transaction-toggle {
        width: 100%;
      }

      .toggle-btn {
        flex: 1;
        justify-content: center;
      }

      .form-actions {
        flex-direction: column;
      }

      .btn-primary, .btn-secondary {
        justify-content: center;
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
      background-position: right 12px center;
      padding-right: 36px;
    }
  `]
})
export class CashbookEntryFormComponent {
  private cashbookService = inject(CashbookService);
  submitting = signal(false);
  entryAdded = output<void>();

  receiptCategories: ReceiptCategory[] = [
    'Tax Revenue', 'Fees & Charges', 'Licenses', 'Fines & Penalties', 'Grants & Aids', 'Other Receipts'
  ];

  paymentCategories: PaymentCategory[] = [
    'Personnel Services', 'Maintenance & Operating', 'Financial Expenses',
    'Capital Outlay', 'Debt Service', 'Other Payments'
  ];

  banks = ['Central Bank of Nigeria', 'First Bank', 'GTBank', 'UBA', 'Access Bank', 'Zenith Bank'];

  // Validation touch states
  dateTouched = false;
  voucherNumberTouched = false;
  categoryTouched = false;
  receivedFromTouched = false;
  paidToTouched = false;
  descriptionTouched = false;
  ncoaCodeTouched = false;
  bankAccountTouched = false;
  amountTouched = false;
  showErrorSummary = false;

  entry: Partial<CashbookEntry> = {
    transactionType: 'receipt',
    date: new Date(),
    voucherNumber: 0,
    description: '',
    ncoaCode: '',
    bankAccount: '',
    amount: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  };

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

  get bankAccountInvalid(): boolean {
    return !this.entry.bankAccount;
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

  setTransactionType(type: 'receipt' | 'payment') {
    this.entry.transactionType = type;
    // Reset category when transaction type changes
    if (type === 'receipt') {
      this.entry.receiptCategory = undefined;
      this.entry.paymentCategory = undefined;
    } else {
      this.entry.receiptCategory = undefined;
      this.entry.paymentCategory = undefined;
    }
    this.categoryTouched = false;
  }

  isFormValid(): boolean {
    const isValid = !this.dateInvalid &&
      !this.voucherNumberInvalid &&
      !this.categoryInvalid &&
      !this.descriptionInvalid &&
      !this.ncoaCodeInvalid &&
      !this.bankAccountInvalid &&
      !this.amountInvalid &&
      (this.entry.transactionType === 'receipt' ? !this.receivedFromInvalid : !this.paidToInvalid);

    return isValid;
  }

  onSubmit() {
    this.showErrorSummary = true;

    // Mark all fields as touched to show validation messages
    this.dateTouched = true;
    this.voucherNumberTouched = true;
    this.categoryTouched = true;
    this.descriptionTouched = true;
    this.ncoaCodeTouched = true;
    this.bankAccountTouched = true;
    this.amountTouched = true;

    if (this.entry.transactionType === 'receipt') {
      this.receivedFromTouched = true;
    } else {
      this.paidToTouched = true;
    }

    if (!this.isFormValid()) {
      // Scroll to error summary
      const errorSummary = document.querySelector('.error-summary');
      if (errorSummary) {
        errorSummary.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    this.submitting.set(true);

    const newEntry: Omit<CashbookEntry, 'id' | 'createdAt' | 'updatedAt'> = {
      date: this.entry.date!,
      voucherNumber: this.entry.voucherNumber!,
      transactionType: this.entry.transactionType as TransactionType,
      description: this.entry.description!,
      ncoaCode: this.entry.ncoaCode!,
      bankAccount: this.entry.bankAccount!,
      amount: this.entry.amount!,
      month: new Date(this.entry.date!).getMonth() + 1,
      year: new Date(this.entry.date!).getFullYear(),
      createdBy: 'current-user',
      ...(this.entry.transactionType === 'receipt' && {
        receiptNumber: this.entry.receiptNumber,
        receivedFrom: this.entry.receivedFrom,
        receiptCategory: this.entry.receiptCategory
      }),
      ...(this.entry.transactionType === 'payment' && {
        dvNumber: this.entry.dvNumber,
        paidTo: this.entry.paidTo,
        paymentCategory: this.entry.paymentCategory
      })
    };

    this.cashbookService.addEntry(newEntry).subscribe({
      next: () => {
        this.resetForm();
        this.submitting.set(false);
        this.entryAdded.emit();
        this.showErrorSummary = false;
      },
      error: (error) => {
        console.error('Error adding entry:', error);
        this.submitting.set(false);
        alert('Error adding entry. Please try again.');
      }
    });
  }

  resetForm() {
    this.entry = {
      transactionType: 'receipt',
      date: new Date(),
      voucherNumber: 0,
      description: '',
      ncoaCode: '',
      bankAccount: '',
      amount: 0,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    };

    // Reset touch states
    this.dateTouched = false;
    this.voucherNumberTouched = false;
    this.categoryTouched = false;
    this.receivedFromTouched = false;
    this.paidToTouched = false;
    this.descriptionTouched = false;
    this.ncoaCodeTouched = false;
    this.bankAccountTouched = false;
    this.amountTouched = false;
    this.showErrorSummary = false;
  }
  isNcoaCodeValid(code: string): boolean {
    if (!code) return false;
    return /^[A-Z0-9-]+$/.test(code);
  }
}
