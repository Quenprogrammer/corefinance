export interface CashbookEntry {
  id?: string;
  date: Date;
  voucherNumber: number;
  transactionType: TransactionType;
  description: string;
  ncoaCode: string;
  bankAccount: string;
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

export type TransactionType = 'receipt' | 'payment';

export type ReceiptCategory =
  | 'Tax Revenue'
  | 'Fees & Charges'
  | 'Licenses'
  | 'Fines & Penalties'
  | 'Grants & Aids'
  | 'Other Receipts';

export type PaymentCategory =
  | 'Personnel Services'
  | 'Maintenance & Operating'
  | 'Financial Expenses'
  | 'Capital Outlay'
  | 'Debt Service'
  | 'Other Payments';

export interface MonthlySummary {
  month: number;
  monthName: string;
  receipts: number;
  payments: number;
  balance: number;
  openingBalance: number;
  closingBalance: number;
}

export interface CategoryAnalysis {
  category: string;
  amount: number;
  percentage: number;
  count: number;
  transactions: CashbookEntry[];
}

export interface DashboardStats {
  openingBalance: number;
  totalReceipts: number;
  totalPayments: number;
  currentBalance: number;
  receiptCount: number;
  paymentCount: number;
  averageTransaction: number;
}

export interface FilterCriteria {
  startDate?: Date;
  endDate?: Date;
  month?: number;
  year?: number;
  transactionType?: TransactionType | 'all';
  category?: string;
  searchTerm?: string;
  ncoaCode?: string;
  bankAccount?: string;
}
