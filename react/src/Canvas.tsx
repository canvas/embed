import React from 'react';
import { GetCanvasEmbedResponse } from './rust_types/GetCanvasEmbedResponse';
import { Filters } from './filter/Filters';
import { CanvasElement } from './CanvasElement';

type CanvasInnerProps = {
    canvasData: GetCanvasEmbedResponse;
    dataHash: string;
};
export const CanvasInner = ({ canvasData, dataHash }: CanvasInnerProps) => {
    const { elementOrder, elements } = canvasData;
    return (
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
            <Filters canvasData={canvasData} />
            <section className="mt-5 flex flex-col gap-8">
                {elementOrder.element_order.map((elementIds, index) => (
                    <div key={index} className={`flex flex-col sm:max-w-[calc(100vw-276px)]`}>
                        <div className="flex flex-col gap-8 sm:flex-row">
                            {elementIds.map((elementId) => (
                                <CanvasElement
                                    key={elementId}
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
