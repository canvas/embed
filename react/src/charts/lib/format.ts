import { Ordinal } from './types';

export type ValueFormat = { type: 'decimal' } | { type: 'currency'; currency: string } | { type: 'percent' };

export function formatValue(value: Ordinal, format: ValueFormat = { type: 'decimal' }): string {
    if (value instanceof Date) {
        return Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(value);
    }

    if (typeof value === 'string') {
        return value;
    }

    switch (format.type) {
        case 'decimal':
            return Intl.NumberFormat(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 1,
                notation: 'compact',
            }).format(value);
        case 'currency':
            return Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: format.currency,
                notation: 'compact',
            }).format(value);
        case 'percent':
            return Intl.NumberFormat(undefined, { style: 'percent' }).format(value);
    }
}
