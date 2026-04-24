import { Component } from '@angular/core';
import {Etransactions} from "../../ExpenseAccounts/etransactions/etransactions";

@Component({
  selector: 'app-stransactions',
    imports: [
        Etransactions
    ],
  templateUrl: './stransactions.html',
  styleUrl: './stransactions.scss',
})
export class Stransactions {

}
