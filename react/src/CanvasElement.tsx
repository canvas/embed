import React from 'react';
import { Element } from './Element';
import { EmbedElement } from './__rust_generated__/EmbedElement';
import { BigNumber } from './components/BigNumber';
import { ComponentEmbedElement } from './types';
import Text from './components/Text';
import { SearchComponent } from './components/SearchComponent';
import { Theme, getTheme } from './components/layout/themes/theme.util';
import { Table } from './Table';
import { SvgChart } from './SvgChart';
import { ChartTheme } from './ChartTheme';

export const CanvasElement = ({
    element,
    elementId,
    downloadCsv,
    theme,
}: {
    element?: EmbedElement;
    elementId: string;
    dataHash?: string;
    downloadCsv?: (elementId: string, title: string) => void;
    theme?: Theme;
}) => {
    if (!element) return <></>;

    const { elementType, title } = element;

    const mergedTheme = getTheme(theme as any);

    if (elementType.type === 'chart') {
        const chartTitle = title || 'Chart';
        return (
            <Element key={elementId} title={chartTitle} elementId={elementId}>
                <ChartTheme data={elementType.chartData} theme={mergedTheme}>
                    <SvgChart data={elementType.chartData} theme={mergedTheme} />
                </ChartTheme>
            </Element>
        );
    }
    if (elementType.type === 'spreadsheet') {
        const spreadsheetElement = elementType;
        if (spreadsheetElement.displayExtras.hiddenWhenEmpty === true && spreadsheetElement.rowCount === 0) {
            return;
        }
        const title = spreadsheetElement.metaData.title;

        const columnMeta = spreadsheetElement.metaData.columnMeta;
        const columns = spreadsheetElement.metaData.visibleColumns.map((columnId) => {
            const meta = columnMeta[columnId];
            return {
                header: meta?.humanizedHeader || columnId,
                type: meta?.sqlType ?? null,
                format: meta?.format ?? null,
                columnId,
            };
        });

        return (
            <Table
                data={spreadsheetElement.payload}
                columns={columns}
                rowCount={spreadsheetElement.rowCount}
                download={downloadCsv ? () => downloadCsv(elementId, title) : undefined}
                title={title}
                storeId={spreadsheetElement.storeId}
            />
        );
    }
    if (elementType.type === 'component') {
        if (elementType.component.component === 'BigNumber') {
            return (
                <Element key={elementId} elementId={elementId}>
                    <BigNumber element={element as ComponentEmbedElement} title={title || ''} />
                </Element>
            );
        } else if (elementType.component.component === 'SearchComponent') {
            return (
                <Element key={elementId} elementId={elementId}>
                    <SearchComponent element={element as ComponentEmbedElement} title={title || ''} />
                </Element>
            );
        }
    }
    if (elementType.type === 'text') {
        return (
            <Element key={elementId} title={title || ''} elementId={elementId}>
                <Text element={elementType} />
            </Element>
        );
    }

    console.log('Unknown element type', element);
    return <></>;
};
