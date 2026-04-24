import {Component, inject, output, signal} from '@angular/core';
import {CashbookService} from '../../../app/core/services/cashbook.service';
import {CashbookEntry, PaymentCategory, ReceiptCategory, TransactionType} from '../../../app/core/model/cashbook.model';
import {Eaddtransactions} from "../../ExpenseAccounts/eaddtransactions/eaddtransactions";

@Component({
  selector: 'app-saddtransactions',
    imports: [
        Eaddtransactions
    ],
  templateUrl: './saddtransactions.html',
  styleUrl: './saddtransactions.scss',
})
export class Saddtransactions {
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

  // Date string for the input field
  dateString: string = '';

  // Get today's date as Date object
  getTodayDate(): Date {
    return new Date();
  }

  // Format date for input field (YYYY-MM-DD)
  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Update date string from Date object
  updateDateString() {
    if (this.entry.date) {
      this.dateString = this.formatDateForInput(this.entry.date);
    }
  }

  // Handle date change
  onDateChange(dateValue: string) {
    if (dateValue) {
      this.entry.date = new Date(dateValue);
      this.updateDateString();
      // Update month and year
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
    bankAccount: '',
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

  ngOnInit() {
    // Initialize filtered categories
    this.filteredReceiptCategories = [...this.receiptCategories];
    this.filteredPaymentCategories = [...this.paymentCategories];
    // Initialize date string
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

  onSubmit() {
    this.showErrorSummary = true;

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
      date: this.getTodayDate(),
      voucherNumber: 0,
      description: '',
      ncoaCode: '',
      bankAccount: '',
      amount: 0,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    };

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

    this.categorySearchTerm = '';
    this.filterCategories();

    // Update date string
    this.updateDateString();
  }

  isNcoaCodeValid(code: string): boolean {
    if (!code) return false;
    return /^[A-Z0-9-]+$/.test(code);
  }
}
