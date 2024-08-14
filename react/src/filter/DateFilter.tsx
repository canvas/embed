import { Listbox, ListboxButton, Transition, ListboxOptions, ListboxOption } from '@headlessui/react';
import { debounce } from 'lodash';
import React, { Fragment } from 'react';
import { DateFilterValue } from '../__rust_generated__/DateFilterValue';
import { FilterConfig } from '../__rust_generated__/FilterConfig';
import useCanvasState from '../state/useCanvasState';

const DATE_SELECT_OPTIONS: { label: string; value: DateSelectValue }[] = [
    { label: 'All time', value: 'AllTime' },
    { label: 'Today', value: 'Today' },
    { label: 'This month', value: 'ThisMonth' },
    { label: 'This year', value: 'ThisYear' },
    { label: 'Last 7 days', value: 'Last7Days' },
    { label: 'Last 30 days', value: 'Last30Days' },
    { label: 'Last 90 days', value: 'Last90Days' },
];

export const DateFilterComponent = ({ filter, defaultValue }: { filter: FilterConfig, defaultValue }) => {
    const [filterValue, setFilterValue] = React.useState<DateSelectValue>(defaultValue?.filter.preset ?? 'AllTime');
    const updateFilter = useCanvasState((state) => state.updateFilter);

    const getFilterValue = (selectValue: DateSelectValue): DateFilterValue => {
        switch (selectValue) {
            case 'AllTime':
                return { type: 'preset', preset: 'AllTime' };
            case 'Today':
                return { type: 'preset', preset: 'Today' };
            case 'ThisMonth':
                return { type: 'preset', preset: 'ThisMonth' };
            case 'ThisYear':
                return { type: 'preset', preset: 'ThisYear' };
            case 'Last7Days':
                return { type: 'last', count: 7, datePart: 'days' };
            case 'Last30Days':
                return { type: 'last', count: 30, datePart: 'days' };
            case 'Last90Days':
                return { type: 'last', count: 90, datePart: 'days' };
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debounceUpdateFilter = React.useCallback(
        debounce((value: DateFilterValue) => {
            updateFilter(filter.variable, [{ value: JSON.stringify(value), label: 'date' }] as any);
        }, 500),
        [updateFilter],
    );

    const onFilterChange = (value: DateSelectValue) => {
        setFilterValue(value);
        debounceUpdateFilter(getFilterValue(value));
    };

    const buttonText = DATE_SELECT_OPTIONS.find((option) => option.value === filterValue)?.label || 'Date';

    return (
        <div key={filter.filterId} className="flex gap-3 mx-1">
            <div className="w-64">
                <Listbox
                    value={filterValue}
                    onChange={(item) => {
                        onFilterChange(item);
                    }}
                >
                    <div className="relative">
                        <div className="inline-flex rounded-md shadow-md divide-x divide-gray-300">
                            <ListboxButton className="relative w-64 cursor-pointer rounded-md  bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm truncate">
                                <ListboxButton>{buttonText}</ListboxButton>
                                <ChevronDownIcon
                                    className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-white/60"
                                    aria-hidden="true"
                                />
                            </ListboxButton>
                        </div>
                        <Transition
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                                {DATE_SELECT_OPTIONS.map(({ label, value }) => (
                                    <ListboxOption
                                        className={({ active }) =>
                                            `relative cursor-pointer select-none py-2 pl-10 pr-4 date-filter-option-${value} ${
                                                active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'
                                            }`
                                        }
                                        value={value}
                                        key={value}
                                    >
                                        {() => {
                                            return (
                                                <>
                                                    <span
                                                        className={`block truncate ${
                                                            filterValue === value ? 'font-medium' : 'font-normal'
                                                        }`}
                                                    >
                                                        {label}
                                                    </span>
                                                </>
                                            );
                                        }}
                                    </ListboxOption>
                                ))}
                            </ListboxOptions>
                        </Transition>
                    </div>
                </Listbox>
            </div>
        </div>
    );
};

type DateSelectValue = 'AllTime' | 'Last7Days' | 'Last30Days' | 'Last90Days' | 'Today' | 'ThisMonth' | 'ThisYear';

function ChevronDownIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className={`${className} w-4 h-4`}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
    );
}
