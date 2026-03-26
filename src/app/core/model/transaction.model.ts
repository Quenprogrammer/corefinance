// src/app/core/models/transaction.model.ts
import { Timestamp } from '@angular/fire/firestore';

export interface Transaction {
  id?: string;
  voucherNo: string;
  transactionDate: Date | Timestamp;
  transactionType: 'RECEIPT' | 'PAYMENT';
  payeeId?: string;
  payeeName: string;
  description: string;
  category: string;
  ncoaCode: string;
  amount: number;
  bankAccountId: string;
  bankName?: string;
  dvbn?: string;
  tsabank?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'VOID';
  attachments?: string[];
  approvedBy?: string;
  approvedAt?: Timestamp;
  voided?: boolean;
  voidReason?: string;
  voidedAt?: Timestamp;
  rejectionReason?: string;
  cleared?: boolean;
  clearedAt?: Timestamp;
  createdBy?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TransactionFilter {
  startDate?: Date;
  endDate?: Date;
  transactionType?: 'RECEIPT' | 'PAYMENT';
  category?: string;
  payeeName?: string;
  minAmount?: number;
  maxAmount?: number;
  status?: string;
  searchTerm?: string;
  cleared?: boolean;
}

export interface MonthlySummary {
  month: number;
  year: number;
  monthName: string;
  openingBalance: number;
  totalReceipts: number;
  totalPayments: number;
  closingBalance: number;
  netBalance?: number; // Alias for closingBalance for backward compatibility
  receiptsByCategory: { [key: string]: number };
  paymentsByCategory: { [key: string]: number };
  transactionCount: number;
  receiptCount: number;
  paymentCount: number;
}

export interface TransactionStats {
  totalReceipts: number;
  totalPayments: number;
  netBalance: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  voidCount: number;
  currentMonthReceipts: number;
  currentMonthPayments: number;
  currentMonthCount: number;
}
