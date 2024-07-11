import React from 'react';
import { SqlType } from './__rust_generated__/SqlType';
import { Format } from './__rust_generated__/Format';
import { DateTime } from 'luxon';
import { DownloadIcon, SortDown, SortUp } from './icons';
import useCanvasState from './state/useCanvasState';
import { formatCell } from './util/util';

type Props = {
    storeId: string;
    data: string[][];
    columns: {
        header: string;
        type: SqlType | null;
        format: Format | null;
        columnId: string;
    }[];
    rowCount: number;
    title?: string;
    download?: () => void;
};
export function Table(props: Props) {
    const { data, columns, rowCount, title, download, storeId } = props;
    const { sorts, updateSort } = useCanvasState();
    const tableSort = sorts[storeId];

    return (
        <div className="max-w-full">
            <div className="mb-2 text-base font-medium">{title}</div>
            <div className="border border-[#ccc] rounded-md max-w-full">
                <div className="overflow-y-auto max-h-[75vh] max-w-full overflow-x-auto rounded-t-md">
                    <table className="relative max-w-screen border-separate border-spacing-0">
                        <thead>
                            <tr>
                                {columns.map((column, index) => {
                                    const { columnId, header } = column;
                                    const columnSort = tableSort?.columnId === columnId ? tableSort.order : null;
                                    return (
                                        <th
                                            key={index}
                                            className="font-medium text-[#444] px-4 py-2 sticky top-0 bg-white border-b border-b-[#ccc] cursor-pointer"
                                            onClick={() => {
                                                if (columnSort === 'Ascending') {
                                                    updateSort(storeId, { columnId, order: 'Descending' });
                                                } else {
                                                    updateSort(storeId, { columnId, order: 'Ascending' });
                                                }
                                            }}
                                        >
                                            <div className="flex justify-between items-center">
                                                {header}
                                                {columnSort == 'Ascending' ? (
                                                    <SortUp className="w-4 h-4" />
                                                ) : columnSort === 'Descending' ? (
                                                    <SortDown className="w-4 h-4" />
                                                ) : (
                                                    <div className="w-4 h-4"></div>
                                                )}
                                            </div>
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
