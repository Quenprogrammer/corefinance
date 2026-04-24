import { Component } from '@angular/core';
import {Eaddtransactions} from "../../ExpenseAccounts/eaddtransactions/eaddtransactions";
import {ErecieptCategories} from '../../ExpenseAccounts/ereciept-categories/ereciept-categories';
import {ErecieptLedger} from '../../ExpenseAccounts/ereciept-ledger/ereciept-ledger';

@Component({
  selector: 'app-ireciept-ledger',
  imports: [
    Eaddtransactions,
    ErecieptCategories,
    ErecieptLedger
  ],
  templateUrl: './ireciept-ledger.html',
  styleUrl: './ireciept-ledger.scss',
})
export class IrecieptLedger {

}
