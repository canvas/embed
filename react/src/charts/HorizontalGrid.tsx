import React, { ReactElement } from 'react';
import { Scale } from './lib/types';

export function HorizontalGrid({
    axis,
    scale,
    xStart,
    xEnd,
}: {
    axis: number[];
    scale: Scale<number>;
    xStart: number;
    xEnd: number;
}): ReactElement {
    return (
        <g>
            {axis.map((point, index) => {
                const y = scale.position(point);
                return (
                    <line
                        key={index}
                        x1={xStart}
                        x2={xEnd}
                        y1={y}
                        y2={y}
                        className={point === 0 ? 'stroke-default' : 'stroke-[var(--chart-grid,#E3E3E5)]'}
                    />
                );
            })}
        </g>
    );
}
