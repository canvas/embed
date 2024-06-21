import React, { ReactElement } from 'react';
import { Scale } from './lib/types';

export function VerticalGrid({
    axis,
    scale,
    yStart,
    yEnd,
}: {
    axis: number[];
    scale: Scale<number>;
    yStart: number;
    yEnd: number;
}): ReactElement {
    return (
        <g>
            {axis.map((point, index) => {
                const x = scale.position(point);
                return (
                    <line
                        key={index}
                        y1={yStart}
                        y2={yEnd}
                        x1={x}
                        x2={x}
                        className={point === 0 ? 'stroke-default' : 'stroke-divider'}
                    />
                );
            })}
        </g>
    );
}
