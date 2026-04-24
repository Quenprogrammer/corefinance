import { Component } from '@angular/core';
import {Epaymentcategories} from "../../ExpenseAccounts/epaymentcategories/epaymentcategories";

@Component({
  selector: 'app-paymentcategories',
    imports: [
        Epaymentcategories
    ],
  templateUrl: './paymentcategories.html',
  styleUrl: './paymentcategories.scss',
})
export class Paymentcategories {

}
