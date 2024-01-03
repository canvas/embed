import React from 'react';
import { ComponentEmbedElement } from '../types';

export const BigNumber = ({ element }: { element: ComponentEmbedElement }) => {
    const data = element.elementType.data;

    const currentNumber = data && data[0] && data[0][0] ? data[0][0] : null;

    const formattedValue = currentNumber;

    return <> {formattedValue != null && <div className="text-3xl">{formattedValue}</div>}</>;
};
