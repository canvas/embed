import React from 'react';

type MultiSelectInputProps = {
    value: string;
    onChange: (value: string) => void;
    options: string[][];
};

const MultiSelectInput = ({ value, onChange, options }: MultiSelectInputProps) => {
    return (
        <select
            id="countries"
            className="cursor-pointer border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-300 focus:border-blue-300 block w-full px-2 py-1 w-36"
            onChange={(event) => {
                onChange(event.target.value);
            }}
            value={value || ''}
        >
            <option selected>Select Filter</option>
            {options.map((option) => (
                <option value={option[0]}>{`${option[0]} (${option[1]})`}</option>
            ))}
        </select>
    );
};

export default MultiSelectInput;
