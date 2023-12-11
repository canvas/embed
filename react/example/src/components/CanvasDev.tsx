import * as React from "react";
import { ChartData, DataChart } from "canvas-embed";
import "canvas-embed/dist/index.css";
import { SpreadsheetWrapper } from "./SpreadsheetDev";

type SqlType =
  | "Text"
  | "Boolean"
  | "Number"
  | "Date"
  | "DateTime"
  | "DateTimeNtz"
  | "DateTimeTz"
  | "Object"
  | "Array";

type Format =
  | { type: "Automatic" }
  | { type: "PlainText" }
  | { type: "Money_v2"; precision: number }
  | { type: "Percent_v2"; precision: number }
  | { type: "Number"; precision: number }
  | { type: "Date" }
  | { type: "DateTime" }
  | { type: "Money" }
  | { type: "Percent" };

type SqlDialect = "Snowflake" | "PostgreSql" | "BigQuery" | "Redshift";

type StoreType =
  | "text"
  | { sqlJoinSource: { context: any } }
  | {
      sqlPivotSource: {
        source_id: string;
        column_fields: Array<any>;
        row_fields: Array<any>;
        value_fields: Array<any>;
      };
    }
  | {
      sqlSource: {
        database: string | null;
        schema: string;
        table: string;
        warehouse_auth_id: string;
        sql_dialect: SqlDialect;
        primary_key_ids: Array<string>;
      };
    }
  | { sqlCloneSource: { source_id: string } }
  | { sqlTextFormula: { formula: any } }
  | {
      sqlSpreadsheet: {
        schema: string;
        table: string;
        warehouse_auth_id: string;
        initial_query: string;
      };
    }
  | { sqlCohort: { source_id: string; options: any } }
  | { sqlUniqueValues: { source_id: string; options: any } };

export interface CanvasStoreColumnMetaData {
  humanizedHeader: string | null;
  sqlHeader: string | null;
  formula: string | null;
  formulaError: string | null;
  sqlType: SqlType | null;
  hidden: boolean;
  format: Format | null;
}

export interface CanvasStoreMetaData {
  sourceKey: string;
  title: string;
  allColumns: Array<string>;
  visibleColumns: Array<string>;
  columnMeta: Record<string, CanvasStoreColumnMetaData>;
  storeType: StoreType;
  compileError: string | null;
  validSql: boolean;
  formulaColumnsDisabled: string | null;
  rowCount: bigint | null;
  nonFilterRowCount: bigint | null;
}

export interface ChartEmbed {
  chartData: ChartData;
}

interface DataPayload {
  storeId: string;
  columnCount: number;
  rowCount: number;
  payload: Array<Array<string>>;
  metaData: CanvasStoreMetaData;
}

export type EmbedElement = { chart: ChartEmbed } | { spreadsheet: DataPayload };

export interface ElementOrder {
  elementOrder: Array<Array<string>>;
}

export interface GetCanvasEmbedResponse {
  elementOrder: ElementOrder;
  elements: Record<string, EmbedElement>;
}

export function getChart(element: EmbedElement): ChartEmbed | undefined {
  return typeof element != "string" && "chart" in element
    ? element.chart
    : undefined;
}

export function getSpreadsheet(element: EmbedElement): DataPayload | undefined {
  return typeof element != "string" && "spreadsheet" in element
    ? element.spreadsheet
    : undefined;
}

type ElementProps = {
  title: string;
  children: React.ReactNode;
  elementId: string;
};

export function Element({
  title,
  children,
  elementId,
}: ElementProps): React.ReactElement {
  const elementRef = React.useRef<HTMLDivElement>(null);
  return (
    <div className="flex-1 max-w-[900px]">
      <div
        className={`group rounded-lg border 
			    border-transparent hover:border-transparent
			h-full max-w-[calc(100vw-48px)] dark:bg-background`}
        contentEditable="false"
        suppressContentEditableWarning={true}
        ref={elementRef}
        onMouseUp={(e) => {
          e.stopPropagation();
        }}
        id={elementId}
      >
        <div className="flex h-12 cursor-grab items-center rounded-lg px-7 hover:bg-highlight/50">
          <div className="flex flex-1 items-center">
            <div
              style={styles.title}
              contentEditable
              suppressContentEditableWarning={true}
            >
              {title}
            </div>
          </div>
        </div>
        <div className="mx-6 h-px bg-border dark:bg-faded/50" />
        <div style={styles.content} className="relative">
          {children}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  title: {
    fontSize: 15,
    fontWeight: 600,
    lineHeight: `21px`,
    cursor: "text",
  },
  icons: {
    color: "#91939b",
    display: "flex",
    justifyContent: "flex-end",
  },
  content: {
    padding: 24,
  },
};

type Props = {
  canvasId: string;
  canvasData: GetCanvasEmbedResponse;
  dataHash: string;
};
export const CanvasDevInner = ({ canvasId, canvasData, dataHash }: Props) => {
  const { elementOrder, elements } = canvasData;
  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-3">
      {elementOrder.elementOrder.map((elementIds) => {
        return (
          <div className={`flex flex-col sm:max-w-[calc(100vw-276px)]`}>
            <div className="flex flex-col gap-4 sm:flex-row">
              {elementIds.map((elementId) => {
                const element = elements[elementId];
                if (!element) return <></>;
                const chartElement = getChart(element);
                const spreadsheetElement = getSpreadsheet(element);
                if (chartElement) {
                  return (
                    <Element title="Testerman" elementId={elementId}>
                      <DataChart
                        data={chartElement.chartData}
                        title="Testerman"
                        timezone={null}
                      />
                    </Element>
                  );
                }
                if (spreadsheetElement) {
                  return (
                    <Element title="Testerman" elementId={elementId}>
                      <SpreadsheetWrapper
                        dataStore={{
                          data: spreadsheetElement.payload,
                          rowCount: spreadsheetElement.rowCount,
                          columnCount: spreadsheetElement.columnCount,
                          metaData: spreadsheetElement.metaData,
                          storeId: spreadsheetElement.metaData.sourceKey,
                          dataHash,
                        }}
                        storeId={spreadsheetElement.metaData.sourceKey}
                        spreadsheetKind={"table"}
                      />
                    </Element>
                  );
                }
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

type CanvasProps = {
  canvasId: string;
  authToken: string;
  host?: string;
};

export const CanvasDev: React.FC<CanvasProps> = ({
  canvasId,
  authToken,
  host: hostOverride,
}: CanvasProps) => {
  const [canvasData, setCanvasData] =
    React.useState<GetCanvasEmbedResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [dataHash, setDataHash] = React.useState<string>(
    Math.random().toString(36).substring(7),
  );
  const host = hostOverride || "https://api.canvasapp.com";
  React.useEffect(() => {
    fetch(`${host}/v1/embed/canvas_embed?canvas_id=${canvasId}`, {
      method: "GET",
      headers: {
        "x-embed-key": authToken,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          console.error(`Error getting canvas data: ${text}`);
          setCanvasData(null);
          setError(text);
        } else {
          const chartData = await res.json();
          setCanvasData(chartData);
          setDataHash(Math.random().toString(36).substring(7));
          setError(null);
        }
      })
      .catch((error) => {
        console.log(`Error getting embed data: ${error}`);
        setError(`${error}`);
        setCanvasData(null);
      });
  }, [authToken, canvasId]);
  if (canvasData) {
    return (
      <CanvasDevInner
        canvasId={canvasId}
        canvasData={canvasData}
        dataHash={dataHash}
      />
    );
  }
};
