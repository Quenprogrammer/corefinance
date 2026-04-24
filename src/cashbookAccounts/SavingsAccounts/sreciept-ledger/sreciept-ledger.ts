import { Component } from '@angular/core';
import {ErecieptLedger} from "../../ExpenseAccounts/ereciept-ledger/ereciept-ledger";

@Component({
  selector: 'app-sreciept-ledger',
    imports: [
        ErecieptLedger
    ],
  templateUrl: './sreciept-ledger.html',
  styleUrl: './sreciept-ledger.scss',
})
export class SrecieptLedger {

}
