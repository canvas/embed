import React from 'react';
import { TextEmbed } from '../rust_types/TextEmbed';

const Text = ({ element }: { element: TextEmbed }) => {
    return (
        <div
            style={{
                ...(element.fontSize && { fontSize: element.fontSize }),
            }}
            className="whitespace-pre"
        >
            {element.formattedValue}
        </div>
    );
};

export default Text;
