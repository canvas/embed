import React, { useState, Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

type Value = string;
type Label = string;
export type SelectOption = [Value, Label];

type MultiSelectInputProps = {
    value: string; // value === '' when default option is selected
    onChange: (value: string) => void;
    options: SelectOption[];
    defaultOption?: string;
};

function getLabel(item: SelectOption) {
    if (item[0] === '') return item[1];
    return `${item[0]}${item[1] ? ` (${item[1]})` : ''}`;
}

// taken from https://headlessui.com/react/listbox
const MultiSelectInputDisplay = ({ value, onChange, options }: MultiSelectInputProps) => {
    return (
        <div className="w-72 z-30">
            <Listbox value={value} onChange={(item) => onChange(item[0])}>
                <div className="relative mt-1">
                    <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                        <span className="block truncate">
                            {getLabel(options.find((item) => item[0] === value) as SelectOption)}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </span>
                    </Listbox.Button>
                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                            {options?.map((option, index) => (
                                <Listbox.Option
                                    key={index}
                                    className={({ active }) =>
                                        `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                            active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'
                                        }`
                                    }
                                    value={option}
                                >
                                    {({ selected }) => (
                                        <>
                                            <span
                                                className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                                            >
                                                {getLabel(option)}
                                            </span>
                                            {selected ? (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                </span>
                                            ) : null}
                                        </>
                                    )}
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </Transition>
                </div>
            </Listbox>
        </div>
    );
};

// Our wrapper that adds default option
const MultiSelectInput = ({ value, onChange, options, defaultOption }: MultiSelectInputProps) => {
    const optionsFinal = defaultOption ? [['', defaultOption] as SelectOption, ...options] : options;
    const valueFinal = value || '';
    return (
        <MultiSelectInputDisplay
            value={valueFinal}
            onChange={onChange}
            options={optionsFinal}
            defaultOption={defaultOption}
        />
    );
};

export default MultiSelectInput;
