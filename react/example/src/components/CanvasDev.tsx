import * as React from "react";
import { ChartData, DataChart } from "canvas-embed";
import "./../assets/scss/App.scss";
import "canvas-embed/dist/index.css";

export interface ColumnMetaData {
  userAdded: boolean;
  header: string | null;
  userAddedHeader: string | null;
  // columnType: ColumnType;
  // format: Format | null;
  sqlType: string | null;
  hidden: boolean | null;
}

export interface MetaData {
  sourceKey: string;
  title: string;
  columns: Array<string>;
  rows: Array<string>;
  columnMeta: Record<string, ColumnMetaData>;
  // storeType: StoreType;
  // sqlDialect: SqlDialect | null;
  customSqlQuery: string | null;
  // filter: CustomFilter;
  // draftFilter: CustomFilter | null;
  // sqlState: SqlState | null;
  // sorts: Array<Sort>;
  // compileError: string | null;
  // version: MetaDataVersion;
}

export interface ChartEmbed {
  chartData: ChartData;
}

export interface SpreadsheetEmbed {
  data: Array<Array<string>>;
  metaData: MetaData;
}

export type EmbedElement =
  | { chart: ChartEmbed }
  | { spreadsheet: SpreadsheetEmbed };

export interface ElementOrder {
  elementOrder: Array<Array<string>>;
}

export interface GetCanvasEmbedResponse {
  elementOrder: ElementOrder;
  elements: Record<string, EmbedElement>;
}

export function getChart(element: EmbedElement): ChartEmbed | undefined {
	return typeof element != 'string' && 'chart' in element ? element.chart : undefined;
}

type Props = {
  canvasId: string;
  canvasData: GetCanvasEmbedResponse;
};
export const CanvasDevInner = ({ canvasId, canvasData }: Props) => {
  const { elementOrder, elements } = canvasData;
  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-3">
      {elementOrder.elementOrder.map((elementIds) => {
        return (
          <div className={`flex flex-col sm:max-w-[calc(100vw-276px)]`}>
            {elementIds.map((elementId) => {
              const element = elements[elementId];
              if (!element) return <></>;
	      const chartElement = getChart(element);
	      if (chartElement) {
		return <DataChart data={chartElement.chartData} title="Testerman" />
	      }
            })}
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
    return <CanvasDevInner canvasId={canvasId} canvasData={canvasData} />;
  }
};
