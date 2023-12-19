import React from 'react';
import isEmpty from 'lodash/isEmpty';
import MultiSelectInput from '../components/MultiSelectInput';
import useCanvasState from '../state/useCanvasState';
import { GetCanvasEmbedResponse } from '@/src/rust_types/GetCanvasEmbedResponse';

export function Filters({ canvasData }: { canvasData: GetCanvasEmbedResponse }) {
    const filters = canvasData?.filters?.filters;
    const filtersVisible = filters?.filter((filter) => filter?.filterType?.type === 'select');
    const updateFilter = useCanvasState((state) => state.updateFilter);
    const selectedFilters = useCanvasState((state) => state.filters);
    const valueIsSelected = !isEmpty(selectedFilters);

    return (
        <section>
            {filtersVisible?.map((filter) => (
                <div key={filter.filterId} className="flex gap-3">
                    <MultiSelectInput
                        value={selectedFilters[filter.variable]}
                        onChange={(item: string) => {
                            if (item === '' || item == null) {
                                updateFilter({});
                                return;
                            }
                            const variable = filter.variable;
                            updateFilter({ [variable]: item });
                        }}
                        defaultOption="Select Filter"
                        // @ts-ignore
                        options={canvasData.filters.uniqueValues[filter.filterType.storeId]}
                    />
                    {valueIsSelected && (
                        <button onClick={() => updateFilter({})} className="text-xs text-blue-700">
                            Clear Filter
                        </button>
                    )}
                </div>
            ))}
        </section>
    );
}
