import isEmpty from 'lodash/isEmpty';
import { SelectOption } from './components/MultiSelectInput';

export function buildUrl(url: string, params: Record<string, string>): string {
    if (isEmpty(params)) return url;

    const queryString = Object.keys(params)
        .map((key) => `${key}=${params[key]}`)
        .join('&');
    return `${url}?${queryString}`;
}

export function convertFilterParams(obj: Record<string, SelectOption[]>): Record<string, string> {
    const newObj = {};
    Object.entries(obj).forEach(([key, value]) => {
        const newKey = key.startsWith('$') ? key.slice(1) : key;
        const newValue = value.map((v) => v.value);
        newObj[newKey] = newValue;
    });
    return newObj;
}

// https://stackoverflow.com/a/24457420/3494595
export function isNumeric(value: string): boolean {
    return /^-?\d+$/.test(value);
}
