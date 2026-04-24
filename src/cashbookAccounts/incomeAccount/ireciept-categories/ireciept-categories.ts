import { Component } from '@angular/core';
import {Epaymentcategories} from '../../ExpenseAccounts/epaymentcategories/epaymentcategories';
import {ErecieptCategories} from '../../ExpenseAccounts/ereciept-categories/ereciept-categories';

@Component({
  selector: 'app-ireciept-categories',
  imports: [
    Epaymentcategories,
    ErecieptCategories
  ],
  templateUrl: './ireciept-categories.html',
  styleUrl: './ireciept-categories.scss',
})
export class IrecieptCategories {

}
