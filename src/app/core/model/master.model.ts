// src/app/core/models/master.model.ts
import { Timestamp } from '@angular/fire/firestore';

export interface Payee {
  id?: string;
  name: string;
  code: string;
  type: 'EMPLOYEE' | 'COMPANY' | 'BANK' | 'OTHER';
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface NCOACode {
  id?: string;
  code: string;
  name: string;
  type: 'ASSET' | 'LIABILITY' | 'INCOME' | 'EXPENSE';
  category: string;
  description?: string;
  isActive: boolean;
}

export interface BankAccount {
  id?: string;
  name: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  branch: string;
  isActive: boolean;
  openingBalance: number;
  currentBalance: number;
}

export interface Counter {
  id: string;
  value: number;
}
