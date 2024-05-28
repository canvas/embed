import React, { ReactElement } from 'react';
import { Scale } from './lib/types';
import { Data, Ordinal } from './lib/types';
import { ellipticalArcCurve, horizontalLine, moveCursorTo, verticalLine, verticalLineTo } from './svg/path';

export function VerticalBarChart<DomainValue extends Ordinal>({
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
    const barMargin = 8;
    const barRadius = 8;
    const marginBetweenBars = 2;

    return (
        <g className={className}>
            {data.map((point) => {
                const x = xScale.midPoint(point.x);
                const values = Array.isArray(point.y) ? point.y : [point.y];

                let positiveY = yScale.position(0);
                let negativeY = yScale.position(0);

                let lastValueIndex = 0;
                for (let i = values.length - 1; i >= 0; i--) {
                    if (values[i]) {
                        lastValueIndex = i;
                        break;
                    }
                }

                return values.map((value, seriesIndex) => {
                    if (value === null) {
                        return;
                    }

                    const size = Math.abs(yScale.size(value));

                    if (size === 0) {
                        return;
                    }

                    const { bandWidth } = xScale;
                    const margin = Math.max(0.5, Math.min(barMargin, bandWidth / 4), bandWidth / 8);
                    const radius = Math.max(0, Math.min(0.2 * (bandWidth / 2 - 1), barRadius, size));

                    let y;
                    let sign;
                    if (value >= 0) {
                        y = positiveY;
                        positiveY -= size;
                        sign = 1;
                    } else {
                        y = negativeY;
                        negativeY += size;
                        sign = -1;
                    }

                    const lastValue = seriesIndex === lastValueIndex;

                    return (
                        <VerticalBar
                            x={x}
                            y={y}
                            size={lastValue ? sign * size : sign * Math.max(size - marginBetweenBars, 0)}
                            bandWidth={bandWidth}
                            margin={margin}
                            radius={lastValue ? radius : 0}
                            key={seriesIndex}
                            colorIndex={seriesIndex}
                        />
                    );
                });
            })}
        </g>
    );
}
function VerticalBar({
    x,
    y,
    size,
    bandWidth,
    margin,
    radius,
    colorIndex,
}: {
    x: number;
    y: number;
    size: number;
    bandWidth: number;
    margin: number;
    radius: number;
    colorIndex: number;
}) {
    const path = [
        moveCursorTo(x - bandWidth / 2 + margin, y),
        verticalLine(-size + radius),

        radius ? ellipticalArcCurve(radius, -radius, radius, radius) : '',

        horizontalLine(Math.max(0, bandWidth - 2 * radius - 2 * margin)),

        radius ? ellipticalArcCurve(radius, radius, radius, radius) : '',

        verticalLineTo(y),
    ].join(' ');

    const cssColor = `var(--theme-light-chart-color-${colorIndex}`;

    return <path d={path} className="opacity-100 hover:opacity-80" style={{ fill: cssColor, stroke: cssColor }} />;
}
