import React from 'react';
import { GetCanvasEmbedResponse } from './rust_types/GetCanvasEmbedResponse';
import { getChart, getSpreadsheet } from './StoreUtil';
import { Chart } from './Chart';
import { SpreadsheetWrapper as Spreadsheet } from './Spreadsheet';
import { Element } from './Element';
import { Filters } from './filter/Filters';

type CanvasInnerProps = {
    canvasData: GetCanvasEmbedResponse;
    dataHash: string;
};
export const CanvasInner = ({ canvasData, dataHash }: CanvasInnerProps) => {
    const { elementOrder, elements } = canvasData;
    return (
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-3">
            <Filters canvasData={canvasData} />
            {/* <Filters filters={canvasData.filters.filters} /> */}
            {elementOrder.element_order.map((elementIds, index) => {
                return (
                    <div key={index} className={`flex flex-col sm:max-w-[calc(100vw-276px)]`}>
                        <div className="flex flex-col gap-4 sm:flex-row">
                            {elementIds.map((elementId) => {
                                const element = elements[elementId];
                                if (!element) return <></>;

                                const chartElement = getChart(element);
                                if (chartElement) {
                                    const chartTitle = element.title || 'Chart';
                                    return (
                                        <Element key={elementId} title={chartTitle} elementId={elementId}>
                                            <Chart data={chartElement.chartData} title={chartTitle} timezone={null} />
                                        </Element>
                                    );
                                }
                                const spreadsheetElement = getSpreadsheet(element);
                                if (spreadsheetElement) {
                                    return (
                                        <Element
                                            key={elementId}
                                            title={spreadsheetElement.metaData.title}
                                            elementId={elementId}
                                        >
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
