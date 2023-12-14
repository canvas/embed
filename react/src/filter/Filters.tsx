import React from 'react';
import MultiSelectInput from '../components/MultiSelectInput';
import useCanvasState from '../state/useCanvasState';
import isEmpty from 'lodash/isEmpty';

import { GetCanvasEmbedResponse } from '@/src/rust_types/GetCanvasEmbedResponse';

export function Filters({ canvasData }: { canvasData: GetCanvasEmbedResponse }) {
    const filters = canvasData?.filters?.filters;
    const filtersVisible = filters?.filter((filter) => filter?.filterType?.type === 'select');
    const updateFilter = useCanvasState((state) => state.updateFilter);
    const selectedFilters = useCanvasState((state) => state.filters);
    const valueSelected = !isEmpty(selectedFilters);
    return (
        <section>
            {filtersVisible?.map((filter) => (
                <div className="flex gap-3">
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
                    {valueSelected && (
                        <button onClick={() => updateFilter({})} className="text-xs text-blue-700">
                            Clear Filter
                        </button>
                    )}
                </div>
            ))}
        </section>
    );
}
