import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import {CommonModule, NgForOf, NgIf} from '@angular/common';
import {FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, FormsModule} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, map } from 'rxjs';
import { TransactionService } from '../../core/services/transaction.service';
import { MasterDataService } from '../../core/services/master-data.service';
import { Payee, BankAccount, NCOACode } from '../../core/model/master.model';
import { Timestamp } from '@angular/fire/firestore';
@Component({
  selector: 'app-transactions',
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgForOf,
    FormsModule
  ],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class Transactions {
  transactionForm: FormGroup;
  isEditing = false;
  isSubmitting = false;
  isLoading = true;
  showPayeeModal = false;
  newPayeeName = '';
  newPayeeCode = '';
  newPayeeType = 'EMPLOYEE';
  transactionId: string | null = null;
  today = new Date().toISOString().split('T')[0];

  payees: Payee[] = [];
  ncoaCodes: NCOACode[] = [];
  bankAccounts: BankAccount[] = [];
  allCategories: any[] = [];
  filteredCategories: any[] = [];

  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private masterDataService: MasterDataService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.transactionForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadMasterData();
    this.checkForEdit();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      voucherNo: [{ value: '', disabled: true }],
      transactionDate: [this.today, [Validators.required]],
      transactionType: ['', [Validators.required]],
      payeeName: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      category: ['', [Validators.required]],
      ncoaCode: ['', [Validators.required]],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      bankAccountId: ['', [Validators.required]],
      dvbn: [''],
      tsabank: ['']
    });
  }

  private loadMasterData(): void {
    // Load payees
    this.subscriptions.add(
      this.masterDataService.getPayees().subscribe(data => {
        this.payees = data;
      })
    );

    // Load NCOA codes
    this.subscriptions.add(
      this.masterDataService.getNCOACodes().subscribe(data => {
        this.ncoaCodes = data;
      })
    );

    // Load bank accounts
    this.subscriptions.add(
      this.masterDataService.getBankAccounts().subscribe(data => {
        this.bankAccounts = data;
      })
    );

    this.allCategories = this.masterDataService.getPaymentCategories();
    this.filteredCategories = [...this.allCategories];
  }

  private async checkForEdit(): Promise<void> {
    this.transactionId = this.route.snapshot.paramMap.get('id');
    if (this.transactionId) {
      this.isEditing = true;
      this.subscriptions.add(
        this.transactionService.getTransactionById(this.transactionId).subscribe(transaction => {
          if (transaction) {
            // Convert Timestamp to date string
            const date = transaction.transactionDate instanceof Timestamp
              ? transaction.transactionDate.toDate()
              : new Date(transaction.transactionDate);

            this.transactionForm.patchValue({
              ...transaction,
              transactionDate: date.toISOString().split('T')[0]
            });
            this.onTypeChange(transaction.transactionType);
          }
          this.isLoading = false;
        })
      );
    } else {
      // Generate voucher number for new transaction
      const voucherNo = await this.transactionService['firebaseService'].generateVoucherNumber();
      this.transactionForm.patchValue({ voucherNo });
      this.isLoading = false;
    }
  }

  onTypeChange(type: string): void {
    if (type === 'RECEIPT') {
      this.filteredCategories = this.allCategories.filter(c => c.type === 'RECEIPT');
    } else {
      this.filteredCategories = this.allCategories.filter(c => c.type === 'PAYMENT');
    }
    this.transactionForm.patchValue({ category: '' });
  }

  addNewPayee(): void {
    this.showPayeeModal = true;
  }

  closePayeeModal(): void {
    this.showPayeeModal = false;
    this.newPayeeName = '';
    this.newPayeeCode = '';
    this.newPayeeType = 'EMPLOYEE';
  }

  async saveNewPayee(): Promise<void> {
    if (this.newPayeeName.trim()) {
      const code = this.newPayeeCode || this.newPayeeName.substring(0, 3).toUpperCase();
      await this.masterDataService.addPayee({
        name: this.newPayeeName,
        code,
        type: this.newPayeeType as any,
        isActive: true
      });

      // Reload payees
      this.masterDataService.getPayees().subscribe(data => {
        this.payees = data;
      });

      this.closePayeeModal();
    }
  }

  async onSubmit(): Promise<void> {
    if (this.transactionForm.valid) {
      this.isSubmitting = true;

      const formValue = this.transactionForm.getRawValue();
      const transactionData: any = {
        ...formValue,
        transactionDate: new Date(formValue.transactionDate),
        amount: Number(formValue.amount)
      };

      try {
        if (this.isEditing && this.transactionId) {
          await this.transactionService.updateTransaction(this.transactionId, transactionData);
        } else {
          await this.transactionService.createTransaction(transactionData);
        }
        this.router.navigate(['/transactions']);
      } catch (error) {
        console.error('Error saving transaction:', error);
        alert('Failed to save transaction. Please try again.');
      } finally {
        this.isSubmitting = false;
      }
    } else {
      this.markFormGroupTouched(this.transactionForm);
    }
  }

  onCancel(): void {
    this.router.navigate(['/transactions']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Getters for form controls
  get transactionDate(): AbstractControl | null { return this.transactionForm.get('transactionDate'); }
  get transactionType(): AbstractControl | null { return this.transactionForm.get('transactionType'); }
  get payeeName(): AbstractControl | null { return this.transactionForm.get('payeeName'); }
  get description(): AbstractControl | null { return this.transactionForm.get('description'); }
  get category(): AbstractControl | null { return this.transactionForm.get('category'); }
  get ncoaCode(): AbstractControl | null { return this.transactionForm.get('ncoaCode'); }
  get amount(): AbstractControl | null { return this.transactionForm.get('amount'); }
  get bankAccountId(): AbstractControl | null { return this.transactionForm.get('bankAccountId'); }
}
