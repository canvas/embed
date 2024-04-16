import React from 'react';
import { ComponentEmbedElement } from '../types';
import { DownToTheRightIcon, UpToTheRightIcon } from '../icons';

export const BigNumber = ({ element, title }: { element: ComponentEmbedElement; title: string }) => {
    const data = element.elementType.data;

    const currentNumber = data && data[0] && data[0][0] ? data[0][0] : null;
    const lastNumber = data && data[0] && data[0][1] ? data[0][1] : null;

    let change: string | null = null;
    let changeIcon: any = null;
    if (currentNumber !== null && lastNumber !== null) {
        const last = parseNumber(lastNumber);
        const current = parseNumber(currentNumber);
        if (last != 0) {
            const over = (current - last) / last;
            change = (Math.abs(over) * 100.0).toLocaleString(undefined, {
                maximumFractionDigits: 1,
            });

            if (over > 0) {
                changeIcon = <UpToTheRightIcon className="h-3" />;
            } else if (over < 0) {
                changeIcon = <DownToTheRightIcon className="h-3" />;
            } else {
                changeIcon = null;
            }
        }
    }

    return (
        <div>
            {title && (
                <div className="flex gap-x-4 items-center mb-1">
                    <div className="text-[15px] font-medium text-default/80">{title}</div>
                    {change ? (
                        <div className="flex items-center gap-1">
                            {changeIcon} {change}%
                        </div>
                    ) : (
                        <></>
                    )}
                </div>
            )}
            <span className="font-big-number text-3xl">{currentNumber} </span>
            {lastNumber ? <span className="text-[15px] text-faded">from {lastNumber}</span> : null}
        </div>
    );
};

export function parseNumber(s: string): number {
    return parseFloat(s.replace(/[,%$]/g, ''));
}
