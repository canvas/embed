import React from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas } from '.';

export const renderToTag = (elementId: string, canvasId: string, authToken?: string, host?: string) => {
    const el = document.getElementById(elementId);
    if (!el) return;
    const root = createRoot(el);
    root.render(<Canvas canvasId={canvasId} authToken={authToken} host={host} />);
};
