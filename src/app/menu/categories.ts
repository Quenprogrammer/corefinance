import { Component } from '@angular/core';
import {CategoryAnalysisComponent} from '../admin/category-analysis/category-analysis';

@Component({
  selector: 'app-categories',
  imports: [
    CategoryAnalysisComponent
  ],
  template: `
    <div class="px-1">
    <app-category-analysis
      [transactionType]="'receipt'"
      title="Receipt Analysis by Category">
    </app-category-analysis>


    </div>
  `,
  styles: [`

  `]
})
export class Categories {

}
