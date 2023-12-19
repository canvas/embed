import React from 'react';
import { ComponentEmbedElement } from '../types';

export const BigNumber = ({ element }: { element: ComponentEmbedElement }) => {
    const formattedValue = element.elementType.formattedValues?.[1];

    // TODO: this px-7 padding should be consolidated with Element.tsx
    return (
        <div className="px-7">
            <h3 className="text-[15px] font-medium text-default/80 mb-1">{element.title}</h3>
            {formattedValue != null && <div className="text-3xl">{formattedValue}</div>}
        </div>
    );
};
