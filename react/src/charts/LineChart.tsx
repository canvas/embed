import React, { ReactElement } from 'react';
import { Scale } from './lib/types';
import { Data, Ordinal } from './lib/types';
import { lineTo, moveCursorTo } from './svg/path';

export function LineChart<DomainValue extends Ordinal>({
    xScale,
    yScale,
    data,
    className,
}: {
    xScale: Scale<DomainValue>;
    yScale: Scale<number>;
    data: Data<DomainValue>;
    className?: string;
}): ReactElement {
    const firstY = data[0]?.y ?? [];
    const seriesCount = (Array.isArray(firstY) ? firstY : [firstY]).length;
    const paths: string[][] = new Array(seriesCount).fill(null).map((_) => {
        return [];
    });
    data.forEach((point, pointIndex) => {
        const values = Array.isArray(point.y) ? point.y : [point.y];

        const x = xScale.midPoint(point.x);

        values.forEach((value, valueIndex) => {
            const y = yScale.position(value as any);

            const command = pointIndex === 0 ? moveCursorTo(x, y) : lineTo(x, y);
            const path = paths[valueIndex];
            if (path) path.push(command);
        });
    });

    return (
        <g className={className}>
            {paths.map((path, index) => {
                const cssColor = `var(--theme-light-chart-color-${index}`;

                return <path key={index} d={path.join(' ')} style={{ stroke: cssColor }} />;
            })}
        </g>
    );
}
