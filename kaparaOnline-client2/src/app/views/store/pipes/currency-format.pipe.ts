import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'currencyFormatHeIl'
})
export class HeIlCurrencyFormatPipe implements PipeTransform {
    transform(value: number,
        args?: any,
        currencySign: string = '₪',
        decimalLength: number = 2,
        chunkDelimiter: string = '.',
        decimalDelimiter: string = ',',
        chunkLength: number = 3): string {
        if (typeof value == 'string')
            value = parseFloat(value);
        let result = '\\d(?=(\\d{' + chunkLength + '})+' + (decimalLength > 0 ? '\\D' : '$') + ')';
        let num = value.toFixed(Math.max(0, ~~decimalLength));
        if (args == 'no') {
            if (!(value.toString().indexOf('.') !== -1))
                return value.toString();
            return (decimalDelimiter ? num.replace(',', chunkDelimiter) : num).replace(new RegExp(result, 'g'), '$&');
        };
        return (decimalDelimiter ? num.replace(',', chunkDelimiter) : num).replace(new RegExp(result, 'g'), '$&' + decimalDelimiter) + ' ' + currencySign;
    }
}
