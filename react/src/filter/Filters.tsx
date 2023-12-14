import React from 'react';
import MultiSelectInput from '../components/MultiSelectInput';
import useCanvasState from '../state/useCanvasState';

import { GetCanvasEmbedResponse } from '@/src/rust_types/GetCanvasEmbedResponse';

export function Filters({ canvasData }: { canvasData: GetCanvasEmbedResponse }) {
    const filters = canvasData?.filters?.filters;
    const filtersVisible = filters?.filter((filter) => filter?.filterType?.type === 'select');
    console.log('filters', filters);
    console.log('filtersVisible', filtersVisible);
    const updateFilter = useCanvasState((state) => state.updateFilter);
    const selectedFilters = useCanvasState((state) => state.filters);
    return (
        <section>
            {filtersVisible?.map((filter) => (
                <MultiSelectInput
                    key={filter.filterId}
                    value={selectedFilters[filter.variable]}
                    onChange={(value: string) => {
                        const variable = filter.variable;
                        updateFilter({ [variable]: value });
                    }}
                    // @ts-ignore
                    options={canvasData.filters.uniqueValues[filter.filterType.storeId]}
                />
            ))}
        </section>
    );
}
