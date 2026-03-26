// src/app/core/services/master-data.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { FirebaseService } from './firebase.service';
import { Payee, NCOACode, BankAccount } from '../model/master.model';
import { Timestamp } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class MasterDataService {
  private firebaseService = inject(FirebaseService);

  // ==================== PAYEE OPERATIONS ====================

  getPayees(): Observable<Payee[]> {
    return this.firebaseService.getCollectionWithQuery('payees', 'isActive', '==', true, 'name', 'asc') as Observable<Payee[]>;
  }

  getAllPayees(): Observable<Payee[]> {
    return this.firebaseService.getCollection('payees') as Observable<Payee[]>;
  }

  getPayeeById(id: string): Observable<Payee | null> {
    return this.firebaseService.getDocument('payees', id) as Observable<Payee | null>;
  }

  searchPayees(searchTerm: string): Observable<Payee[]> {
    return this.getPayees().pipe(
      map(payees => payees.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    );
  }

  async addPayee(payee: Partial<Payee>): Promise<string> {
    const payeeData: Partial<Payee> = {
      ...payee,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    return await this.firebaseService.addDocument('payees', payeeData);
  }

  async updatePayee(id: string, payee: Partial<Payee>): Promise<void> {
    await this.firebaseService.updateDocument('payees', id, {
      ...payee,
      updatedAt: Timestamp.now()
    });
  }

  async deletePayee(id: string): Promise<void> {
    await this.firebaseService.updateDocument('payees', id, {
      isActive: false,
      updatedAt: Timestamp.now()
    });
  }

  // ==================== NCOA CODE OPERATIONS ====================

  getNCOACodes(): Observable<NCOACode[]> {
    return this.firebaseService.getCollectionWithQuery('ncoaCodes', 'isActive', '==', true, 'code', 'asc') as Observable<NCOACode[]>;
  }

  getNCOACodesByCategory(category: string): Observable<NCOACode[]> {
    return this.firebaseService.getCollectionWithQuery('ncoaCodes', 'category', '==', category) as Observable<NCOACode[]>;
  }

  getNCOACodeById(id: string): Observable<NCOACode | null> {
    return this.firebaseService.getDocument('ncoaCodes', id) as Observable<NCOACode | null>;
  }

  async addNCOACode(code: Partial<NCOACode>): Promise<string> {
    const codeData: Partial<NCOACode> = {
      ...code,
      isActive: true
    };
    return await this.firebaseService.addDocument('ncoaCodes', codeData);
  }

  async updateNCOACode(id: string, code: Partial<NCOACode>): Promise<void> {
    await this.firebaseService.updateDocument('ncoaCodes', id, code);
  }

  async deleteNCOACode(id: string): Promise<void> {
    await this.firebaseService.updateDocument('ncoaCodes', id, { isActive: false });
  }

  // ==================== BANK ACCOUNT OPERATIONS ====================

  getBankAccounts(): Observable<BankAccount[]> {
    return this.firebaseService.getCollectionWithQuery('bankAccounts', 'isActive', '==', true, 'name', 'asc') as Observable<BankAccount[]>;
  }

  getBankAccountById(id: string): Observable<BankAccount | null> {
    return this.firebaseService.getDocument('bankAccounts', id) as Observable<BankAccount | null>;
  }

  async addBankAccount(account: Partial<BankAccount>): Promise<string> {
    const accountData: Partial<BankAccount> = {
      ...account,
      isActive: true,
      currentBalance: account.openingBalance || 0
    };
    return await this.firebaseService.addDocument('bankAccounts', accountData);
  }

  async updateBankAccount(id: string, account: Partial<BankAccount>): Promise<void> {
    await this.firebaseService.updateDocument('bankAccounts', id, account);
  }

  async deleteBankAccount(id: string): Promise<void> {
    await this.firebaseService.updateDocument('bankAccounts', id, { isActive: false });
  }

  async updateBankBalance(id: string, amount: number, isAddition: boolean): Promise<void> {
    const account = await this.firebaseService.getDocumentSnapshot('bankAccounts', id);
    const currentBalance = account?.currentBalance || 0;
    const newBalance = isAddition ? currentBalance + amount : currentBalance - amount;

    await this.firebaseService.updateDocument('bankAccounts', id, {
      currentBalance: newBalance,
      updatedAt: Timestamp.now()
    });
  }

  // ==================== DEPARTMENT OPERATIONS ====================

  getDepartments(): Observable<Department[]> {
    return this.firebaseService.getCollectionWithQuery('departments', 'isActive', '==', true, 'name', 'asc') as Observable<Department[]>;
  }

  async addDepartment(department: Partial<Department>): Promise<string> {
    const departmentData: Partial<Department> = {
      ...department,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    return await this.firebaseService.addDocument('departments', departmentData);
  }

  async updateDepartment(id: string, department: Partial<Department>): Promise<void> {
    await this.firebaseService.updateDocument('departments', id, {
      ...department,
      updatedAt: Timestamp.now()
    });
  }

  // ==================== BUDGET OPERATIONS ====================

  getBudgets(year: number): Observable<Budget[]> {
    return this.firebaseService.getCollectionWithQuery('budgets', 'year', '==', year) as Observable<Budget[]>;
  }

  async addBudget(budget: Partial<Budget>): Promise<string> {
    const budgetData: Partial<Budget> = {
      ...budget,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    return await this.firebaseService.addDocument('budgets', budgetData);
  }

  async updateBudget(id: string, budget: Partial<Budget>): Promise<void> {
    await this.firebaseService.updateDocument('budgets', id, {
      ...budget,
      updatedAt: Timestamp.now()
    });
  }

  // ==================== STATIC LOOKUP DATA ====================

  getTransactionTypes(): { value: string; label: string }[] {
    return [
      { value: 'RECEIPT', label: 'Receipt' },
      { value: 'PAYMENT', label: 'Payment' }
    ];
  }

  getPaymentCategories(): { code: string; name: string; type: string; description?: string }[] {
    return [
      { code: 'SALARY', name: 'Salary', type: 'PAYMENT', description: 'Monthly salary payments' },
      { code: 'FSA', name: 'FSA', type: 'PAYMENT', description: 'FSA payments' },
      { code: 'SECURITY', name: 'Security Services', type: 'PAYMENT', description: 'Security service charges' },
      { code: 'OVERTIME', name: 'Overtime', type: 'PAYMENT', description: 'Overtime payments' },
      { code: 'ALLOWANCE', name: 'Non-Regular Allowance', type: 'PAYMENT', description: 'Special allowances' },
      { code: 'BANK_CHARGE', name: 'Bank Charges', type: 'PAYMENT', description: 'Bank service charges' },
      { code: 'CRF', name: 'CRF Transfer', type: 'RECEIPT', description: 'Receipt from CRF' },
      { code: 'INTERACCOUNT', name: 'Interaccount Transfer', type: 'RECEIPT', description: 'Transfer between accounts' },
      { code: 'PERSONAL_ADV', name: 'Personal Advance', type: 'RECEIPT', description: 'Personal advance receipts' },
      { code: 'FSA_RECEIPT', name: 'FSA Receipt', type: 'RECEIPT', description: 'FSA receipts' },
      { code: 'INTEREST', name: 'Interest Income', type: 'RECEIPT', description: 'Interest earned' },
      { code: 'REIMBURSEMENT', name: 'Reimbursement', type: 'RECEIPT', description: 'Expense reimbursements' }
    ];
  }

  getStatuses(): { value: string; label: string; color: string; bgColor: string }[] {
    return [
      { value: 'PENDING', label: 'Pending', color: 'text-yellow-800', bgColor: 'bg-yellow-100' },
      { value: 'APPROVED', label: 'Approved', color: 'text-green-800', bgColor: 'bg-green-100' },
      { value: 'REJECTED', label: 'Rejected', color: 'text-red-800', bgColor: 'bg-red-100' },
      { value: 'VOID', label: 'Void', color: 'text-gray-800', bgColor: 'bg-gray-100' }
    ];
  }

  getNCOATypes(): { value: string; label: string }[] {
    return [
      { value: 'ASSET', label: 'Asset' },
      { value: 'LIABILITY', label: 'Liability' },
      { value: 'INCOME', label: 'Income' },
      { value: 'EXPENSE', label: 'Expense' }
    ];
  }

  getPayeeTypes(): { value: string; label: string }[] {
    return [
      { value: 'EMPLOYEE', label: 'Employee' },
      { value: 'COMPANY', label: 'Company' },
      { value: 'BANK', label: 'Bank' },
      { value: 'GOVERNMENT', label: 'Government' },
      { value: 'OTHER', label: 'Other' }
    ];
  }
}
