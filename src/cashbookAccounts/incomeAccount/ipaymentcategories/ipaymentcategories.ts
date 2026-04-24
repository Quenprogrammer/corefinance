import { Component } from '@angular/core';
import {Eaddtransactions} from "../../ExpenseAccounts/eaddtransactions/eaddtransactions";
import {Epaymentcategories} from '../../ExpenseAccounts/epaymentcategories/epaymentcategories';

@Component({
  selector: 'app-ipaymentcategories',
  imports: [
    Eaddtransactions,
    Epaymentcategories
  ],
  templateUrl: './ipaymentcategories.html',
  styleUrl: './ipaymentcategories.scss',
})
export class Ipaymentcategories {

}
