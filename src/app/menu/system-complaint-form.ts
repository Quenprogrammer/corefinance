import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, addDoc, Timestamp } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

export interface SystemComplaint {
  id?: string;
  title: string;
  category: ComplaintCategory;
  description: string;
  severity: SeverityLevel;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  attachments?: string[];
  browserInfo: string;
  userId?: string;
  userEmail?: string;
  status: ComplaintStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ComplaintCategory =
  | 'UI/UX Issue'
  | 'Data Error'
  | 'Performance Issue'
  | 'Export/Print Error'
  | 'Chart/Graph Issue'
  | 'Login/Auth Issue'
  | 'Data Sync Issue'
  | 'Feature Request'
  | 'Other';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export type ComplaintStatus = 'pending' | 'in-review' | 'in-progress' | 'resolved' | 'closed';

@Component({
  selector: 'app-system-complaint-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="complaint-form-container">
      <div class="form-card">
        <!-- Header -->
        <div class="form-header">
          <div class="header-icon">
            <i class="bi bi-exclamation-triangle-fill"></i>
          </div>
          <div class="header-text">
            <h2>Report System Issue</h2>
            <p>Help us improve by reporting any problems you encounter</p>
          </div>
        </div>

        <!-- Form Body -->
        <div class="form-body">
          <form #complaintForm="ngForm" (ngSubmit)="submitComplaint()">
            <!-- Issue Title -->
            <div class="form-group">
              <label class="form-label required">
                <i class="bi bi-tag"></i>
                Issue Title
              </label>
              <input type="text"
                     class="form-control"
                     [(ngModel)]="complaint.title"
                     name="title"
                     required
                     placeholder="Brief summary of the issue"
                     #title="ngModel">
              <div class="error-message" *ngIf="title.invalid && title.touched">
                Please enter an issue title
              </div>
            </div>

            <!-- Category & Severity Row -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label required">
                  <i class="bi bi-folder"></i>
                  Category
                </label>
                <select class="form-control"
                        [(ngModel)]="complaint.category"
                        name="category"
                        required
                        #category="ngModel">
                  <option value="" disabled>Select category</option>
                  <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
                </select>
                <div class="error-message" *ngIf="category.invalid && category.touched">
                  Please select a category
                </div>
              </div>

              <div class="form-group">
                <label class="form-label required">
                  <i class="bi bi-flag"></i>
                  Severity
                </label>
                <div class="severity-buttons">
                  <button type="button"
                          *ngFor="let severity of severities"
                          class="severity-btn"
                          [class.active]="complaint.severity === severity.value"
                          [class.low]="severity.value === 'low'"
                          [class.medium]="severity.value === 'medium'"
                          [class.high]="severity.value === 'high'"
                          [class.critical]="severity.value === 'critical'"
                          (click)="complaint.severity = severity.value">
                    <i [class]="severity.icon"></i>
                    {{ severity.label }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="form-group">
              <label class="form-label required">
                <i class="bi bi-chat-text"></i>
                Description
              </label>
              <textarea class="form-control"
                        rows="4"
                        [(ngModel)]="complaint.description"
                        name="description"
                        required
                        placeholder="Please provide a detailed description of the issue..."
                        #description="ngModel"></textarea>
              <div class="error-message" *ngIf="description.invalid && description.touched">
                Please provide a description
              </div>
            </div>

            <!-- Steps to Reproduce -->
            <div class="form-group">
              <label class="form-label">
                <i class="bi bi-list-ol"></i>
                Steps to Reproduce
              </label>
              <textarea class="form-control"
                        rows="3"
                        [(ngModel)]="complaint.stepsToReproduce"
                        name="stepsToReproduce"
                        placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."></textarea>
              <small class="field-hint">Provide step-by-step instructions to help us reproduce the issue</small>
            </div>

            <!-- Expected vs Actual Behavior -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <i class="bi bi-check-circle"></i>
                  Expected Behavior
                </label>
                <textarea class="form-control"
                          rows="2"
                          [(ngModel)]="complaint.expectedBehavior"
                          name="expectedBehavior"
                          placeholder="What should have happened?"></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <i class="bi bi-x-circle"></i>
                  Actual Behavior
                </label>
                <textarea class="form-control"
                          rows="2"
                          [(ngModel)]="complaint.actualBehavior"
                          name="actualBehavior"
                          placeholder="What actually happened?"></textarea>
              </div>
            </div>

            <!-- Screenshot Upload (Optional) -->
            <div class="form-group">
              <label class="form-label">
                <i class="bi bi-image"></i>
                Screenshots (Optional)
              </label>
              <div class="upload-area" (click)="fileInput.click()" (dragover)="onDragOver($event)" (drop)="onDrop($event)">
                <input type="file" #fileInput multiple accept="image/*" style="display: none" (change)="onFileSelected($event)">
                <i class="bi bi-cloud-upload"></i>
                <p>Click or drag & drop screenshots here</p>
                <small>Supported formats: PNG, JPG, JPEG, GIF (Max 5MB each)</small>
              </div>
              <div class="attachments-list" *ngIf="attachments.length > 0">
                <div *ngFor="let file of attachments; let i = index" class="attachment-item">
                  <i class="bi bi-file-image"></i>
                  <span>{{ file.name }}</span>
                  <button type="button" (click)="removeAttachment(i)">×</button>
                </div>
              </div>
            </div>

            <!-- System Info (Auto-detected) -->
            <div class="system-info">
              <div class="info-header">
                <i class="bi bi-info-circle"></i>
                <span>System Information (Auto-detected)</span>
              </div>
              <div class="info-content">
                <div class="info-row">
                  <span class="info-label">Browser:</span>
                  <span class="info-value">{{ browserInfo.browser }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">OS:</span>
                  <span class="info-value">{{ browserInfo.os }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Screen Size:</span>
                  <span class="info-value">{{ browserInfo.screenSize }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Current Page:</span>
                  <span class="info-value">{{ browserInfo.currentPage }}</span>
                </div>
              </div>
            </div>

            <!-- Success Message -->
            <div class="success-message" *ngIf="showSuccess">
              <i class="bi bi-check-circle-fill"></i>
              <div>
                <strong>Report Submitted Successfully!</strong>
                <p>Thank you for your report. Our team will review it shortly.</p>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="form-actions">
              <button type="button" class="btn-clear" (click)="resetForm()">
                <i class="bi bi-eraser"></i>
                Clear Form
              </button>
              <button type="submit" class="btn-submit" [disabled]="complaintForm.invalid || isSubmitting">
                <i class="bi" [ngClass]="isSubmitting ? 'bi-hourglass-split' : 'bi-send'"></i>
                {{ isSubmitting ? 'Submitting...' : 'Submit Report' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .complaint-form-container {
      padding: 1.5rem;
      background: #f8fafc;
      min-height: 100vh;
    }

    .form-card {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      border-radius: 1.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      animation: slideInUp 0.4s ease-out;
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Form Header */
    .form-header {
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      border-bottom: 1px solid #fecaca;
    }

    .header-icon {
      width: 56px;
      height: 56px;
      background: #ef4444;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .header-icon i {
      font-size: 1.75rem;
      color: white;
    }

    .header-text h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #991b1b;
    }

    .header-text p {
      margin: 0.25rem 0 0;
      font-size: 0.875rem;
      color: #b91c1c;
    }

    /* Form Body */
    .form-body {
      padding: 1.5rem;
    }

    /* Form Groups */
    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .form-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #1f2937;
      font-size: 0.875rem;
    }

    .form-label.required::after {
      content: '*';
      color: #ef4444;
      margin-left: 4px;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 0.75rem;
      font-size: 0.875rem;
      transition: all 0.2s;
      font-family: inherit;
    }

    .form-control:focus {
      outline: none;
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    textarea.form-control {
      resize: vertical;
      font-family: inherit;
    }

    .error-message {
      color: #ef4444;
      font-size: 0.75rem;
      margin-top: 0.5rem;
    }

    .field-hint {
      display: block;
      font-size: 0.7rem;
      color: #6b7280;
      margin-top: 0.5rem;
    }

    /* Severity Buttons */
    .severity-buttons {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .severity-btn {
      flex: 1;
      padding: 0.625rem 1rem;
      border: 2px solid #e5e7eb;
      background: white;
      border-radius: 0.75rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s;
    }

    .severity-btn:hover {
      transform: translateY(-1px);
    }

    .severity-btn.low.active {
      background: #f0fdf4;
      border-color: #10b981;
      color: #059669;
    }

    .severity-btn.medium.active {
      background: #fefce8;
      border-color: #eab308;
      color: #854d0e;
    }

    .severity-btn.high.active {
      background: #fff7ed;
      border-color: #f97316;
      color: #c2410c;
    }

    .severity-btn.critical.active {
      background: #fef2f2;
      border-color: #ef4444;
      color: #b91c1c;
    }

    /* Upload Area */
    .upload-area {
      border: 2px dashed #e5e7eb;
      border-radius: 0.75rem;
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .upload-area:hover {
      border-color: #ef4444;
      background: #fef2f2;
    }

    .upload-area i {
      font-size: 2.5rem;
      color: #9ca3af;
      margin-bottom: 0.5rem;
    }

    .upload-area p {
      margin: 0;
      font-size: 0.875rem;
      color: #6b7280;
    }

    .upload-area small {
      font-size: 0.7rem;
      color: #9ca3af;
    }

    .attachments-list {
      margin-top: 1rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .attachment-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.75rem;
      background: #f3f4f6;
      border-radius: 0.5rem;
      font-size: 0.75rem;
    }

    .attachment-item button {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.25rem;
      color: #ef4444;
      margin-left: 0.5rem;
      font-weight: bold;
    }

    /* System Info */
    .system-info {
      background: #f8fafc;
      border-radius: 0.75rem;
      padding: 1rem;
      margin-bottom: 1.5rem;
      border: 1px solid #e2e8f0;
    }

    .info-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: #475569;
    }

    .info-content {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
    }

    .info-row {
      font-size: 0.75rem;
    }

    .info-label {
      color: #64748b;
    }

    .info-value {
      color: #1e293b;
      font-weight: 500;
      margin-left: 0.5rem;
    }

    /* Success Message */
    .success-message {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 0.75rem;
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      animation: slideIn 0.3s ease-out;
    }

    .success-message i {
      font-size: 1.5rem;
      color: #10b981;
    }

    .success-message strong {
      color: #059669;
    }

    .success-message p {
      margin: 0.25rem 0 0;
      font-size: 0.75rem;
      color: #166534;
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

    /* Form Actions */
    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }

    .btn-clear {
      padding: 0.625rem 1.25rem;
      border: 2px solid #e5e7eb;
      background: white;
      border-radius: 0.75rem;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-clear:hover {
      background: #f9fafb;
      border-color: #d1d5db;
    }

    .btn-submit {
      padding: 0.625rem 1.5rem;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      border: none;
      border-radius: 0.75rem;
      color: white;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }

    .btn-submit:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .complaint-form-container {
        padding: 1rem;
      }

      .form-row {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .form-header {
        flex-direction: column;
        text-align: center;
      }

      .header-text h2 {
        font-size: 1.25rem;
      }

      .severity-buttons {
        flex-direction: column;
      }

      .info-content {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }

      .btn-clear, .btn-submit {
        width: 100%;
        justify-content: center;
      }
    }

    /* Dark Mode Support */
    @media (prefers-color-scheme: dark) {
      .complaint-form-container {
        background: #0f172a;
      }

      .form-card {
        background: #1e293b;
      }

      .form-label {
        color: #e2e8f0;
      }

      .form-control {
        background: #334155;
        border-color: #475569;
        color: #f1f5f9;
      }

      .form-control:focus {
        border-color: #ef4444;
      }

      .severity-btn {
        background: #334155;
        border-color: #475569;
        color: #e2e8f0;
      }

      .system-info {
        background: #0f172a;
        border-color: #334155;
      }

      .info-header {
        color: #94a3b8;
      }

      .info-value {
        color: #cbd5e1;
      }

      .btn-clear {
        background: #334155;
        border-color: #475569;
        color: #e2e8f0;
      }

      .btn-clear:hover {
        background: #475569;
      }
    }
  `]
})
export class SystemComplaintFormComponent {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  isSubmitting = false;
  showSuccess = false;

  categories: ComplaintCategory[] = [
    'UI/UX Issue',
    'Data Error',
    'Performance Issue',
    'Export/Print Error',
    'Chart/Graph Issue',
    'Login/Auth Issue',
    'Data Sync Issue',
    'Feature Request',
    'Other'
  ];

  severities = [
    { value: 'low' as SeverityLevel, label: 'Low', icon: 'bi bi-emoji-smile' },
    { value: 'medium' as SeverityLevel, label: 'Medium', icon: 'bi bi-emoji-neutral' },
    { value: 'high' as SeverityLevel, label: 'High', icon: 'bi bi-emoji-frown' },
    { value: 'critical' as SeverityLevel, label: 'Critical', icon: 'bi bi-exclamation-triangle' }
  ];

  complaint: SystemComplaint = {
    title: '',
    category: 'Other',
    description: '',
    severity: 'medium',
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    attachments: [],
    browserInfo: '',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  attachments: File[] = [];
  browserInfo: any = {};

  constructor() {
    this.detectBrowserInfo();
  }

  detectBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let os = 'Unknown';

    if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
    else if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
    else if (ua.indexOf('Safari') > -1) browser = 'Safari';
    else if (ua.indexOf('Edge') > -1) browser = 'Edge';

    if (ua.indexOf('Windows') > -1) os = 'Windows';
    else if (ua.indexOf('Mac') > -1) os = 'MacOS';
    else if (ua.indexOf('Linux') > -1) os = 'Linux';
    else if (ua.indexOf('Android') > -1) os = 'Android';
    else if (ua.indexOf('iOS') > -1) os = 'iOS';

    this.browserInfo = {
      browser: `${browser} (${navigator.userAgent.match(/Chrome\/(\d+)/)?.[1] || ''})`,
      os: os,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      currentPage: window.location.pathname
    };

    this.complaint.browserInfo = JSON.stringify(this.browserInfo);
  }

  resetForm() {
    this.complaint = {
      title: '',
      category: 'Other',
      description: '',
      severity: 'medium',
      stepsToReproduce: '',
      expectedBehavior: '',
      actualBehavior: '',
      attachments: [],
      browserInfo: this.complaint.browserInfo,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.attachments = [];
    this.showSuccess = false;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(files);
    }
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files) {
      this.handleFiles(files);
    }
  }

  handleFiles(files: FileList) {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!validTypes.includes(file.type)) {
        alert('Invalid file type. Please upload PNG, JPG, JPEG, or GIF files only.');
        continue;
      }
      if (file.size > maxSize) {
        alert('File too large. Maximum size is 5MB.');
        continue;
      }
      this.attachments.push(file);
    }
  }

  removeAttachment(index: number) {
    this.attachments.splice(index, 1);
  }

  async submitComplaint() {
    if (!this.complaint.title || !this.complaint.description || !this.complaint.category) {
      alert('Please fill in all required fields');
      return;
    }

    this.isSubmitting = true;

    const user = this.auth.currentUser;
    const complaintData: any = {
      ...this.complaint,
      userId: user?.uid,
      userEmail: user?.email,
      attachmentNames: this.attachments.map(f => f.name),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    try {
      const complaintsCollection = collection(this.firestore, 'system_complaints');
      const docRef = await addDoc(complaintsCollection, complaintData);

      console.log('Complaint submitted with ID:', docRef.id);

      this.showSuccess = true;
      this.resetForm();

      // Hide success message after 5 seconds
      setTimeout(() => {
        this.showSuccess = false;
      }, 5000);

    } catch (error) {
      console.error('Error submitting complaint:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      this.isSubmitting = false;
    }
  }
}
