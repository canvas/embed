import React from 'react';
import Filter from './Filter';
import { EmbedResponse } from '../types/EmbedResponse';

export function Filters({ canvasData }: { canvasData: EmbedResponse }) {
    const filters = canvasData?.filters?.filters;
    const filtersVisible = filters?.filter(
        (filter) => filter?.filterType?.type === 'select' && filter.filterType.storeId != null,
    );

    return (
        <section className="flex">
            {filtersVisible?.map((filter) => <Filter key={filter.filterId} canvasData={canvasData} filter={filter} />)}
        </section>
    );
}
