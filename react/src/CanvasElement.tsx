import React from 'react';
import { Chart } from './Chart';
import { SpreadsheetWrapper as Spreadsheet } from './Spreadsheet';
import { Element } from './Element';
import { EmbedElement } from './rust_types/EmbedElement';
import { BigNumber } from './components/BigNumber';
import { ComponentEmbedElement } from './types';

export const CanvasElement = ({
    element,
    elementId,
    dataHash,
}: {
    element?: EmbedElement;
    elementId: string;
    dataHash: string;
}) => {
    if (!element) return <></>;

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
        if (elementType.component.component === 'BigNumber') {
            return <BigNumber element={element as ComponentEmbedElement} />;
        }
    }

    console.log('Unknown element type', element);
    return <></>;
};
