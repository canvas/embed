import React, { Fragment, ReactElement, useEffect, useRef } from 'react';
import { formatValue } from './lib/format';
import { Ordinal, Scale } from './lib/types';

export function XAxis<DomainValue extends Ordinal>({
    xScale,
    y,
}: {
    xScale: Scale<DomainValue>;
    y: number;
}): ReactElement {
    const ref = useRef<SVGGElement>(null);

    useEffect(() => {
        if (ref.current) {
            removeOverlappedText(ref.current);
        }
    });

    return (
        <g ref={ref}>
            {xScale.ticks.map((tick, index) => {
                const x = xScale.midPoint(tick);
                const transform = `translate(${x}px, ${y}px)`;
                return (
                    <Fragment key={index}>
                        <text
                            style={{ transform }}
                            x={0}
                            y={10}
                            textAnchor="middle"
                            dominantBaseline="hanging"
                            className="fill-current transition-transform"
                        >
                            {formatValue(tick, xScale.format)}
                        </text>
                        <path
                            d={`M 0 0 v 5`}
                            style={{ transform }}
                            className="stroke-faded transition-transform [.hidden+&]:hidden"
                        />
                    </Fragment>
                );
            })}
        </g>
    );
}

export function YAxis({ yScale, width }: { yScale: Scale<number>; width: number }): ReactElement {
    return (
        <g>
            {yScale.ticks.map((tick, index) => {
                const x = width - 4;
                const y = yScale.position(tick);
                return (
                    <text
                        style={{ transform: `translate(${x}px, ${y}px)` }}
                        key={index}
                        textAnchor="end"
                        dominantBaseline="right"
                        alignmentBaseline="middle"
                        className="fill-current transition-transform"
                    >
                        {formatValue(tick, yScale.format)}
                    </text>
                );
            })}
        </g>
    );
}

function removeOverlappedText(parent: SVGGElement) {
    const textElements = [...parent.children].filter((element) => element.tagName === 'text');

    let prev: Element | null = null;
    let rightMost = 0;
    textElements.forEach((element) => {
        if (prev) {
            const prevRect = prev.getBoundingClientRect();
            const rect = element.getBoundingClientRect();

            rightMost = Math.max(rightMost, prevRect.right);

            if (rect.left < rightMost) {
                element.classList.add('hidden');
            }
        }
        prev = element;
    });
}
