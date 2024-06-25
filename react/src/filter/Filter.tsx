import React from 'react';
import MultiSelectInput, { SelectOption } from '../components/MultiSelectInput';
import useCanvasState from '../state/useCanvasState';
import { FilterConfig } from '../__rust_generated__/FilterConfig';
import { EmbedResponse } from '../types/EmbedResponse';
import { GlobalSearchComponent } from '../components/SearchComponent';

const Filter = ({ canvasData, filter }: { canvasData: EmbedResponse; filter: FilterConfig }) => {
    const updateFilter = useCanvasState((state) => state.updateFilter);
    const selectedFilters = useCanvasState((state) => state.filters);
    // We are exclusively using the initial filter options from the initial API response
    const [filterOptionsCache, setFilterOptionsCache] = React.useState<SelectOption[] | null>(null);

    if (filter.filterType.type === 'select') {
        const storeId = filter.filterType.storeId;
        if (storeId === null) return null;
        const getFilterOptions = (): SelectOption[] => {
            if (filterOptionsCache) {
                return filterOptionsCache;
            }
            const uniqueValues = canvasData.filters.uniqueValuesV2[storeId];
            if (!uniqueValues) {
                return [];
            }
            setFilterOptionsCache(uniqueValues);
            return uniqueValues;
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
    }

    if (filter.filterType.type === 'search') {
        return (
            <div key={filter.filterId} className="flex gap-3 mx-1">
                <GlobalSearchComponent filterVariable={filter.variable} label={filter.label || ''} />
            </div>
        );
    }
};

export default Filter;
