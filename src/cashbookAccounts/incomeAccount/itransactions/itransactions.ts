import { Component } from '@angular/core';
import {Eaddtransactions} from '../../ExpenseAccounts/eaddtransactions/eaddtransactions';
import {Etransactions} from '../../ExpenseAccounts/etransactions/etransactions';

@Component({
  selector: 'app-itransactions',
  imports: [
    Eaddtransactions,
    Etransactions
  ],
  templateUrl: './itransactions.html',
  styleUrl: './itransactions.scss',
})
export class Itransactions {

}
