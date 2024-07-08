import React, { ReactElement } from 'react';
import { Scale } from './lib/types';
import { Data, Ordinal } from './lib/types';
import { ellipticalArcCurve, horizontalLine, horizontalLineTo, moveCursorTo, verticalLine } from './svg/path';
import { formatValue } from './lib/format';

export function HorizontalBarChart<DomainValue extends Ordinal>({
    domainScale,
    valueScale,
    data,
    className,
    options,
}: // widestDomainValue,
{
    domainScale: Scale<DomainValue>;
    valueScale: Scale<number>;
    data: Data<DomainValue>;
    className?: string;
    options?: {
        showTotals?: boolean;
    };
    // widestDomainValue: number;
}): ReactElement {
    const barMargin = 8;
    const barRadius = 8;
    const marginBetweenBars = 2;

    const showTotals = options?.showTotals ?? false;

    return (
        <g className={className}>
            {data.map((point) => {
                const y = domainScale.midPoint(point.x);
                const values = Array.isArray(point.y) ? point.y : [point.y];

                let positiveX = valueScale.position(0);
                let negativeX = valueScale.position(0);

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

                    const size = Math.abs(valueScale.size(value));

                    if (size === 0) {
                        return;
                    }

                    const { bandWidth } = domainScale;
                    const margin = Math.max(0.5, Math.min(barMargin, bandWidth / 4), bandWidth / 8);
                    const radius = Math.max(0, Math.min(0.2 * (bandWidth / 2 - 1), barRadius, size));

                    let x;
                    let sign;
                    if (value >= 0) {
                        x = positiveX;
                        positiveX += size;
                        sign = 1;
                    } else {
                        x = negativeX;
                        negativeX -= size;
                        sign = -1;
                    }

                    const lastValue = seriesIndex === lastValueIndex;

                    return (
                        <>
                            <HorizontalBar
                                x={x}
                                y={y}
                                size={lastValue ? sign * size : sign * Math.max(size - marginBetweenBars, 0)}
                                bandWidth={bandWidth}
                                margin={margin}
                                radius={lastValue ? radius : 0}
                                key={seriesIndex}
                                colorIndex={seriesIndex}
                            />

                            {lastValue && showTotals && (
                                <text
                                    style={{ transform: `translate(${x + size}px, ${y}px)` }}
                                    x={8}
                                    y={0}
                                    textAnchor="left"
                                    dominantBaseline="middle"
                                    className="transition-transform stroke-none"
                                >
                                    {formatValue(value, valueScale.format)}
                                </text>
                            )}
                        </>
                    );
                });
            })}
        </g>
    );
}
function HorizontalBar({
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
        moveCursorTo(x, y - bandWidth / 2 + margin),
        horizontalLine(size + radius),

        radius ? ellipticalArcCurve(radius, radius, radius, radius) : '',

        verticalLine(Math.max(0, bandWidth - 2 * radius - 2 * margin)),

        radius ? ellipticalArcCurve(-radius, radius, radius, radius) : '',

        horizontalLineTo(x),
    ].join(' ');

    const cssColor = `var(--theme-light-chart-color-${colorIndex}`;

    return <path d={path} className="opacity-100 hover:opacity-80" style={{ fill: cssColor, stroke: cssColor }} />;
}
