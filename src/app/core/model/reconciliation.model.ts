// src/app/core/models/reconciliation.model.ts
import { Timestamp } from '@angular/fire/firestore';
import { Transaction, MonthlySummary } from './transaction.model';

// Reconciliation Item (outstanding checks, deposits in transit, etc.)
export interface ReconciliationItem {
  id: string;
  description: string;
  reference: string;
  amount: number;
  type: 'OUTSTANDING_CHECK' | 'DEPOSIT_IN_TRANSIT' | 'BANK_ERROR' | 'BOOK_ERROR';
  date: Date;
  cleared?: boolean;
  clearedDate?: Date;
  notes?: string;
}

// Bank Reconciliation
export interface Reconciliation {
  id?: string;
  year: number;
  month: number;
  reconciliationDate: Date;
  bankStatementBalance: number;
  bookBalance: number;
  outstandingChecks: ReconciliationItem[];
  depositsInTransit: ReconciliationItem[];
  bankErrors: ReconciliationItem[];
  bookErrors: ReconciliationItem[];
  difference: number;
  adjustedBalance: number;
  status: 'RECONCILED' | 'DISCREPANCY' | 'PENDING' | 'IN_PROGRESS';
  notes?: string;
  reconciledBy: string;
  reconciledAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Month End Closing
export interface MonthEndClose {
  id?: string;
  year: number;
  month: number;
  closedDate: Date;
  closedBy: string;
  summary: MonthlySummary;
  adjustments?: Adjustment[];
  closingBalance: number;
  status: 'CLOSED' | 'PENDING' | 'REOPENED';
  reopenedBy?: string;
  reopenedDate?: Date;
  reopenReason?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Journal Adjustment
export interface Adjustment {
  id?: string;
  type: 'DEBIT' | 'CREDIT';
  accountCode: string;
  accountName: string;
  amount: number;
  description: string;
  reason: string;
  approvedBy: string;
  approvedAt: Timestamp;
  createdAt: Timestamp;
}

// Bank Statement Import
export interface BankStatement {
  id?: string;
  bankAccountId: string;
  bankAccountName: string;
  statementDate: Date;
  openingBalance: number;
  closingBalance: number;
  transactions: BankTransaction[];
  importedBy: string;
  importedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Bank Transaction from Statement
export interface BankTransaction {
  id?: string;
  transactionDate: Date;
  valueDate?: Date;
  description: string;
  reference: string;
  debit: number;
  credit: number;
  balance: number;
  matchedToTransactionId?: string;
  matchedToVoucherNo?: string;
  isMatched: boolean;
  matchConfidence?: number;
}

// Reconciliation Summary Report
export interface ReconciliationReport {
  reconciliation: Reconciliation;
  bankStatement: BankStatement | null;
  unmatchedBankTransactions: BankTransaction[];
  unmatchedBookTransactions: Transaction[];
  varianceAnalysis: VarianceAnalysis;
  adjustmentsMade: Adjustment[];
  summary: {
    totalOutstandingChecks: number;
    totalDepositsInTransit: number;
    totalBankErrors: number;
    totalBookErrors: number;
    adjustedBankBalance: number;
    adjustedBookBalance: number;
    isReconciled: boolean;
    differenceAmount: number;
  };
}

// Variance Analysis
export interface VarianceAnalysis {
  timingDifferences: {
    outstandingChecks: number;
    depositsInTransit: number;
  };
  errors: {
    bankErrors: number;
    bookErrors: number;
    totalErrors: number;
  };
  unrecordedTransactions: {
    bankOnly: number;
    bookOnly: number;
  };
  explanations: VarianceExplanation[];
}

// Variance Explanation
export interface VarianceExplanation {
  id?: string;
  varianceType: 'TIMING' | 'ERROR' | 'UNRECORDED' | 'OTHER';
  amount: number;
  description: string;
  resolution?: string;
  resolvedDate?: Date;
  status: 'PENDING' | 'RESOLVED' | 'EXPLAINED';
}

// Reconciliation Dashboard Stats
export interface ReconciliationStats {
  totalReconciliations: number;
  reconciledCount: number;
  discrepancyCount: number;
  pendingCount: number;
  averageDiscrepancy: number;
  largestDiscrepancy: number;
  monthsReconciled: number[];
  monthsPending: number[];
  recentReconciliations: Reconciliation[];
}

// Month End Close Checklist
export interface CloseChecklist {
  id?: string;
  year: number;
  month: number;
  items: ChecklistItem[];
  completedBy: string;
  completedAt: Timestamp;
  verifiedBy: string;
  verifiedAt: Timestamp;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED';
}

// Checklist Item
export interface ChecklistItem {
  id: string;
  name: string;
  description: string;
  isRequired: boolean;
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: Date;
  notes?: string;
  category: 'TRANSACTIONS' | 'RECONCILIATION' | 'ADJUSTMENTS' | 'REPORTS' | 'APPROVALS';
}

// Standard Close Checklist Items
export const STANDARD_CLOSE_CHECKLIST: ChecklistItem[] = [
  {
    id: 'transactions_1',
    name: 'All Transactions Posted',
    description: 'Ensure all transactions for the month have been entered and approved',
    isRequired: true,
    isCompleted: false,
    category: 'TRANSACTIONS'
  },
  {
    id: 'transactions_2',
    name: 'No Pending Approvals',
    description: 'All pending transactions have been approved or rejected',
    isRequired: true,
    isCompleted: false,
    category: 'TRANSACTIONS'
  },
  {
    id: 'reconciliation_1',
    name: 'Bank Reconciliation Completed',
    description: 'Bank statements have been reconciled with book balances',
    isRequired: true,
    isCompleted: false,
    category: 'RECONCILIATION'
  },
  {
    id: 'reconciliation_2',
    name: 'Outstanding Items Reviewed',
    description: 'All outstanding checks and deposits in transit have been reviewed',
    isRequired: true,
    isCompleted: false,
    category: 'RECONCILIATION'
  },
  {
    id: 'adjustments_1',
    name: 'Adjustments Posted',
    description: 'All necessary adjusting entries have been posted',
    isRequired: false,
    isCompleted: false,
    category: 'ADJUSTMENTS'
  },
  {
    id: 'reports_1',
    name: 'Monthly Reports Generated',
    description: 'Cash book, NCOA summary, and payee reports have been generated',
    isRequired: true,
    isCompleted: false,
    category: 'REPORTS'
  },
  {
    id: 'reports_2',
    name: 'Reports Reviewed',
    description: 'All monthly reports have been reviewed for accuracy',
    isRequired: true,
    isCompleted: false,
    category: 'REPORTS'
  },
  {
    id: 'approvals_1',
    name: 'Management Approval',
    description: 'Month-end closing has been approved by management',
    isRequired: true,
    isCompleted: false,
    category: 'APPROVALS'
  },
  {
    id: 'approvals_2',
    name: 'Audit Trail Verified',
    description: 'Audit trail has been reviewed for all transactions',
    isRequired: true,
    isCompleted: false,
    category: 'APPROVALS'
  }
];

// Reconciliation Filters
export interface ReconciliationFilter {
  year?: number;
  month?: number;
  status?: Reconciliation['status'];
  startDate?: Date;
  endDate?: Date;
  bankAccountId?: string;
  hasDiscrepancies?: boolean;
}

// Reconciliation Action
export interface ReconciliationAction {
  id?: string;
  reconciliationId: string;
  actionType: 'MATCH' | 'UNMATCH' | 'ADJUST' | 'EXPLAIN' | 'RESOLVE';
  description: string;
  amount?: number;
  transactionId?: string;
  bankTransactionId?: string;
  performedBy: string;
  performedAt: Timestamp;
  notes?: string;
}

// Reconciliation History
export interface ReconciliationHistory {
  id?: string;
  reconciliationId: string;
  action: ReconciliationAction;
  previousState?: Partial<Reconciliation>;
  newState?: Partial<Reconciliation>;
  createdAt: Timestamp;
}

// Bank Account Reconciliation Summary
export interface BankAccountReconciliation {
  bankAccountId: string;
  bankAccountName: string;
  reconciliations: Reconciliation[];
  latestReconciliationDate?: Date;
  latestReconciliationStatus?: Reconciliation['status'];
  averageDifference: number;
  isCurrent: boolean;
  monthsBehind?: number;
}

// Reconciliation Export Data
export interface ReconciliationExport {
  reconciliation: Reconciliation;
  formattedDate: string;
  formattedBalance: string;
  formattedDifference: string;
  outstandingChecksCount: number;
  outstandingChecksTotal: number;
  depositsInTransitCount: number;
  depositsInTransitTotal: number;
  adjustmentsCount: number;
  adjustmentsTotal: number;
  reportGeneratedAt: string;
  generatedBy: string;
}

// Validation Result
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

// Validation Error
export interface ValidationError {
  field: string;
  message: string;
  severity: 'ERROR' | 'WARNING';
}

// Validation Warning
export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}
