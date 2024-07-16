import React from 'react';
import { TextEmbed } from '../__rust_generated__/TextEmbed';
import DOMPurify from 'dompurify';

const Text = ({ element }: { element: TextEmbed }) => {
    const cleanValue = DOMPurify.sanitize(element.formattedValue);
    return (
        <div
            style={{
                ...(element.fontSize && { fontSize: element.fontSize }),
            }}
            dangerouslySetInnerHTML={{ __html: cleanValue }}
        />
    );
};

export default Text;
