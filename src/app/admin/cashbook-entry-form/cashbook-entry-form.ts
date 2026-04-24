import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CashbookService } from '../../core/services/cashbook.service';
import { CashbookEntry, TransactionType, ReceiptCategory, PaymentCategory } from '../../core/model/cashbook.model';
import {Eaddtransactions} from '../../../cashbookAccounts/ExpenseAccounts/eaddtransactions/eaddtransactions';

@Component({
  selector: 'app-cashbook-entry-form',
  standalone: true,
  imports: [CommonModule, FormsModule, Eaddtransactions],
  template: `
    <app-eaddtransactions [collectionData]="'cashbook_entries'"></app-eaddtransactions>
  `,

})
export class CashbookEntryFormComponent {

}
