import { Component } from '@angular/core';
import {ErecieptLedger} from "../../ExpenseAccounts/ereciept-ledger/ereciept-ledger";

@Component({
  selector: 'app-preciept-ledger',
    imports: [
        ErecieptLedger
    ],
  templateUrl: './preciept-ledger.html',
  styleUrl: './preciept-ledger.scss',
})
export class PrecieptLedger {

}
