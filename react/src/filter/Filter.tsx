import React from 'react';
import isEmpty from 'lodash/isEmpty';
import MultiSelectInput from '../components/MultiSelectInput';
import useCanvasState from '../state/useCanvasState';
import { GetCanvasEmbedResponse } from '@/src/rust_types/GetCanvasEmbedResponse';
import { FilterConfig } from '../rust_types/FilterConfig';

const Filter = ({ canvasData, filter }: { canvasData: GetCanvasEmbedResponse; filter: FilterConfig }) => {
    const updateFilter = useCanvasState((state) => state.updateFilter);
    const selectedFilters = useCanvasState((state) => state.filters);
    const valueIsSelected = !isEmpty(selectedFilters);
    // Cache mapping filterId to its filterOptions
    // We are exclusively using the initial filter options from the initial API response
    const [filterOptionsCache, setFilterOptionsCache] = React.useState<Record<string, string[][]>>({});

    // currently only Select filters are supported, but remove this as we support more filter types
    if (filter.filterType.type !== 'select' || filter.filterType.storeId == null) {
        return null;
    }

    let filterOptions;

    if (filter.filterId in filterOptionsCache) {
        filterOptions = filterOptionsCache[filter.filterId];
    } else {
        filterOptions = canvasData.filters.uniqueValues[filter.filterType.storeId];
        setFilterOptionsCache((prev) => ({ ...prev, [filter.filterId]: filterOptions }));
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
                options={filterOptions}
            />
            {valueIsSelected && (
                <button onClick={() => updateFilter({})} className="text-xs text-blue-700">
                    Clear Filter
                </button>
            )}
        </div>
    );
};

export default Filter;
