import { Component } from '@angular/core';
import {MonthlyReportComponent} from '../admin/monthly-report/monthly-report';
import {CategoryAnalysisComponent} from '../admin/category-analysis/category-analysis';

@Component({
  selector: 'app-monthly-analysis',
  imports: [
    MonthlyReportComponent,
    CategoryAnalysisComponent
  ],
  template: `
    <div class="px-1">
    <app-monthly-report [year]="selectedYear"></app-monthly-report>
    </div>

  `,
  styles: [`

  `]
})
export class MonthlyAnalysis {
  selectedYear = new Date().getFullYear();
}
