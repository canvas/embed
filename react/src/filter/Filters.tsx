import React from 'react';
import isEmpty from 'lodash/isEmpty';
import MultiSelectInput from '../components/MultiSelectInput';
import useCanvasState from '../state/useCanvasState';
import { GetCanvasEmbedResponse } from '@/src/rust_types/GetCanvasEmbedResponse';

// Cache mapping filterId to its filterOptions
// We are exclusively using the initial filter options from the initial API response
const filterOptionsCache = new Map<string, string[][]>();

export function Filters({ canvasData }: { canvasData: GetCanvasEmbedResponse }) {
    const filters = canvasData?.filters?.filters;
    const filtersVisible = filters?.filter((filter) => filter?.filterType?.type === 'select');
    const updateFilter = useCanvasState((state) => state.updateFilter);
    const selectedFilters = useCanvasState((state) => state.filters);
    const valueIsSelected = !isEmpty(selectedFilters);

    return (
        <section>
            {filtersVisible?.map((filter) => {
                let filterOptions;

                if (filterOptionsCache.has(filter.filterId)) {
                    filterOptions = filterOptionsCache.get(filter.filterId);
                } else {
                    // @ts-ignore
                    filterOptions = canvasData.filters.uniqueValues[filter.filterType.storeId];
                    filterOptionsCache.set(filter.filterId, filterOptions);
                }

                return (
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
                            options={filterOptions}
                        />
                        {valueIsSelected && (
                            <button onClick={() => updateFilter({})} className="text-xs text-blue-700">
                                Clear Filter
                            </button>
                        )}
                    </div>
                );
            })}
        </section>
    );
}
