export type RowSelectionArea = { startRow: number; endRow: number };
export type ColumnSelectionArea = { startColumn: number; endColumn: number };
export type CellSelectionArea = RowSelectionArea & ColumnSelectionArea;

export type SelectionArea =
  | { type: "element" }
  | ({ type: "columns"; columnIds: string[] } & ColumnSelectionArea)
  | ({ type: "rows" } & RowSelectionArea)
  | ({
      type: "cells";
      columnIds: string[];
      selectedCellValue: string | null;
    } & CellSelectionArea);

export type SpreadsheetSelectedElement = {
  type: "spreadsheet";
  elementId: string;
  storeId: string;
  //     storeType: StoreType | null;
  selectionArea: SelectionArea | null;
};

export type ChartSelection = { type: "chart"; elementId: string };

export type TextSelection = { type: "text"; elementId: string };

export type ComponentSelection = { type: "component"; elementId: string };

export type SelectedElement =
  | SpreadsheetSelectedElement
  | ChartSelection
  | TextSelection
  | ComponentSelection;
