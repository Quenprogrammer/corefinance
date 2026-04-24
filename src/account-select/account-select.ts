import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';
import {DecimalPipe, NgIf} from '@angular/common';
import {LoadingSpinnerComponent} from '../app/core/shared/components/loading-spinner/loading-spinner';
import {MenubarComponent} from '../services/menubar/menubar.component';
import {  inject, OnInit } from '@angular/core';
import { Firestore, collection, getCountFromServer } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-account-select',
  imports: [
    RouterLink,
    DecimalPipe,
    LoadingSpinnerComponent,
    NgIf,
    MenubarComponent
  ],
  templateUrl: './account-select.html',
  styleUrl: './account-select.scss',
})
export class AccountSelect {

  private firestore = inject(Firestore);

  // Store counts for each collection
  counts = {
    savings: 0,
    personal: 0,
    income: 0,
    expense: 0,
    cashbook: 0
  };

  loading = false;
  error: string | null = null;

  // Calculate total documents across all collections
  get totalDocuments(): number {
    return this.counts.savings + this.counts.personal +
      this.counts.income + this.counts.expense +
      this.counts.cashbook;
  }

  // Get percentage for progress bar
  getPercentage(collectionName: string): string {
    const count = this.counts[collectionName as keyof typeof this.counts];
    if (this.totalDocuments === 0) return '0%';
    const percentage = (count / this.totalDocuments) * 100;
    return `${Math.round(percentage)}%`;
  }

  ngOnInit() {
    this.getAllCounts();
  }

  // Get count for a single collection
  async getCount(collectionName: string): Promise<number> {
    try {
      const collectionRef = collection(this.firestore, collectionName);
      const snapshot = await getCountFromServer(collectionRef);
      return snapshot.data().count;
    } catch (error) {
      console.error(`Error counting ${collectionName}:`, error);
      return 0;
    }
  }

  // Get counts for all collections
  async getAllCounts() {
    this.loading = true;
    this.error = null;

    try {
      // Get all counts in parallel
      const [savings, personal, income, expense, cashbook] = await Promise.all([
        this.getCount('savings'),
        this.getCount('personal'),
        this.getCount('income'),
        this.getCount('expense'),
        this.getCount('cashbook_entries')
      ]);

      // Update counts
      this.counts = {
        savings,
        personal,
        income,
        expense,
        cashbook
      };

      console.log('Collection counts:', this.counts);
      console.log('Total documents:', this.totalDocuments);
    } catch (error) {
      this.error = 'Failed to load collection statistics';
      console.error('Error loading counts:', error);
    } finally {
      this.loading = false;
    }
  }

  // Optional: Refresh counts manually
  refreshCounts() {
    this.getAllCounts();
  }











  menu=[
    {icon:"cashbook/pie-chart-finances-svgrepo-com.svg", name:"Default Cashbook", link:"/menu"},
    {icon:"cashbook/personal-mail-svgrepo-com.svg", name:"Personal Account", link:"/pdashboard"},

    {icon:"cashbook/rich-poor-svgrepo-com.svg", name:"Income Account", link:"/idashboard"},


    {icon:"cashbook/money-svgrepo-com.svg", name:"Expenses Account", link:"/edashboard"},



    {icon:"cashbook/savings-box-svgrepo-com.svg", name:"Savings Account",link:"/sdashboard" },


      ]
}
