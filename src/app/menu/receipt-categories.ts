import { Component } from '@angular/core';
import {CategoryTransactionsDetailComponent} from '../admin/category-transactions-detail/category-transactions-detail';

@Component({
  selector: 'app-receipt-categories',
  imports: [
    CategoryTransactionsDetailComponent
  ],
  template: `
    <app-category-transactions-detail
      [transactionType]="'receipt'"
      [title]="'Receipt Categories - All Transactions'"
      [year]="selectedYear">
    </app-category-transactions-detail>
  `,
  styles: [`

  `]
})
export class ReceiptCategories {
  selectedYear = new Date().getFullYear();
}
