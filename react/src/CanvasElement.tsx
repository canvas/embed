import React from 'react';
import { Chart } from './Chart';
import { SpreadsheetWrapper as Spreadsheet } from './Spreadsheet';
import { Element } from './Element';
import { EmbedElement } from './__rust_generated__/EmbedElement';
import { BigNumber } from './components/BigNumber';
import { ComponentEmbedElement } from './types';
import Text from './components/Text';
import { defaultTheme } from './components/layout/themes/theme.util';
import { DownloadIcon } from './icons';
import { DropdownMenuCommand } from './DropdownMenu';
import { SearchComponent } from './components/SearchComponent';

export const CanvasElement = ({
    element,
    elementId,
    dataHash,
    downloadCsv,
}: {
    element?: EmbedElement;
    elementId: string;
    dataHash?: string;
    downloadCsv?: (elementId: string, title: string) => void;
}) => {
    if (!element) return <></>;

    const { elementType, title } = element;

    if (elementType.type === 'chart') {
        const chartTitle = title || 'Chart';
        return (
            <Element key={elementId} title={chartTitle} elementId={elementId}>
                <Chart data={elementType.chartData} title={chartTitle} timezone={null} theme={defaultTheme} />
            </Element>
        );
    }
    if (elementType.type === 'spreadsheet') {
        const spreadsheetElement = elementType;
        if (spreadsheetElement.displayExtras.hiddenWhenEmpty === true && spreadsheetElement.rowCount === 0) {
            return;
        }
        const title = spreadsheetElement.metaData.title;
        const commands: DropdownMenuCommand[] = [];

        if (downloadCsv) {
            commands.push({
                id: 'download_csv',
                callback: () => downloadCsv(elementId, title),
                icon: DownloadIcon,
                text: 'Download CSV',
                keys: null,
            });
        }
        return (
            <Element key={elementId} title={title} elementId={elementId} commands={commands}>
                <Spreadsheet
                    dataStore={{
                        data: spreadsheetElement.payload,
                        rowCount: spreadsheetElement.rowCount,
                        columnCount: spreadsheetElement.columnCount,
                        metaData: spreadsheetElement.metaData,
                        storeId: spreadsheetElement.metaData.sourceKey,
                        dataHash: dataHash ?? 'unset',
                    }}
                    storeId={spreadsheetElement.metaData.sourceKey}
                    spreadsheetKind={'table'}
                />
            </Element>
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
