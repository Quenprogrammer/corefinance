// src/app/core/services/master-data.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable, map, catchError, of, throwError } from 'rxjs'; // Add catchError, of, throwError
import { FirebaseService } from './firebase.service';
import { Payee, NCOACode, BankAccount, Department, Budget } from '../model/master.model';
import { Timestamp } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class MasterDataService {
  private firebaseService = inject(FirebaseService);

  // ==================== PAYEE OPERATIONS ====================

  getPayees(): Observable<Payee[]> {
    // Try with server-side sorting first
    return (this.firebaseService.getCollectionWithQuery(
      'payees', 'isActive', '==', true, 'name', 'asc'
    ) as Observable<Payee[]>).pipe(
      catchError((error) => {
        // If index missing, fallback to client-side sorting
        if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
          console.warn('⚠️ Payees index missing, using client-side sorting');
          return (this.firebaseService.getCollectionWithQuery(
            'payees', 'isActive', '==', true
          ) as Observable<Payee[]>).pipe(
            map(payees => payees.sort((a, b) => a.name.localeCompare(b.name)))
          );
        }
        return throwError(() => error);
      })
    );
  }

  getAllPayees(): Observable<Payee[]> {
    return (this.firebaseService.getCollection('payees') as Observable<Payee[]>).pipe(
      map(payees => payees.filter(p => p.isActive))
    );
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
    return (this.firebaseService.getCollectionWithQuery(
      'ncoaCodes', 'isActive', '==', true, 'code', 'asc'
    ) as Observable<NCOACode[]>).pipe(
      catchError((error) => {
        if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
          console.warn('⚠️ NCOA codes index missing, using client-side sorting');
          return (this.firebaseService.getCollectionWithQuery(
            'ncoaCodes', 'isActive', '==', true
          ) as Observable<NCOACode[]>).pipe(
            map(codes => codes.sort((a, b) => a.code.localeCompare(b.code)))
          );
        }
        return throwError(() => error);
      })
    );
  }

  getNCOACodesByCategory(category: string): Observable<NCOACode[]> {
    // This query only uses where, no orderBy - doesn't need composite index
    return (this.firebaseService.getCollectionWithQuery(
      'ncoaCodes', 'category', '==', category
    ) as Observable<NCOACode[]>).pipe(
      map(codes => codes.filter(c => c.isActive).sort((a, b) => a.code.localeCompare(b.code)))
    );
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
    return (this.firebaseService.getCollectionWithQuery(
      'bankAccounts', 'isActive', '==', true, 'name', 'asc'
    ) as Observable<BankAccount[]>).pipe(
      catchError((error) => {
        if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
          console.warn('⚠️ Bank accounts index missing, using client-side sorting');
          return (this.firebaseService.getCollectionWithQuery(
            'bankAccounts', 'isActive', '==', true
          ) as Observable<BankAccount[]>).pipe(
            map(accounts => accounts.sort((a, b) => a.name.localeCompare(b.name)))
          );
        }
        return throwError(() => error);
      })
    );
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
    try {
      const account = await this.firebaseService.getDocumentSnapshot('bankAccounts', id);
      const currentBalance = account?.get('currentBalance') || 0;
      const newBalance = isAddition ? currentBalance + amount : currentBalance - amount;

      await this.firebaseService.updateDocument('bankAccounts', id, {
        currentBalance: newBalance,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating bank balance:', error);
      throw error;
    }
  }

  // ==================== DEPARTMENT OPERATIONS ====================

  getDepartments(): Observable<Department[]> {
    return (this.firebaseService.getCollectionWithQuery(
      'departments', 'isActive', '==', true, 'name', 'asc'
    ) as Observable<Department[]>).pipe(
      catchError((error) => {
        if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
          console.warn('⚠️ Departments index missing, using client-side sorting');
          return (this.firebaseService.getCollectionWithQuery(
            'departments', 'isActive', '==', true
          ) as Observable<Department[]>).pipe(
            map(depts => depts.sort((a, b) => a.name.localeCompare(b.name)))
          );
        }
        return throwError(() => error);
      })
    );
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
    // This query only uses where, no orderBy - doesn't need composite index
    return this.firebaseService.getCollectionWithQuery(
      'budgets', 'year', '==', year
    ) as Observable<Budget[]>;
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
