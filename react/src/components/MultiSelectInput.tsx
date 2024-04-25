import React, { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';

export type SelectOption = {
    value: string;
    label: string;
};

type MultiSelectInputProps = {
    selections: SelectOption[];
    onChange: (options: SelectOption[]) => void;
    options: SelectOption[];
    label: string | null;
};

// taken from https://headlessui.com/react/listbox
const MultiSelectInput = ({ selections, onChange, options, label }: MultiSelectInputProps) => {
    const buttonText = selections.length > 0 ? selections.map((filter) => filter.label).join(', ') : label;
    return (
        <div className="w-72 z-30">
            <Listbox
                value={selections}
                onChange={(items) => {
                    onChange(items);
                }}
                multiple
            >
                <div className="relative mt-1">
                    <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                        <Listbox.Button>{buttonText}</Listbox.Button>
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
                                    {() => {
                                        const selected = selections.map((sel) => sel.value).includes(option.value);
                                        return (
                                            <>
                                                <span
                                                    className={`block truncate ${
                                                        selected ? 'font-medium' : 'font-normal'
                                                    }`}
                                                >
                                                    {option.label}
                                                </span>
                                            </>
                                        );
                                    }}
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </Transition>
                </div>
            </Listbox>
        </div>
    );
};
export default MultiSelectInput;
