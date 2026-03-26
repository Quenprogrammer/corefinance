// src/app/shared/pipes/currency.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currency',
  standalone: true
})
export class CurrencyPipe implements PipeTransform {
  transform(value: number | null | undefined, showSymbol: boolean = true, showDecimals: boolean = true): string {
    if (value === null || value === undefined) {
      return showSymbol ? '₦0.00' : '0.00';
    }

    const formattedNumber = this.formatNumber(value, showDecimals);

    if (showSymbol) {
      return `₦${formattedNumber}`;
    }

    return formattedNumber;
  }

  private formatNumber(value: number, showDecimals: boolean): string {
    const options: Intl.NumberFormatOptions = {
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0
    };

    return new Intl.NumberFormat('en-NG', options).format(value);
  }
}
