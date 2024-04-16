import React from 'react';
import { GetCanvasEmbedResponse } from './__rust_generated__/GetCanvasEmbedResponse';
import { Filters } from './filter/Filters';
import { CanvasElement } from './CanvasElement';
import { Spinner } from './Spinner';

type CanvasInnerProps = {
    canvasData: GetCanvasEmbedResponse;
    dataHash?: string;
    loading: boolean;
    downloadCsv?: (elementId: string, title: string) => void;
};
export const CanvasInner = ({ canvasData, dataHash, loading, downloadCsv }: CanvasInnerProps) => {
    const { elementOrder, elements } = canvasData;
    return (
        <div className="flex flex-1 flex-col overflow-y-auto gap-4">
            <div className="flex items-center gap-1">
                <Filters canvasData={canvasData} />
                {loading && <Spinner />}
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
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </section>
        </div>
    );
};
