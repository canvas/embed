/* eslint-disable @typescript-eslint/no-non-null-assertion */
// todo(wpride): nouncheckedindexedaccess
import '../styles/spreadsheet.less';

import React, { createContext, memo, useContext } from 'react';
import { areEqual, GridChildComponentProps, GridOnScrollProps, VariableSizeGrid } from 'react-window';
import { VariableSizeGrid as Grid } from 'react-window';
// import { RightClickMenu, RightClickMenuType } from '../dropdown/RightClickMenu';
import _ from 'lodash';
// import { usePrevious } from '../../v1/util/UtilUtils';
import AutoSizer from 'react-virtualized-auto-sizer';
// import { formatCell, isCohortStore } from '../../util/StoreUtil';
import percentile from 'percentile';
import { DateTime } from 'luxon';
import { getTypeIcon } from './icons/ColumnTypeUtil';
import { CanvasStoreMetaData } from './rust_types/CanvasStoreMetaData';
import { CanvasStoreColumnMetaData } from './rust_types/CanvasStoreColumnMetaData';
import { SqlType } from './rust_types/SqlType';
import { Format } from './rust_types/Format';
import { StoreType } from './rust_types/StoreType';

type RowSelectionArea = { startRow: number; endRow: number };
type ColumnSelectionArea = { startColumn: number; endColumn: number };
type CellSelectionArea = RowSelectionArea & ColumnSelectionArea;

type SelectionArea =
    | { type: 'element' }
    | ({ type: 'columns'; columnIds: string[] } & ColumnSelectionArea)
    | ({ type: 'rows' } & RowSelectionArea)
    | ({
          type: 'cells';
          columnIds: string[];
          selectedCellValue: string | null;
      } & CellSelectionArea);

export type DataStore = {
    data: string[][];
    rowCount: number;
    columnCount: number;
    metaData: CanvasStoreMetaData;
    storeId: string;
    // this is a stupid hack, but we need a way to force a re-render when the data changes
    // even if the metadata has not changed. For example you sort and now the larger values
    // are at the top.
    dataHash: string;
};

const W_WIDTH = 8;
const GUTTER_WIDTH = W_WIDTH * 5;
const GUTTER_COLOR = 'rgba(var(--colors-highlight), 0.5)';
const CELL_BORDER_HIDDEN = '1px solid transparent';
const CELL_BORDER = '1px solid rgb(var(--colors-divider))';
const SELECTED_CELL_BACKGROUND = 'rgba(var(--colors-highlight), 0.5)';
const SELECTED_CELL_BORDER = `1px solid rgb(var(--colors-border))`;
const HIGHLIGHTED_LABEL_BACKGROUND_COLOR = 'rgb(var(--colors-highlight))';
const SELECTED_LABEL_BACKGROUND_COLOR = 'rgb(var(--colors-inactive))';
const SELECTED_LABEL_BORDER = `1px solid rgb(var(--colors-inactive))`;

const ROW_HEIGHT = 28;
const SPREADSHEET_HEIGHT = 342;

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
        return value;
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

function buildHtml(data: string[][]): string {
    const rows = data.map((row) => {
        const columns = row.map((col) => `<td>${col}</td>`);
        return `<tr>${columns.join('')}</tr>`;
    });
    return `
        <table>
            ${rows.join('\n')}
        </table>
        `;
}
function handleCopy(data: string[][]): void {
    const textData = data.map((row) => row.join(',')).join('\n');
    const htmlData = buildHtml(data);
    const clipboardItem = new ClipboardItem({
        'text/html': new Blob([htmlData], { type: 'text/html' }),
        'text/plain': new Blob([textData], { type: 'text/plain' }),
    });
    navigator.clipboard.write([clipboardItem]);
}

function getCopyData(selectionArea: SelectionArea, headers: string[], dataStore: DataStore) {
    switch (selectionArea.type) {
        case 'cells':
            const { startColumn, startRow, endColumn, endRow } = selectionArea;
            const data: string[][] = [];
            for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
                const row: string[] = [];
                for (let columnIndex = startColumn; columnIndex <= endColumn; columnIndex++) {
                    if (rowIndex === -1) {
                        row.push(headers[columnIndex]!);
                    } else {
                        row.push(dataStore.data[columnIndex]![rowIndex]!);
                    }
                }
                data.push(row);
            }
            return data;
        case 'columns':
            const { startColumn: cStartColumn, endColumn: cEndColumn } = selectionArea;
            const cData: string[][] = [];
            for (let rowIndex = -1; rowIndex < dataStore.rowCount; rowIndex++) {
                const row: string[] = [];
                for (let columnIndex = cStartColumn; columnIndex <= cEndColumn; columnIndex++) {
                    if (rowIndex === -1) {
                        row.push(headers[columnIndex]!);
                    } else {
                        row.push(dataStore.data[columnIndex]![rowIndex]!);
                    }
                }
                cData.push(row);
            }
            return cData;
        case 'rows':
            const { startRow: rStartRow, endRow: rEndRow } = selectionArea;
            const rData: string[][] = [];
            for (let rowIndex = rStartRow; rowIndex <= rEndRow; rowIndex++) {
                const row: string[] = [];
                for (let columnIndex = 0; columnIndex < dataStore.columnCount; columnIndex++) {
                    if (rowIndex === -1) {
                        row.push(headers[columnIndex]!);
                    } else {
                        row.push(dataStore.data[columnIndex]![rowIndex]!);
                    }
                }
                rData.push(row);
            }
            return rData;
        default:
            return null;
    }
}

function numberToLetters(num: number): string {
    let letters = '';
    while (num >= 0) {
        letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[num % 26] + letters;
        num = Math.floor(num / 26) - 1;
    }
    return letters;
}

const cellStyle: React.CSSProperties = {
    borderLeft: CELL_BORDER_HIDDEN,
    borderTop: CELL_BORDER_HIDDEN,
    borderBottom: CELL_BORDER,
    borderRight: CELL_BORDER,
    fontFamily: 'proxima-nova',
    fontStyle: 'normal',
    fontWeight: 400,
    fontSize: '12px',
    lineHeight: '18px',
    verticalAlign: 'center',
    overflow: 'hidden',
    whiteSpace: 'nowrap' as const,
    textOverflow: 'ellipsis',
    padding: '4px 8px',
    userSelect: 'none',
};

function backgroundClass(colorIndex: number | null) {
    switch (colorIndex) {
        case 1:
            return `bg-cohort/20 hover:bg-cohort/10`;
        case 2:
            return `bg-cohort/40 hover:bg-cohort/30`;
        case 3:
            return `bg-cohort/60 hover:bg-cohort/50`;
        case 4:
            return `bg-cohort/80 hover:bg-cohort/70`;
        case 5:
            return `bg-cohort hover:bg-cohort/90`;
        default:
            return 'dark:bg-background hover:bg-highlight/50';
    }
}

type HeaderCellItemData = {
    headers: string[];
    columnCount: number;
    rowCount: number;
    selectionArea: SelectionArea | null;
    onMouseDown: (columnIndex: number) => void;
    onMouseUp: () => void;
    onMouseEnter: (columnIndex: number) => void;
    columnTypes: (SqlType | null)[];
};
type HeaderCellProps = GridChildComponentProps<HeaderCellItemData>;
const HeaderCell = ({ columnIndex, style, data: itemData }: HeaderCellProps) => {
    const spreadsheetSize = useContext(SpreadsheetSizeContext);
    const { headers, selectionArea, onMouseDown, onMouseUp, onMouseEnter, columnCount, rowCount, columnTypes } =
        itemData;
    const selectedStyle = cellSelected(columnIndex, -1, selectionArea, columnCount, rowCount);
    const lastColumnStyle = spreadsheetSize.fullWidth && columnIndex == columnCount - 1 ? { borderRight: 'none' } : {};

    const columnType = columnTypes[columnIndex];

    let icon;

    if (columnType) {
        const TypeIcon = getTypeIcon(columnType);
        icon = <TypeIcon className="h-3 w-3" />;
    } else {
        icon = <div className="h-3 w-3" />;
    }

    return (
        <div
            key={`header${columnIndex}`}
            style={{
                ...cellStyle,
                ...style,
                ...selectedStyle,
                ...lastColumnStyle,
                fontWeight: 'bold',
                padding: 0,
            }}
            className="relative"
        >
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">{icon}</div>
            <input
                className="h-full w-full bg-transparent py-1 pl-6 pr-2"
                onMouseDown={() => {
                    onMouseDown(columnIndex);
                }}
                onMouseUp={() => {
                    onMouseUp();
                }}
                onMouseEnter={() => onMouseEnter(columnIndex)}
                value={headers[columnIndex]}
            />
        </div>
    );
};
type Contains = { start: boolean; end: boolean };
const containsRow = (rowIndex: number, selectionArea: RowSelectionArea): Contains | undefined => {
    if (rowIndex >= selectionArea.startRow && rowIndex <= selectionArea.endRow) {
        return {
            start: rowIndex === selectionArea.startRow,
            end: rowIndex === selectionArea.endRow,
        };
    }
};
const containsColumn = (columnIndex: number, selectionArea: ColumnSelectionArea): Contains | undefined => {
    if (columnIndex >= selectionArea.startColumn && columnIndex <= selectionArea.endColumn) {
        return {
            start: columnIndex === selectionArea.startColumn,
            end: columnIndex === selectionArea.endColumn,
        };
    }
};

const cellSelected = (
    columnIndex: number,
    rowIndex: number,
    selectionArea: SelectionArea | null,
    columnCount: number,
    rowCount: number,
): React.CSSProperties => {
    const defaultStyle = {};
    if (!selectionArea) return defaultStyle;

    switch (selectionArea.type) {
        case 'cells':
            const [row, column] = [containsRow(rowIndex, selectionArea), containsColumn(columnIndex, selectionArea)];
            if (row && column) {
                return {
                    backgroundColor: SELECTED_CELL_BACKGROUND,
                    borderTop: row.start ? SELECTED_CELL_BORDER : CELL_BORDER_HIDDEN,
                    borderLeft: column.start ? SELECTED_CELL_BORDER : CELL_BORDER_HIDDEN,
                    borderBottom: row.end ? SELECTED_CELL_BORDER : CELL_BORDER,
                    borderRight: column.end ? SELECTED_CELL_BORDER : CELL_BORDER,
                };
            }
            return defaultStyle;
        case 'columns':
            const cColumn = containsColumn(columnIndex, selectionArea);
            if (cColumn) {
                return {
                    backgroundColor: SELECTED_CELL_BACKGROUND,
                    borderLeft: cColumn.start ? SELECTED_CELL_BORDER : CELL_BORDER,
                    borderBottom: rowIndex === rowCount - 1 ? SELECTED_CELL_BORDER : CELL_BORDER,
                    borderRight: cColumn.end ? SELECTED_CELL_BORDER : CELL_BORDER,
                };
            }
            return defaultStyle;
        case 'rows':
            const rRow = containsRow(rowIndex, selectionArea);
            if (rRow) {
                return {
                    backgroundColor: SELECTED_CELL_BACKGROUND,
                    borderTop: rRow.start ? SELECTED_CELL_BORDER : CELL_BORDER,
                    borderBottom: rRow.end ? SELECTED_CELL_BORDER : CELL_BORDER,
                    borderRight: columnIndex === columnCount - 1 ? SELECTED_CELL_BORDER : CELL_BORDER,
                };
            }
    }
    return defaultStyle;
};
const rowGutterStyle = (rowIndex: number, selectionArea: SelectionArea | null): React.CSSProperties => {
    const defaultStyle = { backgroundColor: GUTTER_COLOR };
    if (selectionArea === null) return defaultStyle;
    switch (selectionArea.type) {
        case 'rows':
            const row = containsRow(rowIndex, selectionArea);
            if (row) {
                return {
                    color: 'rgba(var(--colors-background)',
                    backgroundColor: SELECTED_LABEL_BACKGROUND_COLOR,
                    borderBottom: row.end ? SELECTED_LABEL_BORDER : CELL_BORDER,
                    borderTop: SELECTED_LABEL_BORDER,
                };
            }
        case 'cells':
            if (containsRow(rowIndex, selectionArea)) {
                return {
                    backgroundColor: HIGHLIGHTED_LABEL_BACKGROUND_COLOR,
                };
            }
        case 'columns':
        case 'element':
            return defaultStyle;
    }
};
const columnGutterStyle = (columnIndex: number, selectionArea: SelectionArea | null): React.CSSProperties => {
    const defaultStyle = { backgroundColor: GUTTER_COLOR };
    if (selectionArea === null) return defaultStyle;
    switch (selectionArea.type) {
        case 'columns':
            const column = containsColumn(columnIndex, selectionArea);
            if (column) {
                return {
                    color: 'rgba(var(--colors-background)',
                    backgroundColor: SELECTED_LABEL_BACKGROUND_COLOR,
                    borderRight: column.end ? SELECTED_LABEL_BORDER : CELL_BORDER,
                };
            }
        case 'cells':
            if (containsColumn(columnIndex, selectionArea)) {
                return {
                    backgroundColor: HIGHLIGHTED_LABEL_BACKGROUND_COLOR,
                };
            }
        case 'rows':
        case 'element':
            return defaultStyle;
    }
};

type DataCellItemData = {
    columnCount: number;
    rowCount: number;
    dataStore: string[][];
    selectionArea: SelectionArea | null;
    onMouseDown: (columnIndex: number, rowIndex: number) => void;
    onMouseUp: () => void;
    onMouseEnter: (columnIndex: number, rowIndex: number) => void;
    conditionalFormatting: Map<string, number> | null;
    columnTypes: (SqlType | null)[];
    columnFormats: (Format | null)[];
    timezone: string | null;
};
type CellProps = GridChildComponentProps<DataCellItemData>;
const DataCell = memo(({ columnIndex, rowIndex, style, data: itemData }: CellProps) => {
    const spreadsheetSize = useContext(SpreadsheetSizeContext);
    const {
        dataStore,
        onMouseDown,
        onMouseEnter,
        onMouseUp,
        selectionArea,
        columnCount,
        rowCount,
        conditionalFormatting,
        columnTypes,
        columnFormats,
        timezone,
    } = itemData;
    const selectedStyle = cellSelected(columnIndex, rowIndex, selectionArea, columnCount, rowCount);

    const lastRowStyle = spreadsheetSize.fullHeight && rowIndex == rowCount - 1 ? { borderBottom: 'none' } : {};
    const lastColumnStyle = spreadsheetSize.fullWidth && columnIndex == columnCount - 1 ? { borderRight: 'none' } : {};

    let textAlignClass = '';
    switch (columnTypes[columnIndex]) {
        case 'Number':
        case 'Date':
        case 'DateTime':
        case 'DateTimeNtz':
        case 'DateTimeTz':
            textAlignClass = 'text-right';
            break;
    }

    const bgClass = backgroundClass(conditionalFormatting?.get(`${columnIndex}/${rowIndex}`) ?? null);
    return (
        <div
            key={`${columnIndex}/${rowIndex}`}
            className={`${bgClass} ${textAlignClass}`}
            style={{
                ...cellStyle,
                ...style,
                ...selectedStyle,
                ...lastRowStyle,
                ...lastColumnStyle,
            }}
            onMouseDown={(e) => {
                e.stopPropagation();
                onMouseDown(columnIndex, rowIndex);
            }}
            onMouseUp={(e) => {
                e.stopPropagation();
                onMouseUp();
            }}
            onMouseEnter={() => onMouseEnter(columnIndex, rowIndex)}
        >
            {formatCell(
                dataStore[columnIndex]![rowIndex]!,
                columnFormats[columnIndex],
                columnTypes[columnIndex],
                timezone,
            )}
        </div>
    );
}, areEqual);
DataCell.displayName = 'DataCell';

type TopLeftItemData = { onMouseDown: () => void };
const TopLeft = ({ columnIndex, rowIndex, style, data: itemData }: GridChildComponentProps<TopLeftItemData>) => {
    const { onMouseDown } = itemData;
    return (
        <div
            key={`${columnIndex}${rowIndex}`}
            style={{
                ...style,
                ...cellStyle,
                backgroundColor: GUTTER_COLOR,
            }}
            onMouseDown={onMouseDown}
        />
    );
};

const HeaderLeft = ({ columnIndex, rowIndex, style, data }: GridChildComponentProps<TopLeftItemData>) => {
    const { onMouseDown } = data;
    return (
        <div
            key={`${columnIndex}${rowIndex}`}
            style={{
                ...style,
                ...cellStyle,
                backgroundColor: GUTTER_COLOR,
            }}
            onMouseDown={onMouseDown}
        />
    );
};

type ColumnGutterCellData = {
    onMouseDown: (columnIndex: number) => void;
    onMouseEnter: (columnIndex: number) => void;
    onMouseUp: (columnIndex: number) => void;
    onContextMenu: (event: React.MouseEvent<HTMLDivElement>, columnIndex: number) => void;
    selectionArea: SelectionArea | null;
    columnCount: number;
};
const ColumnGutterCell = ({ columnIndex, rowIndex, style, data }: GridChildComponentProps<ColumnGutterCellData>) => {
    const spreadsheetSize = useContext(SpreadsheetSizeContext);
    const { onMouseDown, onMouseEnter, onMouseUp, selectionArea, onContextMenu, columnCount } = data;
    const gutterStyle = columnGutterStyle(columnIndex, selectionArea);
    const lastColumnStyle = spreadsheetSize.fullWidth && columnIndex == columnCount - 1 ? { borderRight: 'none' } : {};

    return (
        <div
            key={rowIndex + columnIndex}
            style={{
                ...cellStyle,
                ...style,
                ...gutterStyle,
                ...lastColumnStyle,
            }}
            onMouseDown={(e) => {
                if (e.button === 2) return;
                e.stopPropagation();
                onMouseDown(columnIndex);
            }}
            onMouseEnter={() => onMouseEnter(columnIndex)}
            onMouseUp={(e) => {
                e.stopPropagation();
                onMouseUp(columnIndex);
            }}
            onContextMenu={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onContextMenu(e, columnIndex);
            }}
        >
            {numberToLetters(columnIndex)}
        </div>
    );
};

type RowGutterCellData = {
    onMouseDown: (columnIndex: number) => void;
    onMouseEnter: (columnIndex: number) => void;
    onMouseUp: (columnIndex: number) => void;
    selectionArea: SelectionArea | null;
    rowCount: number;
};
type RowGutterCellProps = GridChildComponentProps<RowGutterCellData>;
const RowGutterCell = ({ columnIndex, rowIndex, style, data }: RowGutterCellProps) => {
    const spreadsheetSize = useContext(SpreadsheetSizeContext);
    const { onMouseDown, onMouseEnter, onMouseUp, selectionArea, rowCount } = data;
    const gutterStyle = rowGutterStyle(rowIndex, selectionArea);
    const lastRowStyle = spreadsheetSize.fullHeight && rowIndex == rowCount - 1 ? { borderBottom: 'none' } : {};

    return (
        <div
            key={rowIndex + columnIndex}
            style={{
                ...cellStyle,
                ...style,
                ...gutterStyle,
                ...lastRowStyle,
            }}
            onMouseDown={(e) => {
                e.preventDefault();
                onMouseDown(rowIndex);
            }}
            onMouseEnter={() => onMouseEnter(rowIndex)}
            onMouseUp={(e) => {
                e.preventDefault();
                onMouseUp(rowIndex);
            }}
        >
            {rowIndex + 1}
        </div>
    );
};

type RowLocation = { row: number };
type ColumnLocation = { column: number };
type CellLocation = RowLocation & ColumnLocation;

type MouseLocation =
    | ({ type: 'cells' } & CellLocation)
    | ({ type: 'row_gutter' } & RowLocation)
    | ({ type: 'column_gutter' } & ColumnLocation);

type Props = {
    dataStore: DataStore;
    selectionArea: SelectionArea | null;
    setSelectionArea: (selectionArea: SelectionArea | null) => void;
    showSqlHeaders: boolean;
    spreadsheetKind: SpreadsheetKind;
    timezone: string | null;
};

const getColumnTypes = (columns: string[], columnMeta: Record<string, CanvasStoreColumnMetaData>) =>
    columns.map((column) => columnMeta[column]?.sqlType || null);

const getColumnFormats = (columns: string[], columnMeta: Record<string, CanvasStoreColumnMetaData>) =>
    columns.map((column) => columnMeta[column]?.format || null);

const getHeaders = (columns: string[], columnMeta: Record<string, CanvasStoreColumnMetaData>, useSqlHeaders: boolean) =>
    columns.map((column) => {
        if (useSqlHeaders) {
            return columnMeta[column]?.sqlHeader || column;
        } else {
            return columnMeta[column]?.humanizedHeader || column;
        }
    });

const getColumnIdsForRange = (indexOne: number, indexTwo: number, metaData: CanvasStoreMetaData): string[] => {
    const lower = Math.min(indexOne, indexTwo);
    const higher = Math.max(indexOne, indexTwo) + 1;
    return [...Array(higher - lower).keys()].map((index) => metaData.visibleColumns[index + lower]!);
};

const getSelectedColumnIds = (selectionArea: SelectionArea | null): string[] => {
    if (selectionArea) {
        switch (selectionArea.type) {
            case 'cells':
            case 'columns':
                return selectionArea.columnIds;
        }
    }
    return [];
};

const getColumnArea = (event1: ColumnLocation, event2: ColumnLocation): ColumnSelectionArea => {
    return {
        startColumn: Math.min(event1.column, event2.column),
        endColumn: Math.max(event1.column, event2.column),
    };
};
const getRowArea = (event1: RowLocation, event2: RowLocation): RowSelectionArea => {
    return {
        startRow: Math.min(event1.row, event2.row),
        endRow: Math.max(event1.row, event2.row),
    };
};

export function parseNumber(s: string): number {
    return parseFloat(s.replace(/[,%$]/g, ''));
}

function isCohortStore(storeType: StoreType): boolean {
    return storeType !== 'text' && 'sqlCohort' in storeType;
}

function getConditionalFormatting(
    metaData: CanvasStoreMetaData,
    data: string[][],
    spreadsheetKind: SpreadsheetKind,
): Map<string, number> | null {
    if (!isCohortStore(metaData.storeType) && spreadsheetKind !== 'cohort') {
        return null;
    }

    const percentages = new Map<string, number>();
    const colorIndexes = new Map<string, number>();

    data.forEach((column, columnIndex) => {
        if (columnIndex < 2) {
            return;
        }

        column.forEach((cell, rowIndex) => {
            if (cell) {
                const total = parseNumber(data[1]![rowIndex]!);
                if (total != 0) {
                    percentages.set(`${columnIndex}/${rowIndex}`, parseNumber(cell) / total);
                }
            }
        });
    });

    const percentiles = percentile([20, 40, 60, 80], [...percentages.values()]);
    if (!Array.isArray(percentiles)) {
        return null;
    }

    for (const [key, percentage] of percentages) {
        let found = false;
        for (let i = 0; i < percentiles.length; i += 1) {
            if (percentage <= percentiles[i]!) {
                colorIndexes.set(key, i + 1);
                found = true;
                break;
            }
        }
        if (!found) {
            colorIndexes.set(key, percentiles.length + 1);
        }
    }

    return colorIndexes;
}

type SpreadsheetSize = {
    fullWidth: boolean;
    fullHeight: boolean;
};
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const SpreadsheetSizeContext = createContext<SpreadsheetSize>(undefined!);

const usePrevious = <T,>(value: T): T | undefined => {
    const ref = React.useRef<T>();
    React.useEffect(() => {
        ref.current = value;
    });
    return ref.current;
};

export function SpreadsheetTable({
    dataStore,
    selectionArea,
    setSelectionArea,
    showSqlHeaders,
    spreadsheetKind,
    timezone,
}: Props): React.ReactElement {
    const { rowCount, columnCount, data, metaData, storeId, dataHash } = dataStore;
    const headers = React.useMemo(
        () => getHeaders(metaData.visibleColumns, metaData.columnMeta, showSqlHeaders),
        [metaData, showSqlHeaders],
    );
    const columnTypes = getColumnTypes(metaData.visibleColumns, metaData.columnMeta);
    const columnFormats = getColumnFormats(metaData.visibleColumns, metaData.columnMeta);

    const dataWidths = metaData.visibleColumns.map((_, index) => {
        const format = columnFormats[index];
        const type = columnTypes[index];
        const headerLength = (headers[index]?.length ?? 0) + 3;
        const valueLength = Math.max(
            0,
            ...data[index]!.slice(0, 50).map((v) => formatCell(v, format, type, timezone).length),
        );
        // Hacky width size algorithm. W is the widest character, take the max number of charachters
        // and add one for padding, then multiply by W's width.
        return (Math.max(headerLength, valueLength, 7) + 1) * W_WIDTH;
    });

    const conditionalFormatting = React.useMemo(() => {
        return getConditionalFormatting(metaData, data, spreadsheetKind);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataHash]);

    const prevMeta = usePrevious({ dataWidths, dataHash });
    React.useEffect(() => {
        const unchanged = _.isEqual(dataWidths, prevMeta?.dataWidths) && _.isEqual(dataHash, prevMeta?.dataHash);
        if (unchanged) {
            return;
        }
        resetWidths(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataWidths]);

    const gridRef = React.useRef<InnerSpreadsheetGridHandle>(null);

    const resetWidths = (columnIndex: number) => {
        gridRef.current?.resetWidths(columnIndex);
    };

    const [mouseDownPoint, setMouseDownPoint] = React.useState<MouseLocation | null>(null);

    const selectedColumnIds = React.useMemo(() => {
        if (selectionArea) {
            switch (selectionArea.type) {
                case 'cells':
                case 'columns':
                    return selectionArea.columnIds;
            }
        }
        return [];
    }, [selectionArea]);

    const setCellSelectionArea = React.useCallback(
        (event1: CellLocation, event2: CellLocation) => {
            setSelectionArea({
                type: 'cells',
                ...getColumnArea(event1, event2),
                ...getRowArea(event1, event2),
                columnIds: getColumnIdsForRange(event1.column, event2.column, metaData),
                selectedCellValue: data[event1.column]![event1.row]!,
            });
        },
        [data, metaData, setSelectionArea],
    );
    const setColumnSelectionArea = React.useCallback(
        (event1: ColumnLocation, event2: ColumnLocation) => {
            setSelectionArea({
                type: 'columns',
                ...getColumnArea(event1, event2),
                columnIds: getColumnIdsForRange(event1.column, event2.column, metaData),
            });
        },
        [metaData, setSelectionArea],
    );
    const setColumnIdSelectionArea = React.useCallback(
        (columnId: string, index: number) => {
            setSelectionArea({
                type: 'columns',
                columnIds: [columnId],
                startColumn: index,
                endColumn: index,
            });
        },
        [setSelectionArea],
    );
    const setRowSelectionArea = React.useCallback(
        (event1: RowLocation, event2: RowLocation) => {
            setSelectionArea({
                type: 'rows',
                ...getRowArea(event1, event2),
            });
        },
        [setSelectionArea],
    );

    const mouseDown = React.useCallback(
        (event: MouseLocation) => {
            setMouseDownPoint(event);
            switch (event.type) {
                case 'cells':
                    return setCellSelectionArea(event, event);
                case 'column_gutter':
                    return setColumnSelectionArea(event, event);
                case 'row_gutter':
                    return setRowSelectionArea(event, event);
            }
        },
        [setCellSelectionArea, setColumnSelectionArea, setRowSelectionArea],
    );
    const mouseUp = () => {
        setMouseDownPoint(null);
    };
    const mouseMove = React.useCallback(
        (event: MouseLocation) => {
            if (!mouseDownPoint) return;
            switch (mouseDownPoint.type) {
                case 'cells':
                    switch (event.type) {
                        case 'cells':
                            return setCellSelectionArea(mouseDownPoint, event);
                    }
                    return;
                case 'column_gutter':
                    switch (event.type) {
                        case 'cells':
                        case 'column_gutter':
                            return setColumnSelectionArea(mouseDownPoint, event);
                    }
                    return;
                case 'row_gutter':
                    switch (event.type) {
                        case 'cells':
                        case 'row_gutter':
                            return setRowSelectionArea(mouseDownPoint, event);
                    }
            }
        },
        [mouseDownPoint, setCellSelectionArea, setColumnSelectionArea, setRowSelectionArea],
    );
    const dataCellItemData: DataCellItemData = React.useMemo(
        () => ({
            dataStore: dataStore.data,
            selectionArea,
            onMouseDown: (column: number, row: number) => mouseDown({ type: 'cells', column, row }),
            onMouseEnter: (column: number, row: number) => mouseMove({ type: 'cells', column, row }),
            onMouseUp: mouseUp,
            columnCount,
            rowCount,
            conditionalFormatting,
            columnTypes,
            columnFormats,
            timezone,
        }),
        [
            columnCount,
            dataStore,
            mouseDown,
            mouseMove,
            rowCount,
            selectionArea,
            conditionalFormatting,
            columnTypes,
            columnFormats,
            timezone,
        ],
    );
    const headerItemData: HeaderCellItemData = {
        headers,
        selectionArea,
        columnCount,
        rowCount,
        onMouseUp: () => mouseUp(),
        onMouseDown: (column: number) => mouseDown({ type: 'cells', column, row: -1 }),
        onMouseEnter: (column: number) => mouseMove({ type: 'cells', column, row: -1 }),
        columnTypes,
    };
    const columnGutterItemData: ColumnGutterCellData = React.useMemo(
        () => ({
            onMouseDown: (column: number) => mouseDown({ type: 'column_gutter', column }),
            onMouseEnter: (column: number) => mouseMove({ type: 'column_gutter', column }),
            onMouseUp: mouseUp,
            onContextMenu: (event: React.MouseEvent<HTMLDivElement>, columnIndex: number) => {
                if (selectionArea) {
                    switch (selectionArea.type) {
                        case 'cells':
                        case 'columns':
                            if (!containsColumn(columnIndex, selectionArea)) {
                                mouseDown({ type: 'column_gutter', column: columnIndex });
                            }
                            break;
                        case 'rows':
                            mouseDown({ type: 'column_gutter', column: columnIndex });
                    }
                } else {
                    mouseDown({ type: 'column_gutter', column: columnIndex });
                }
                const columnId = metaData.visibleColumns[columnIndex]!;
                const selectedColumnIds = getSelectedColumnIds(selectionArea);
                const { clientX: left, clientY: top } = event.nativeEvent;
            },
            selectionArea,
            columnCount,
        }),
        [columnCount, metaData.visibleColumns, mouseDown, mouseMove, selectionArea],
    );
    const rowGutterItemData: RowGutterCellData = React.useMemo(
        () => ({
            onMouseDown: (row: number) => mouseDown({ type: 'row_gutter', row }),
            onMouseEnter: (row: number) => mouseMove({ type: 'row_gutter', row }),
            onMouseUp: mouseUp,
            selectionArea,
            rowCount,
        }),
        [mouseDown, mouseMove, rowCount, selectionArea],
    );
    const topLeftItemData: TopLeftItemData = React.useMemo(
        () => ({
            onMouseDown: () => setSelectionArea({ type: 'element' }),
        }),
        [setSelectionArea],
    );
    const handleKeyDown = React.useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>): { column?: number; row?: number } => {
            if (!selectionArea) return {};
            if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', 'Tab', 'enter'].includes(event.key)) {
                event.stopPropagation();
                event.preventDefault();
            }
            if (event.code === 'KeyA' && event.metaKey) {
                event.stopPropagation();
                event.preventDefault();
                setSelectionArea({
                    type: 'columns',
                    startColumn: 0,
                    endColumn: dataStore.columnCount - 1,
                    columnIds: metaData.visibleColumns,
                });
            }
            if (event.code === 'KeyC' && event.metaKey) {
                event.stopPropagation();
                event.preventDefault();
                const copyData = getCopyData(selectionArea, headers, dataStore);
                if (copyData) {
                    handleCopy(copyData);
                }
            }
            switch (selectionArea.type) {
                case 'cells':
                    if (event.key === 'ArrowRight' || (event.key === 'Tab' && !event.shiftKey)) {
                        const { startRow, endRow, endColumn } = selectionArea;
                        const newColumn = endColumn + 1;
                        if (newColumn >= data.length) return {};
                        setSelectionArea({
                            type: 'cells',
                            startColumn: newColumn,
                            endColumn: newColumn,
                            startRow,
                            endRow,
                            columnIds: getColumnIdsForRange(newColumn, newColumn, metaData),
                            selectedCellValue: data[endColumn]![startRow]!,
                        });
                        return { column: newColumn };
                    }
                    if (event.key === 'ArrowLeft' || (event.key === 'Tab' && event.shiftKey)) {
                        const { startRow, endRow, startColumn } = selectionArea;
                        const newColumn = startColumn - 1;
                        if (newColumn == -1) {
                            setSelectionArea({
                                type: 'rows',
                                startRow,
                                endRow,
                            });
                            return {};
                        }
                        setSelectionArea({
                            type: 'cells',
                            startColumn: newColumn,
                            endColumn: newColumn,
                            startRow,
                            endRow,
                            columnIds: getColumnIdsForRange(newColumn, newColumn, metaData),
                            selectedCellValue: data[newColumn]![startRow]!,
                        });
                        return { column: newColumn };
                    }
                    if (event.key === 'ArrowDown' || (event.key === 'Enter' && !event.shiftKey)) {
                        const { startColumn, endColumn, endRow, columnIds } = selectionArea;
                        const newRow = endRow + 1;
                        // todo(wpride): nouncheckedindexedaccess
                        if (newRow >= (data[0]?.length || 0)) return {};
                        setSelectionArea({
                            type: 'cells',
                            startColumn: startColumn,
                            endColumn: endColumn,
                            startRow: newRow,
                            endRow: newRow,
                            columnIds: columnIds,
                            selectedCellValue: data[startColumn]![newRow]!,
                        });
                        return { row: newRow };
                    }
                    if (event.key === 'ArrowUp' || (event.key === 'Enter' && event.shiftKey)) {
                        const { startColumn, endColumn, startRow, columnIds } = selectionArea;
                        const newRow = startRow - 1;
                        if (newRow == -2) {
                            setSelectionArea({
                                type: 'columns',
                                columnIds,
                                startColumn: startColumn,
                                endColumn: endColumn,
                            });
                            return {};
                        }
                        setSelectionArea({
                            type: 'cells',
                            startColumn: startColumn,
                            endColumn: endColumn,
                            startRow: newRow,
                            endRow: newRow,
                            columnIds: columnIds,
                            selectedCellValue: data[startColumn]![newRow]!,
                        });
                        return { row: newRow };
                    }
                    break;
                case 'columns':
                    if (event.key === 'ArrowDown' || (event.key === 'Enter' && !event.shiftKey)) {
                        const { startColumn, endColumn, columnIds } = selectionArea;
                        const newRow = -1;
                        setSelectionArea({
                            type: 'cells',
                            startColumn: startColumn,
                            endColumn: endColumn,
                            startRow: newRow,
                            endRow: newRow,
                            columnIds: columnIds,
                            selectedCellValue: data[startColumn]![newRow]!,
                        });
                        return { row: newRow };
                    }
                    if (event.key === 'ArrowLeft' || (event.key === 'Tab' && event.shiftKey)) {
                        const { startColumn } = selectionArea;
                        const newColumn = startColumn - 1;
                        if (newColumn < 0) return {};
                        setSelectionArea({
                            type: 'columns',
                            columnIds: getColumnIdsForRange(newColumn, newColumn, metaData),
                            startColumn: newColumn,
                            endColumn: newColumn,
                        });
                        return { column: newColumn };
                    }
                    if (event.key === 'ArrowRight' || (event.key === 'Tab' && !event.shiftKey)) {
                        const { endColumn } = selectionArea;
                        const newColumn = endColumn + 1;
                        if (newColumn >= data.length) return {};
                        setSelectionArea({
                            type: 'columns',
                            columnIds: getColumnIdsForRange(newColumn, newColumn, metaData),
                            startColumn: newColumn,
                            endColumn: newColumn,
                        });
                        return { column: newColumn };
                    }
                    break;
                case 'rows':
                    if (event.key === 'ArrowUp' || (event.key === 'Enter' && event.shiftKey)) {
                        const { startRow } = selectionArea;
                        const newRow = startRow - 1;
                        if (newRow < -1) return {};
                        setSelectionArea({
                            type: 'rows',
                            startRow: newRow,
                            endRow: newRow,
                        });
                        return { row: newRow };
                    }
                    if (event.key === 'ArrowDown' || (event.key === 'Enter' && !event.shiftKey)) {
                        const { endRow } = selectionArea;
                        const newRow = endRow + 1;
                        // todo(wpride): nouncheckedindexedaccess
                        if (newRow >= (data[0]?.length || 0)) return {};
                        setSelectionArea({
                            type: 'rows',
                            startRow: newRow,
                            endRow: newRow,
                        });
                        return { row: newRow };
                    }
                    if (event.key === 'ArrowRight' || (event.key === 'Tab' && event.shiftKey)) {
                        const { startRow, endRow } = selectionArea;
                        const newColumn = 0;
                        setSelectionArea({
                            type: 'cells',
                            startColumn: newColumn,
                            endColumn: newColumn,
                            startRow,
                            endRow,
                            columnIds: getColumnIdsForRange(newColumn, newColumn, metaData),
                            selectedCellValue: data[newColumn]![startRow]!,
                        });
                        return { column: newColumn };
                    }
            }
            return {};
        },
        [data, dataStore, headers, metaData, selectionArea, setSelectionArea],
    );

    return (
        <div className="flex border-collapse flex-col rounded-[5px] border border-divider" key={storeId}>
            <div style={{ flex: '1 1 auto' }}>
                <AutoSizer disableHeight>
                    {({ width }) => (
                        <InnerSpreadsheetGrid
                            containerWidth={width}
                            dataWidths={dataWidths}
                            columnGutterItemData={columnGutterItemData}
                            headerItemData={headerItemData}
                            rowGutterItemData={rowGutterItemData}
                            dataCellItemData={dataCellItemData}
                            topLeftItemData={topLeftItemData}
                            rowCount={rowCount}
                            ref={gridRef}
                            handleKeyDown={handleKeyDown}
                        />
                    )}
                </AutoSizer>
            </div>
        </div>
    );
}

export const EmptySpreadsheetGrid = (): React.ReactElement => {
    const gridRef = React.useRef<InnerSpreadsheetGridHandle>(null);
    const columnCount = 10;
    const rowCount = 15;
    const empty = () => {
        //
    };
    const dataWidths = Array(columnCount).fill(100);
    const headers = Array(columnCount).fill('');
    const dataStore = Array(columnCount).fill(Array(rowCount).fill(''));
    const itemData: ColumnGutterCellData & HeaderCellItemData & RowGutterCellData & DataCellItemData & TopLeftItemData =
        {
            onMouseDown: empty,
            onMouseEnter: empty,
            onMouseUp: empty,
            onContextMenu: empty,
            selectionArea: null,
            headers,
            columnCount,
            rowCount,
            dataStore,
            conditionalFormatting: null,
            columnTypes: [],
            columnFormats: [],
            timezone: null,
        };
    return (
        <div className="flex border-collapse flex-col rounded-[5px] border border-divider">
            <div style={{ flex: '1 1 auto' }}>
                <AutoSizer disableHeight>
                    {({ width }) => (
                        <InnerSpreadsheetGrid
                            containerWidth={width}
                            dataWidths={dataWidths}
                            columnGutterItemData={itemData}
                            headerItemData={itemData}
                            rowGutterItemData={itemData}
                            dataCellItemData={itemData}
                            topLeftItemData={itemData}
                            rowCount={rowCount}
                            ref={gridRef}
                        />
                    )}
                </AutoSizer>
            </div>
        </div>
    );
};

type InnerSpreadsheetGridHandle = {
    resetWidths: (columnIndex: number) => void;
};
type InnerSpreadsheetGridProps = {
    dataWidths: number[];
    columnGutterItemData: ColumnGutterCellData;
    headerItemData: HeaderCellItemData;
    rowGutterItemData: RowGutterCellData;
    topLeftItemData: TopLeftItemData;
    rowCount: number;
    dataCellItemData: DataCellItemData;
    containerWidth?: number;
    handleKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => {
        column?: number;
        row?: number;
    };
};
const InnerSpreadsheetGrid = React.forwardRef<InnerSpreadsheetGridHandle, InnerSpreadsheetGridProps>(
    (
        {
            dataWidths,
            columnGutterItemData,
            rowGutterItemData,
            topLeftItemData,
            dataCellItemData,
            headerItemData,
            rowCount,
            containerWidth,
            handleKeyDown,
        }: InnerSpreadsheetGridProps,
        ref,
    ): React.ReactElement => {
        const headerGrid = React.useRef<VariableSizeGrid>(null);
        const dataGrid = React.useRef<VariableSizeGrid>(null);
        const columnGutterGrid = React.useRef<VariableSizeGrid>(null);
        const rowGutterGrid = React.useRef<VariableSizeGrid>(null);
        // https://github.com/bvaughn/react-window/issues/543
        const resetWidths = (columnIndex: number) => {
            dataGrid.current?.resetAfterColumnIndex(columnIndex);
            headerGrid.current?.resetAfterColumnIndex(columnIndex);
            columnGutterGrid.current?.resetAfterColumnIndex(columnIndex);
        };

        React.useImperativeHandle(ref, () => ({
            resetWidths: (columnIndex: number) => resetWidths(columnIndex),
        }));
        // Keep all the scrollers nsync
        const headerOnScroll: (props: GridOnScrollProps) => void = React.useCallback(
            ({ scrollLeft, scrollUpdateWasRequested }) => {
                if (!scrollUpdateWasRequested) {
                    columnGutterGrid.current?.scrollTo({ scrollLeft });
                    dataGrid.current?.scrollTo({ scrollLeft });
                }
            },
            [columnGutterGrid],
        );
        const dataOnScroll: (props: GridOnScrollProps) => void = React.useCallback(
            ({ scrollLeft, scrollTop, scrollUpdateWasRequested }) => {
                if (!scrollUpdateWasRequested) {
                    headerGrid.current?.scrollTo({ scrollLeft });
                    columnGutterGrid.current?.scrollTo({ scrollLeft });
                    rowGutterGrid.current?.scrollTo({ scrollTop });
                }
            },
            [headerGrid, columnGutterGrid, rowGutterGrid],
        );
        const columnGutterOnScroll: (props: GridOnScrollProps) => void = React.useCallback(
            ({ scrollLeft, scrollUpdateWasRequested }) => {
                if (!scrollUpdateWasRequested) {
                    headerGrid.current?.scrollTo({ scrollLeft });
                    dataGrid.current?.scrollTo({ scrollLeft });
                }
            },
            [headerGrid],
        );
        const rowGutterOnScroll: (props: GridOnScrollProps) => void = React.useCallback(
            ({ scrollTop, scrollUpdateWasRequested }) => {
                if (!scrollUpdateWasRequested) {
                    dataGrid.current?.scrollTo({ scrollTop });
                }
            },
            [dataGrid],
        );
        const dataWidth = dataWidths.reduce((a, b) => a + b, 0);
        const scrollbarPadding = 13;
        const contentWidth = dataWidth + GUTTER_WIDTH + scrollbarPadding;
        const width = Math.min(contentWidth, containerWidth ?? 99999);
        const fullWidth = contentWidth >= (containerWidth ?? 99999);
        const fullHeight = rowCount * ROW_HEIGHT >= SPREADSHEET_HEIGHT;
        const context = React.useMemo(
            () => ({
                fullWidth,
                fullHeight,
            }),
            [fullWidth, fullHeight],
        );

        const rowHeight = React.useCallback(() => ROW_HEIGHT, []);
        const gutterWidth = React.useCallback(() => GUTTER_WIDTH, []);
        const getDataWidth = React.useCallback((index: number) => dataWidths[index]!, [dataWidths]);

        const innerHandleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
            if (handleKeyDown) {
                const { column, row } = handleKeyDown(event);
                const align = 'smart';
                if (column !== undefined) {
                    headerGrid.current?.scrollToItem({ columnIndex: column, align });
                    columnGutterGrid.current?.scrollToItem({
                        columnIndex: column,
                        align,
                    });
                    dataGrid.current?.scrollToItem({ columnIndex: column, align });
                }
                if (row !== undefined) {
                    rowGutterGrid.current?.scrollToItem({ rowIndex: row, align });
                    dataGrid.current?.scrollToItem({ rowIndex: row, align });
                }
            }
        };

        return (
            <SpreadsheetSizeContext.Provider value={context}>
                <div
                    style={{ width }}
                    className="tabular-nums outline-none"
                    tabIndex={0}
                    onKeyDown={innerHandleKeyDown}
                >
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <Grid
                            className="spreadsheet-grid no-scrollbar"
                            columnCount={1}
                            columnWidth={gutterWidth}
                            rowCount={1}
                            rowHeight={rowHeight}
                            height={ROW_HEIGHT}
                            width={GUTTER_WIDTH}
                            itemData={topLeftItemData}
                        >
                            {TopLeft}
                        </Grid>
                        <Grid
                            className="spreadsheet-grid no-scrollbar"
                            ref={columnGutterGrid}
                            onScroll={columnGutterOnScroll}
                            columnCount={dataWidths.length}
                            columnWidth={getDataWidth}
                            height={ROW_HEIGHT}
                            rowCount={1}
                            rowHeight={rowHeight}
                            width={width}
                            itemData={columnGutterItemData}
                        >
                            {ColumnGutterCell}
                        </Grid>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <Grid
                            className="spreadsheet-grid no-scrollbar"
                            columnCount={1}
                            columnWidth={gutterWidth}
                            rowCount={1}
                            rowHeight={rowHeight}
                            height={ROW_HEIGHT}
                            width={GUTTER_WIDTH}
                            itemData={topLeftItemData}
                        >
                            {HeaderLeft}
                        </Grid>
                        <Grid
                            className="spreadsheet-grid no-scrollbar"
                            ref={headerGrid}
                            onScroll={headerOnScroll}
                            columnCount={dataWidths.length}
                            columnWidth={getDataWidth}
                            height={ROW_HEIGHT}
                            rowCount={1}
                            rowHeight={rowHeight}
                            width={width}
                            itemData={headerItemData}
                        >
                            {HeaderCell}
                        </Grid>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <Grid
                            className="spreadsheet-grid no-scrollbar"
                            ref={rowGutterGrid}
                            onScroll={rowGutterOnScroll}
                            columnCount={1}
                            columnWidth={gutterWidth}
                            height={SPREADSHEET_HEIGHT}
                            rowCount={rowCount}
                            rowHeight={rowHeight}
                            width={GUTTER_WIDTH}
                            itemData={rowGutterItemData}
                            overscanColumnCount={5}
                            overscanRowCount={20}
                        >
                            {RowGutterCell}
                        </Grid>
                        <Grid
                            className="spreadsheet-grid"
                            ref={dataGrid}
                            onScroll={dataOnScroll}
                            columnCount={dataWidths.length}
                            columnWidth={getDataWidth}
                            height={SPREADSHEET_HEIGHT}
                            rowCount={rowCount}
                            rowHeight={rowHeight}
                            width={width}
                            itemData={dataCellItemData}
                            overscanColumnCount={5}
                            overscanRowCount={20}
                        >
                            {DataCell}
                        </Grid>
                    </div>
                </div>
            </SpreadsheetSizeContext.Provider>
        );
    },
);
InnerSpreadsheetGrid.displayName = 'InnerSpreadsheetGrid';

const EmptySpreadsheetMemo = React.memo(EmptySpreadsheetGrid);
export const SpreadsheetTableMemo = React.memo(SpreadsheetTable);

type SpreadsheetKind = 'table' | 'cohort';

type WrapperProps = {
    dataStore: DataStore | null;
    storeId: string;
    spreadsheetKind: SpreadsheetKind;
    timezone?: string;
};
export function SpreadsheetWrapper(props: WrapperProps): React.ReactElement {
    const { dataStore, storeId, timezone } = props;
    const [selectionArea, setSelectionArea_] = React.useState<SelectionArea | null>(null);
    const setSelectionArea = React.useCallback(
        (selectionArea: SelectionArea | null) => {
            setSelectionArea_(selectionArea);
        },
        [storeId, dataStore],
    );

    if (!dataStore) return <EmptySpreadsheetMemo />;

    // //   const { rowCount, nonFilterRowCount } = dataStore.metaData;
    //   const getRowText = () => {
    //     if (!rowCount) return;
    //     if (rowCount === nonFilterRowCount || nonFilterRowCount === null)
    //       return `Rows: ${rowCount.toLocaleString()}`;
    //     return `Filtered rows: ${rowCount.toLocaleString()} of ${nonFilterRowCount.toLocaleString()}`;
    //   };
    //   const rowCountText = getRowText();
    return (
        <div
            onMouseUp={(e) => {
                // prevents this from going to Element.tsx#select() which would clear the column selection
                e.stopPropagation();
            }}
        >
            <SpreadsheetTableMemo
                dataStore={dataStore}
                setSelectionArea={setSelectionArea}
                selectionArea={selectionArea}
                showSqlHeaders={false}
                spreadsheetKind={'table'}
                timezone={timezone || null}
            />
            {selectionArea && (
                <div className="absolute bottom-0 left-0 mb-1 flex items-center px-6 text-[11px]">
                    {/* <span>{rowCountText}</span> */}
                </div>
            )}
        </div>
    );
}
