import React from 'react';
import { DropdownMenuCommand, DropdownItem, DropdownMenu } from './DropdownMenu';
import { HorizontalEllipsis } from './icons';

type ElementProps = {
    title?: string;
    children: React.ReactNode;
    elementId: string;
    commands?: Array<DropdownMenuCommand | DropdownItem>;
};

export function Element({ title, children, elementId, commands }: ElementProps): React.ReactElement {
    const elementRef = React.useRef<HTMLDivElement>(null);
    return (
        <div className="flex-1">
            <div
                className={`group rounded-lg border border-transparent hover:border-transparent h-full dark:bg-background`}
                ref={elementRef}
                onMouseUp={(e) => {
                    e.stopPropagation();
                }}
                id={elementId}
            >
                <div className="flex h-12 item-center rounded-lg hover:bg-highlight/50 px-2">
                    <div className="flex flex-1 items-center">
                        <div style={styles.title}>{title}</div>
                    </div>
                    <div className="invisible flex items-center group-hover:visible">
                        {commands && (
                            <div style={styles.icons}>
                                <DropdownMenu commands={commands} onMenuClick={() => {}}>
                                    <HorizontalEllipsis style={{ width: 12 }} />
                                </DropdownMenu>
                            </div>
                        )}
                    </div>
                </div>
                <div className="relative">{children}</div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    title: {
        fontSize: 15,
        fontWeight: 600,
        lineHeight: `21px`,
        cursor: 'text',
        display: 'flex',
    },
    icons: {
        color: '#91939b',
        display: 'flex',
        justifyContent: 'flex-end',
    },
};
