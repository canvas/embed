import isEmpty from 'lodash/isEmpty';
import { SelectOption } from '../components/MultiSelectInput';
import { DateTime } from 'luxon';
import { Format } from '../__rust_generated__/Format';
import { SqlType } from '../__rust_generated__/SqlType';

export function buildUrl(url: string, params: Record<string, string>): string {
    if (isEmpty(params)) return url;
    const queryString = new URLSearchParams(params);
    return `${url}?${queryString.toString()}`;
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

function _formatCell(
    value: string,
    format: Format | null | undefined,
    sqlType: SqlType | null | undefined,
    timezone: string | null,
): string {
    if (!value) {
        return value;
    }
    if (sqlType === 'DateTimeTz') {
        const dateTime = parseDateTimeTz(value);
        if (dateTime.isValid) {
            if (timezone) {
                return dateTime.setZone(timezone).toLocaleString(DateTime.DATETIME_MED);
            } else {
                return dateTime.toLocaleString(DateTime.DATETIME_MED);
            }
        }
    }
    if (sqlType === 'DateTimeNtz') {
        const dateTime = parseDateTimeNtz(value);
        if (dateTime.isValid) {
            if (timezone) {
                return dateTime.setZone(timezone).toLocaleString(DateTime.DATETIME_MED);
            } else {
                return dateTime.toLocaleString(DateTime.DATETIME_MED);
            }
        }
    }

    if (!format) {
        if (sqlType === 'Number') {
            return Intl.NumberFormat(undefined, {
                minimumFractionDigits: undefined,
                maximumFractionDigits: 2,
            }).format(Number(value));
        } else {
            return value;
        }
    }
    switch (format.type) {
        case 'Money':
            return Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(Number(value));
        case 'Money_v2':
            return Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: format.precision,
                maximumFractionDigits: format.precision,
            }).format(Number(value));
        case 'Percent':
            return Intl.NumberFormat(undefined, {
                style: 'percent',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(Number(value));
        case 'Percent_v2':
            return Intl.NumberFormat(undefined, {
                style: 'percent',
                minimumFractionDigits: format.precision,
                maximumFractionDigits: format.precision,
            }).format(Number(value));
        case 'Number':
            return Intl.NumberFormat(undefined, {
                minimumFractionDigits: format.precision,
                maximumFractionDigits: format.precision,
            }).format(Number(value));
        case 'Automatic':
        case 'PlainText':
        default:
            return value;
    }
}

export function formatCell(
    value: string,
    format: Format | null | undefined,
    sqlType: SqlType | null | undefined,
    timezone: string | null,
): string {
    const key = `${value}-${JSON.stringify(format)}-${sqlType}`;
    const cached = formattedCache.get(key);
    if (cached) {
        return cached;
    }
    const calculated = _formatCell(value, format, sqlType, timezone);
    formattedCache.set(key, calculated);
    return calculated;
}

const formattedCache: Map<string, string> = new Map();

function parseDateTimeNtz(value: string): DateTime {
    const noMillisParse = DateTime.fromFormat(value, 'yyyy-MM-dd HH:mm:ss', {
        zone: 'UTC',
    });
    if (noMillisParse.isValid) return noMillisParse;
    const bigQueryParse = DateTime.fromFormat(value, "yyyy-MM-dd'T'HH:mm:ss", {
        zone: 'UTC',
    });
    if (bigQueryParse.isValid) return bigQueryParse;
    const bigQueryMillisParse = DateTime.fromFormat(value, "yyyy-MM-dd'T'HH:mm:ss.u", { zone: 'UTC' });
    if (bigQueryMillisParse.isValid) return bigQueryParse;
    const parse = DateTime.fromFormat(value, 'yyyy-MM-dd HH:mm:ss.SSS', {
        zone: 'UTC',
    });
    return parse;
}

export function parseDateTimeTz(value: string): DateTime {
    const postgresParse = DateTime.fromFormat(value, 'yyyy-MM-dd HH:mm:ssZZ', {
        zone: 'UTC',
    });
    if (postgresParse.isValid) return postgresParse;
    const bigQueryParse = DateTime.fromFormat(value, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", { zone: 'UTC' });
    if (bigQueryParse.isValid) return bigQueryParse;
    const parse = DateTime.fromFormat(value, 'yyyy-MM-dd HH:mm:ss.SSS ZZZ', {
        zone: 'UTC',
    });
    return parse;
}
