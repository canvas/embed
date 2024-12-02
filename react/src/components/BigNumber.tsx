import React, { useEffect, useRef, useState } from 'react';
import { ComponentEmbedElement } from '../types';
import { DownToTheRightIcon, UpToTheRightIcon } from '../icons';
import { formatCell } from '../util/util';

export const BigNumber = ({ element, title }: { element: ComponentEmbedElement; title: string }) => {
    const data = element.elementType.data;
    const config = JSON.parse(element.elementType.component.config);

    const currentNumber = data && data[0] && data[0][0] ? parseNumber(data[0][0]) : null;
    const lastNumber = data && data[0] && data[0][1] ? parseNumber(data[0][1]) : null;

    const delta = data && data[1] && data[1][0] ? parseFloat(data[1][0]) : 0;

    const column = element.elementType.bigNumberColumnMeta;

    const [elapsed, setElapsed] = useState<number>(0);
    const animateRef = useRef<number>();
    const lastAnimateTimestamp = useRef<number | null>(null);

    const currentNumberToDisplay =
        config.animateDeltaColumn && currentNumber ? currentNumber + (delta * elapsed) / 1000 : currentNumber;

    const currentFormatted = currentNumberToDisplay
        ? formatCell(currentNumberToDisplay.toString(), column?.format, column?.sqlType, null)
        : '–';
    const lastFormatted = lastNumber ? formatCell(lastNumber.toString(), column?.format, column?.sqlType, null) : '–';

    function animateTicks(timestamp: number) {
        setElapsed((elapsed) => {
            animateRef.current = requestAnimationFrame(animateTicks);
            return elapsed + (timestamp - (lastAnimateTimestamp.current ?? timestamp));
        });
        lastAnimateTimestamp.current = timestamp;
    }

    useEffect(() => {
        if (config.animateDeltaColumn) {
            animateRef.current = requestAnimationFrame(animateTicks);
        }
        return () => {
            if (animateRef.current) {
                cancelAnimationFrame(animateRef.current);
            }
        };
    }, [config.animateDeltaColumn]);

    let change: string | null = null;
    let changeIcon: any = null;
    if (currentNumber !== null && lastNumber !== null) {
        const last = lastNumber;
        const current = currentNumber;
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
            <span className="font-big-number text-3xl">{currentFormatted} </span>
            {lastNumber ? <span className="text-[15px] text-faded">from {lastFormatted}</span> : null}
        </div>
    );
};

export function parseNumber(s: string): number {
    return parseFloat(s.replace(/[,%$]/g, ''));
}
