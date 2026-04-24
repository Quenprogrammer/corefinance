import { Component } from '@angular/core';
import {EpaymentLedger} from "../../ExpenseAccounts/epayment-ledger/epayment-ledger";

@Component({
  selector: 'app-ppayment-ledger',
    imports: [
        EpaymentLedger
    ],
  templateUrl: './ppayment-ledger.html',
  styleUrl: './ppayment-ledger.scss',
})
export class PpaymentLedger {

}
