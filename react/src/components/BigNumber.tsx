import React from 'react';
import { ComponentEmbedElement } from '../types';

export const BigNumber = ({ element }: { element: ComponentEmbedElement }) => {
    const formattedValue = element.elementType.formattedValues?.[1];

    return <> {formattedValue != null && <div className="text-3xl">{formattedValue}</div>}</>;
};
