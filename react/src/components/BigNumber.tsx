import React from 'react';
import { ComponentEmbedElement } from '../types';
import { isNumeric } from '../util';

export const BigNumber = ({ element }: { element: ComponentEmbedElement }) => {
    const formattedValue = element.elementType.formattedValues?.find((val) => isNumeric(val));

    return <> {formattedValue != null && <div className="text-3xl">{formattedValue}</div>}</>;
};
