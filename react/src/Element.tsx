import React from 'react';

type ElementProps = {
    title: string;
    children: React.ReactNode;
    elementId: string;
};

export function Element({ title, children, elementId }: ElementProps): React.ReactElement {
    const elementRef = React.useRef<HTMLDivElement>(null);
    return (
        <figure className="flex-1 max-w-[900px]">
            <div
                className={`group rounded-lg border 
                  border-transparent hover:border-transparent
              h-full max-w-[calc(100vw-48px)] dark:bg-background`}
                ref={elementRef}
                onMouseUp={(e) => {
                    e.stopPropagation();
                }}
                id={elementId}
            >
                <div className="flex h-12 items-center rounded-lg padding-canvas-element hover:bg-highlight/50">
                    <div className="flex flex-1 items-center">
                        <div style={styles.title}>{title}</div>
                    </div>
                </div>
                <div className="mx-6 h-px bg-border dark:bg-faded/50" />
                <div style={styles.content} className="relative">
                    {children}
                </div>
            </div>
        </figure>
    );
}

const styles: Record<string, React.CSSProperties> = {
    title: {
        fontSize: 15,
        fontWeight: 600,
        lineHeight: `21px`,
        cursor: 'text',
    },
    icons: {
        color: '#91939b',
        display: 'flex',
        justifyContent: 'flex-end',
    },
    content: {
        padding: 24,
    },
};
