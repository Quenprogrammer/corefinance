import { Component } from '@angular/core';
import {Eaddtransactions} from "../../ExpenseAccounts/eaddtransactions/eaddtransactions";
import {Emonthlyanalysis} from '../../ExpenseAccounts/emonthlyanalysis/emonthlyanalysis';

@Component({
  selector: 'app-imonthlyanalysis',
  imports: [
    Eaddtransactions,
    Emonthlyanalysis
  ],
  templateUrl: './imonthlyanalysis.html',
  styleUrl: './imonthlyanalysis.scss',
})
export class Imonthlyanalysis {

}
