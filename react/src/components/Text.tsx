import React from 'react';
import { TextEmbed } from '../__rust_generated__/TextEmbed';

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
