import React, { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CloseIcon } from '../icons';

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
        <div className="mt-2 flex rounded-md shadow-sm">
            <div className="w-72 z-30">
                <Listbox
                    value={selections}
                    onChange={(items) => {
                        onChange(items);
                    }}
                    multiple
                >
                    <div className="relative">
                        <div className="inline-flex rounded-md shadow-md divide-x divide-gray-300">
                            <Listbox.Button className="relative w-64 cursor-pointer rounded-r-none rounded-l-md  bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm truncate">
                                <Listbox.Button>{buttonText}</Listbox.Button>
                            </Listbox.Button>
                            <div
                                onClick={() => onChange([])}
                                className="inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-white shadow-sm cursor-pointer"
                            >
                                <CloseIcon className="-ml-0.5 h-3 w-3 text-gray-400" aria-hidden="true" />
                            </div>
                        </div>
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
        </div>
    );
};
export default MultiSelectInput;
