import React from 'react';
import MultiSelectInput, { SelectOption } from '../components/MultiSelectInput';
import useCanvasState from '../state/useCanvasState';
import { FilterConfig } from '../__rust_generated__/FilterConfig';
import { EmbedResponse } from '../types/EmbedResponse';
import { GlobalSearchComponent } from '../components/SearchComponent';
import { DateFilterComponent } from './DateFilter';

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
            const uniqueValues = canvasData.filters.uniqueValues[storeId];
            if (!uniqueValues) {
                return [];
            }
            const options = uniqueValues.map((option) => ({ value: option[0], label: option[1] }));
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
    } else if (filter.filterType.type === 'search') {
        return (
            <div key={filter.filterId} className="flex gap-3 mx-1">
                <GlobalSearchComponent filterVariable={filter.variable} label={filter.label || ''} />
            </div>
        );
    } else if (filter.filterType.type === 'date') {
        const defaultValue = canvasData.filters.defaultValues[filter.variable];
        return <DateFilterComponent filter={filter} defaultValue={defaultValue} />;
    }
};

export default Filter;
