import React from 'react';
import { GetCanvasEmbedResponse } from '@/src/rust_types/GetCanvasEmbedResponse';
import Filter from './Filter';

export function Filters({ canvasData }: { canvasData: GetCanvasEmbedResponse }) {
    const filters = canvasData?.filters?.filters;
    const filtersVisible = filters?.filter(
        (filter) => filter?.filterType?.type === 'select' && filter.filterType.storeId != null,
    );

    return (
        <section>
            {filtersVisible?.map((filter) => <Filter key={filter.filterId} canvasData={canvasData} filter={filter} />)}
        </section>
    );
}
