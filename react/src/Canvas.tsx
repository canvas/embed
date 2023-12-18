import React from 'react';
import { GetCanvasEmbedResponse } from './rust_types/GetCanvasEmbedResponse';
// import { getChart, getSpreadsheet } from './StoreUtil';
import { Chart } from './Chart';
import { SpreadsheetWrapper as Spreadsheet } from './Spreadsheet';
import { Element } from './Element';
import { Filters } from './filter/Filters';
import { EmbedElement } from './rust_types/EmbedElement';
import { BigNumber } from './components/BigNumber';

const CanvasElement = ({
    element,
    elementId,
    dataHash,
}: {
    element: EmbedElement;
    elementId: string;
    dataHash: string;
}) => {
    if (!element) return <></>;

    console.log('element', element);
    const { elementType } = element;

    if (elementType.type === 'chart') {
        const chartTitle = element.title || 'Chart';
        return (
            <Element key={elementId} title={chartTitle} elementId={elementId}>
                <Chart data={elementType.chartData} title={chartTitle} timezone={null} />
            </Element>
        );
    }
    if (elementType.type === 'spreadsheet') {
        const spreadsheetElement = elementType;
        return (
            <Element key={elementId} title={spreadsheetElement.metaData.title} elementId={elementId}>
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
    if (elementType.type === 'component') {
        console.log('elementType', elementType);
        if (elementType.component.component === 'BigNumber') {
            return <BigNumber element={element} />;
            // return (
            //     <Element key={elementId} title={element.title || ''} elementId={elementId}>
            //         <BigNumber element={element} />
            //     </Element>
            // );
        }
    }
};

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
            <section className="mt-5 flex flex-col gap-6">
                {elementOrder.element_order.map((elementIds, index) => (
                    <div key={index} className={`flex flex-col sm:max-w-[calc(100vw-276px)]`}>
                        <div className="flex flex-col gap-4 sm:flex-row">
                            {elementIds.map((elementId) => (
                                <CanvasElement
                                    elementId={elementId}
                                    element={elements[elementId]}
                                    dataHash={dataHash}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </section>
        </div>
    );
};
