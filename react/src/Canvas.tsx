import React from 'react';
import { Filters } from './filter/Filters';
import { CanvasElement } from './CanvasElement';
import { EmbedResponse } from './types/EmbedResponse';

type CanvasInnerProps = {
    canvasData: EmbedResponse;
    dataHash?: string;
    downloadCsv?: (elementId: string, title: string) => void;
};
export const CanvasInner = ({ canvasData, dataHash, downloadCsv }: CanvasInnerProps) => {
    const { elementOrder, elements, theme } = canvasData;
    return (
        <div className="flex flex-1 flex-col overflow-visible gap-4">
            <div className="flex items-center gap-1">
                <Filters canvasData={canvasData} />
            </div>
            <section className="flex flex-col gap-8">
                {elementOrder.element_order.map((elementIds, index) => (
                    <div key={index} className="flex flex-col">
                        <div className="flex flex-col gap-8 sm:flex-row">
                            {elementIds.map((elementId) => (
                                <CanvasElement
                                    key={elementId}
                                    elementId={elementId}
                                    element={elements[elementId]}
                                    dataHash={dataHash}
                                    downloadCsv={downloadCsv}
                                    theme={theme}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </section>
        </div>
    );
};
