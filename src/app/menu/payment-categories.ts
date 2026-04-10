import { Component } from '@angular/core';
import {CategoryTransactionsDetailComponent} from '../admin/category-transactions-detail/category-transactions-detail';

@Component({
  selector: 'app-payment-categories',
  imports: [
    CategoryTransactionsDetailComponent
  ],
  template: `
    <app-category-transactions-detail
      [transactionType]="'payment'"
      [title]="'Payment Categories - All Transactions'"
      [year]="selectedYear">
    </app-category-transactions-detail>
  `,
  styles: [`

  `]
})
export class PaymentCategories {
  selectedYear = new Date().getFullYear();
}
