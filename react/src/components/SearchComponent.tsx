import React from 'react';
import { ComponentEmbedElement } from '../types';
import useCanvasState from '../state/useCanvasState';
import debounce from 'lodash.debounce';

export const SearchComponent = ({ element, title }: { element: ComponentEmbedElement; title: string }) => {
    const updateFilter = useCanvasState((state) => state.updateFilter);
    const filterVariable = JSON.parse(element.elementType.component.config).filterVariable;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debounceUpdateFilter = React.useCallback(
        debounce((value: string) => {
            updateFilter(filterVariable, [{ value, label: value }]);
        }, 500),
        [updateFilter],
    );

    const [filterValue, setFilterValue] = React.useState<string>('');
    const onFilterChange = (value: string) => {
        setFilterValue(value);
        debounceUpdateFilter(value);
    };

    return (
        <div>
            <div className="text-[15px] font-medium text-default/80">{title}</div>
            <div>
                <input
                    value={filterValue}
                    onChange={(e) => onFilterChange(e.target.value)}
                    className="border py-1 px-2"
                />
            </div>
        </div>
    );
};
