import React from 'react';
import useCanvasState from '../state/useCanvasState';
import debounce from 'lodash.debounce';
import { Input } from '@headlessui/react';

export const InlineSearchComponent = ({ filterVariable, label }: { filterVariable: string; label: string }) => {
    const updateFilter = useCanvasState((state) => state.updateFilter);

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
            <div className="text-[15px] font-medium text-default/80">{label}</div>
            <div>
                <Input
                    value={filterValue}
                    onChange={(e) => onFilterChange(e.target.value)}
                    className="border py-1 px-2"
                />
            </div>
        </div>
    );
};

export const GlobalSearchComponent = ({ filterVariable, label }: { filterVariable: string; label: string }) => {
    const updateFilter = useCanvasState((state) => state.updateFilter);

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
        <>
            <Input
                className="w-64 rounded-md shadow-md py-2 pl-3 pr-10 text-left border-none sm:text-sm truncate"
                value={filterValue}
                onChange={(e) => onFilterChange(e.target.value)}
                placeholder={label}
            />
        </>
    );
};
