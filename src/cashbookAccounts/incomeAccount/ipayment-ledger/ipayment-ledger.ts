import { Component } from '@angular/core';
import {Eaddtransactions} from "../../ExpenseAccounts/eaddtransactions/eaddtransactions";
import {EpaymentLedger} from '../../ExpenseAccounts/epayment-ledger/epayment-ledger';

@Component({
  selector: 'app-ipayment-ledger',
  imports: [
    Eaddtransactions,
    EpaymentLedger
  ],
  templateUrl: './ipayment-ledger.html',
  styleUrl: './ipayment-ledger.scss',
})
export class IpaymentLedger {

}
