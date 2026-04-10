import { Component } from '@angular/core';
import {CategoryAnalysisComponent} from '../admin/category-analysis/category-analysis';

@Component({
  selector: 'app-ledger2',
  imports: [
    CategoryAnalysisComponent

  ],
  template: `
    <div class="px-1">


    <app-category-analysis
      [transactionType]="'payment'"
      title="Payment Analysis by Category">
    </app-category-analysis>
    </div>
  `,
  styles: [`

  `]
})
export class Ledger2 {

}
