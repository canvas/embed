import React from 'react'
import { GetCanvasEmbedResponse } from './rust_types/GetCanvasEmbedResponse'
import { getChart, getSpreadsheet } from './StoreUtil'
import { Chart } from './Chart'
import { SpreadsheetWrapper as Spreadsheet } from './Spreadsheet'

type CanvasInnerProps = {
  canvasData: GetCanvasEmbedResponse
  dataHash: string
}
export const CanvasInner = ({ canvasData, dataHash }: CanvasInnerProps) => {
  const { elementOrder, elements } = canvasData
  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-3">
      {elementOrder.elementOrder.map(elementIds => {
        return (
          <div className={`flex flex-col sm:max-w-[calc(100vw-276px)]`}>
            <div className="flex flex-col gap-4 sm:flex-row">
              {elementIds.map(elementId => {
                const element = elements[elementId]
                if (!element) return <></>
                const chartElement = getChart(element)
                const spreadsheetElement = getSpreadsheet(element)
                if (chartElement) {
                  return (
                    <Element title="Canvases by day" elementId={elementId}>
                      <Chart
                        data={chartElement.chartData}
                        title="Testerman"
                        timezone={null}
                      />
                    </Element>
                  )
                }
                if (spreadsheetElement) {
                  return (
                    <Element title="Canvases by day" elementId={elementId}>
                      <Spreadsheet
                        dataStore={{
                          data: spreadsheetElement.payload,
                          rowCount: spreadsheetElement.rowCount,
                          columnCount: spreadsheetElement.columnCount,
                          metaData: spreadsheetElement.metaData,
                          storeId: spreadsheetElement.metaData.sourceKey,
                          dataHash,
                        }}
                        storeId={spreadsheetElement.metaData.sourceKey}
                        spreadsheetKind={'table'}
                      />
                    </Element>
                  )
                }
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

type ElementProps = {
  title: string
  children: React.ReactNode
  elementId: string
}
function Element({
  title,
  children,
  elementId,
}: ElementProps): React.ReactElement {
  const elementRef = React.useRef<HTMLDivElement>(null)
  return (
    <figure className="flex-1 max-w-[900px]">
      <div
        className={`group rounded-lg border 
			    border-transparent hover:border-transparent
			h-full max-w-[calc(100vw-48px)] dark:bg-background`}
        contentEditable="false"
        suppressContentEditableWarning={true}
        ref={elementRef}
        onMouseUp={e => {
          e.stopPropagation()
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
    </figure>
  )
}

const styles: Record<string, React.CSSProperties> = {
  title: {
    fontSize: 15,
    fontWeight: 600,
    lineHeight: `21px`,
    cursor: 'text',
  },
  icons: {
    color: '#91939b',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  content: {
    padding: 24,
  },
}
