import React from 'react';
import { SqlType } from './__rust_generated__/SqlType';
import { Format } from './__rust_generated__/Format';
import { DateTime } from 'luxon';
import { DownloadIcon } from './icons';

type Props = {
    data: string[][];
    columns: {
        header: string;
        type: SqlType | null;
        format: Format | null;
    }[];
    rowCount: number;
    title?: string;
    download?: () => void;
};
export function Table(props: Props) {
    const { data, columns, rowCount, title, download } = props;

    return (
        <div className="max-w-full">
            <div className="mb-2 text-base font-medium">{title}</div>
            <div className="border border-[#ccc] rounded-md max-w-full">
                <div className="overflow-y-auto max-h-[75vh] max-w-full overflow-x-auto rounded-t-md">
                    <table className="relative max-w-screen border-separate border-spacing-0">
                        <thead>
                            <tr>
                                {columns.map((column, index) => {
                                    return (
                                        <th
                                            key={index}
                                            className="font-medium text-[#444] px-4 py-2 sticky top-0 bg-white border-b border-b-[#ccc]"
                                        >
                                            {column.header}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody className="[&>tr:last-child>td]:border-b-0">
                            {Array(rowCount)
                                .fill(null)
                                .map((_, rowIndex) => {
                                    return (
                                        <tr key={rowIndex} className="hover:bg-[#f8f8f8]">
                                            {columns.map((column, columnIndex) => {
                                                const align = textAlign(column.type);

                                                const formatted = formatCell(
                                                    data[columnIndex]![rowIndex]!,
                                                    column.format,
                                                    column.type,
                                                    null,
                                                );
                                                return (
                                                    <td
                                                        key={columnIndex}
                                                        className={`px-4 py-1 truncate tabular-nums border-b border-b-[#ddd] ${align}`}
                                                    >
                                                        {formatted}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
                {download ? (
                    <div className="flex justify-end text-[#666] py-0.5 px-3 border-t border-t-[#ccc] ">
                        <div className="p-1 hover:bg-[#f8f8f8] cursor-pointer" onClick={download}>
                            <DownloadIcon className="w-4 h-4" />
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function textAlign(type: SqlType | null) {
    switch (type) {
        case 'Number':
        case 'Date':
        case 'DateTime':
        case 'DateTimeNtz':
        case 'DateTimeTz':
            return 'text-right';

        default:
            return 'text-left';
    }
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

function formatCell(
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
