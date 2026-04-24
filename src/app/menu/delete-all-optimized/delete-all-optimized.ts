// delete-all-optimized.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CashbookService } from '../../core/services/cashbook.service';

@Component({
  selector: 'app-delete-all-optimized',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-4">
      <div class="card border-danger">
        <div class="card-header bg-danger text-white">
          <h4 class="mb-0">⚠️ Danger Zone: Delete All Records</h4>
        </div>
        <div class="card-body">
          <!-- Warning Alert -->
          <div class="alert alert-warning">
            <strong>⚠️ WARNING!</strong> This action will permanently delete all cashbook entries.
            This operation cannot be undone.
          </div>

          <!-- Document Count Info -->
          <div *ngIf="documentCount !== null" class="alert alert-info">
            <strong>📊 Database Status:</strong> Found <strong>{{ documentCount }}</strong> document(s) in the collection.
            <button *ngIf="!isDeleting" class="btn btn-sm btn-info ms-2" (click)="refreshCount()">
              🔄 Refresh
            </button>
          </div>

          <!-- Password Form -->
          <form (ngSubmit)="deleteAll()" #deleteForm="ngForm">
            <div class="mb-3">
              <label for="password" class="form-label">Admin Password</label>
              <input
                type="password"
                class="form-control"
                id="password"
                [(ngModel)]="password"
                name="password"
                required
                [class.is-invalid]="passwordError"
                autocomplete="off"
              >
              <div class="invalid-feedback" *ngIf="passwordError">
                {{ passwordError }}
              </div>
            </div>

            <div class="mb-3">
              <label for="confirmPassword" class="form-label">Confirm Password</label>
              <input
                type="password"
                class="form-control"
                id="confirmPassword"
                [(ngModel)]="confirmPassword"
                name="confirmPassword"
                required
                [class.is-invalid]="confirmPasswordError"
                autocomplete="off"
              >
              <div class="invalid-feedback" *ngIf="confirmPasswordError">
                {{ confirmPasswordError }}
              </div>
            </div>

            <div class="mb-3 form-check">
              <input
                type="checkbox"
                class="form-check-input"
                id="confirmDelete"
                [(ngModel)]="confirmDelete"
                name="confirmDelete"
                required
              >
              <label class="form-check-label" for="confirmDelete">
                I understand that this action is irreversible and will delete all <strong>{{ documentCount }}</strong> record(s)
              </label>
            </div>

            <div class="mb-3" *ngIf="estimatedInfo">
              <div class="alert alert-secondary">
                <small>
                  <strong>📋 Estimated Impact:</strong><br>
                  • Total documents: {{ estimatedInfo.totalDocuments }}<br>
                  • Batches to process: {{ estimatedInfo.estimatedBatches }}<br>
                  • Estimated time: {{ estimatedInfo.estimatedTime }}
                </small>
              </div>
            </div>

            <div class="btn-group">
              <button
                type="submit"
                class="btn btn-danger"
                [disabled]="deleteForm.invalid || isDeleting || documentCount === 0"
              >
                <span *ngIf="isDeleting" class="spinner-border spinner-border-sm me-2"></span>
                {{ isDeleting ? 'Deleting...' : 'Delete All Records' }}
              </button>

              <button
                type="button"
                class="btn btn-secondary"
                (click)="resetForm()"
                [disabled]="isDeleting"
              >
                Cancel
              </button>

              <button
                type="button"
                class="btn btn-info"
                (click)="dryRun()"
                [disabled]="isDeleting"
              >
                🔍 Dry Run
              </button>
            </div>
          </form>

          <!-- Progress Section -->
          <div *ngIf="showProgress" class="mt-4">
            <div class="card">
              <div class="card-body">
                <h6>Deletion Progress</h6>
                <div class="progress mb-2" style="height: 30px;">
                  <div
                    class="progress-bar progress-bar-striped progress-bar-animated"
                    [class.bg-success]="progress === 100"
                    role="progressbar"
                    [style.width]="progress + '%'"
                    [attr.aria-valuenow]="progress"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    {{ progress | number:'1.0-0' }}%
                  </div>
                </div>

                <div class="row text-center">
                  <div class="col-6">
                    <small class="text-muted">Deleted:</small>
                    <strong class="d-block">{{ deletedCount | number }}</strong>
                  </div>
                  <div class="col-6">
                    <small class="text-muted">Total:</small>
                    <strong class="d-block">{{ totalCount | number }}</strong>
                  </div>
                </div>

                <div *ngIf="executionTime" class="text-center mt-2">
                  <small class="text-success">
                    ✅ Completed in {{ (executionTime / 1000).toFixed(2) }} seconds
                  </small>
                </div>
              </div>
            </div>
          </div>

          <!-- Status Messages -->
          <div *ngIf="successMessage" class="alert alert-success mt-3">
            <strong>✅ Success!</strong> {{ successMessage }}
          </div>

          <div *ngIf="errorMessage" class="alert alert-danger mt-3">
            <strong>❌ Error!</strong> {{ errorMessage }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .progress {
      border-radius: 5px;
      overflow: hidden;
    }
    .progress-bar {
      font-weight: bold;
      line-height: 30px;
      transition: width 0.3s ease;
    }
    .btn-group {
      gap: 10px;
    }
  `]
})
export class DeleteAllOptimizedComponent implements OnInit {
  password = '';
  confirmPassword = '';
  confirmDelete = false;
  isDeleting = false;
  showProgress = false;
  progress = 0;
  deletedCount = 0;
  totalCount = 0;
  documentCount: number | null = null;
  successMessage = '';
  errorMessage = '';
  passwordError = '';
  confirmPasswordError = '';
  executionTime: number | null = null;
  estimatedInfo: any = null;

  constructor(private cashbookService: CashbookService) {}

  async ngOnInit() {
    await this.refreshCount();
  }

  async refreshCount() {
    try {
      this.documentCount = await this.cashbookService.getDocumentCount();
    } catch (error) {
      console.error('Error getting count:', error);
      this.documentCount = null;
    }
  }

  async dryRun() {
    if (!this.password) {
      this.passwordError = 'Please enter password for dry run';
      return;
    }

    try {
      this.estimatedInfo = await this.cashbookService.dryRunDelete(this.password);
      this.successMessage = `Dry run completed: Found ${this.estimatedInfo.totalDocuments} documents to delete`;
      setTimeout(() => {
        if (this.successMessage) this.successMessage = '';
      }, 5000);
    } catch (error: any) {
      this.errorMessage = error.message;
      setTimeout(() => {
        if (this.errorMessage) this.errorMessage = '';
      }, 5000);
    }
  }

  deleteAll() {
    // Reset states
    this.successMessage = '';
    this.errorMessage = '';
    this.passwordError = '';
    this.confirmPasswordError = '';
    this.executionTime = null;

    // Validate
    if (this.password !== this.confirmPassword) {
      this.confirmPasswordError = 'Passwords do not match';
      return;
    }

    if (this.password.length < 6) {
      this.passwordError = 'Password must be at least 6 characters';
      return;
    }

    if (!this.confirmDelete) {
      this.errorMessage = 'Please confirm that you want to delete all records';
      return;
    }

    if (this.documentCount === 0) {
      this.errorMessage = 'No documents to delete';
      return;
    }

    this.isDeleting = true;
    this.showProgress = true;
    this.progress = 0;
    this.deletedCount = 0;
    this.totalCount = this.documentCount || 0;

    // Use the optimized method
    this.cashbookService.deleteAllEntriesOptimized(this.password, this.confirmPassword)
      .subscribe({
        next: (result) => {
          this.progress = 100;
          this.deletedCount = result.deletedCount;
          this.successMessage = result.message;
          this.executionTime = result.executionTime || null;
          this.isDeleting = false;

          // Refresh the count after deletion
          this.refreshCount();

          // Reset form after 3 seconds
          setTimeout(() => {
            if (!this.isDeleting) {
              this.resetForm();
            }
          }, 3000);
        },
        error: (error) => {
          this.errorMessage = error.message || 'An error occurred';
          this.isDeleting = false;
          this.showProgress = false;
          console.error('Delete error:', error);
        }
      });
  }

  resetForm() {
    this.password = '';
    this.confirmPassword = '';
    this.confirmDelete = false;
    this.isDeleting = false;
    this.showProgress = false;
    this.progress = 0;
    this.deletedCount = 0;
    this.totalCount = 0;
    this.successMessage = '';
    this.errorMessage = '';
    this.passwordError = '';
    this.confirmPasswordError = '';
    this.executionTime = null;
    this.estimatedInfo = null;
  }
}
