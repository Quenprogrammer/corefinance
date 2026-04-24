import { Component } from '@angular/core';
import {Etransactions} from "../../ExpenseAccounts/etransactions/etransactions";

@Component({
  selector: 'app-ptransactions',
    imports: [
        Etransactions
    ],
  templateUrl: './ptransactions.html',
  styleUrl: './ptransactions.scss',
})
export class Ptransactions {

}
