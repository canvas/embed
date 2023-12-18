import React from 'react';

export const BigNumber = ({ element }) => {
    // TODO: this px-7 padding should be consolidated with Element.tsx
    return (
        <div className="px-7">
            <h3 className="text-[15px] font-medium text-default/80 mb-1">{element.title}</h3>
            <div className="text-3xl">{element.elementType.grid.data[1].value.formatted_value}</div>
        </div>
    );
};
