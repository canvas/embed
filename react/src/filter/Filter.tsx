import React from 'react';
import MultiSelectInput, { SelectOption } from '../components/MultiSelectInput';
import useCanvasState from '../state/useCanvasState';
import { FilterConfig } from '../__rust_generated__/FilterConfig';
import { EmbedResponse } from '../types/EmbedResponse';

const Filter = ({ canvasData, filter }: { canvasData: EmbedResponse; filter: FilterConfig }) => {
    const updateFilter = useCanvasState((state) => state.updateFilter);
    const selectedFilters = useCanvasState((state) => state.filters);
    // We are exclusively using the initial filter options from the initial API response
    const [filterOptionsCache, setFilterOptionsCache] = React.useState<SelectOption[] | null>(null);

    // currently only Select filters are supported, but remove this as we support more filter types
    if (filter.filterType.type !== 'select' || filter.filterType.storeId == null) {
        return null;
    }
    const storeId = filter.filterType.storeId;

    const getFilterOptions = (): SelectOption[] => {
        if (filterOptionsCache) {
            return filterOptionsCache;
        }
        const uniqueValues = canvasData.filters.uniqueValues[storeId];
        if (!uniqueValues) {
            return [];
        }
        const options = uniqueValues.map((option) => ({ label: option[0], value: option[1] }));
        setFilterOptionsCache(options);
        return options;
    };

    const filterOptions = getFilterOptions();

    return (
        <div key={filter.filterId} className="flex gap-3 mx-1">
            <MultiSelectInput
                selections={selectedFilters[filter.variable] || []}
                onChange={(filters: SelectOption[]) => {
                    const variable = filter.variable;
                    updateFilter(variable, filters);
                }}
                options={filterOptions}
                label={filter.label}
            />
        </div>
    );
};

export default Filter;
