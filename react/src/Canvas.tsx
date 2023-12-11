// import React from 'react'
// import { ChartData } from './Chart';
type Props = {
  canvasId: string
}

export interface ColumnMetaData {
  userAdded: boolean
  header: string | null
  userAddedHeader: string | null
  // columnType: ColumnType;
  // format: Format | null;
  sqlType: string | null
  hidden: boolean | null
}

export interface MetaData {
  sourceKey: string
  title: string
  columns: Array<string>
  rows: Array<string>
  columnMeta: Record<string, ColumnMetaData>
  // storeType: StoreType;
  // sqlDialect: SqlDialect | null;
  customSqlQuery: string | null
  // filter: CustomFilter;
  // draftFilter: CustomFilter | null;
  // sqlState: SqlState | null;
  // sorts: Array<Sort>;
  // compileError: string | null;
  // version: MetaDataVersion;
}

export interface ChartEmbed {
  chartData: any
}

export interface SpreadsheetEmbed {
  data: Array<Array<string>>
  metaData: MetaData
}

export type EmbedElement =
  | { chart: ChartEmbed }
  | { spreadsheet: SpreadsheetEmbed }

export interface ElementOrder {
  elementOrder: Array<Array<string>>
}

export interface GetCanvasEmbedResponse {
  elementOrder: ElementOrder
  elements: Record<string, EmbedElement>
}

export const Canvas = ({ canvasId }: Props) => {
  console.log('canvasId', canvasId)

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-3"></div>
  )
}
