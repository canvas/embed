import React, { ReactElement, RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChartData } from 'src/__rust_generated__/ChartData';
import { HorizontalXAxis, HorizontalYAxis, XAxis, YAxis } from 'src/charts/Axis';
import { HorizontalGrid } from 'src/charts/HorizontalGrid';
import { LineChart } from 'src/charts/LineChart';
import { VerticalBarChart } from 'src/charts/VerticalBarChart';
import { categoricalScale } from 'src/charts/scale/categorical';
import { dateTimeScale } from 'src/charts/scale/datetime';
import { linearScale } from 'src/charts/scale/linear';
import { logarithmicScale } from 'src/charts/scale/logarithmic';
import { parseDateTimeNtz } from 'src/util/DateUtil';
import { DateTime } from 'luxon';
import { ChartTheme } from './ChartTheme';
import { Theme } from 'src/components/layout/themes/theme.util';
import { HorizontalBarChart } from 'src/charts/HorizontalBarChart';
import { formatValue } from 'src/charts/lib/format';
import { VerticalGrid } from 'src/charts/VerticalGrid';

type Props = {
    data: ChartData | undefined;
    theme: Theme;
};

/* This is an adapter for the new charts using the old chart data
   so that we don't have to wreck the new library with hacks during the move.
*/
export function SvgChart({ data: _data, theme }: Props): ReactElement {
    const resizeRef = useRef<HTMLDivElement>(null);
    const [_width, setWidth] = useState<number | undefined>(undefined);
    const [_height, setHeight] = useState<number | undefined>(400);

    const width = _width ?? 600;
    const height = Math.max(100, _height ?? 0);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (resizeRef.current) {
            setWidth(resizeRef.current.clientWidth ?? 0);
            setHeight(resizeRef.current.clientHeight ?? 0);
        }
    });

    const yAxisRef = useRef<SVGGElement>(null);
    const yAxisTextWidth = useElementWidth(yAxisRef);

    if (!_data) {
        return <>Loading</>;
    }

    const xAxisHeight = 24;
    const yAxisWidth = yAxisTextWidth + 20;

    const topMargin = 16;
    const bottomMargin = 4;
    const rightMargin = 8;
    const planePadding = 8;

    const domainValues = (_data.labels ?? []).map(parseDomainValue);
    const values = _data.values.map((series) => series.map(parseFloat));

    if (values.length === 0) {
        return <div className="flex h-[300px] items-center justify-center">No data.</div>;
    }

    const domainTypes = [...new Set(domainValues.map((value) => value.type))];

    const horizontalChart = _data.chartType === 'bar' && _data.horizontal;

    const _planeLeft = yAxisWidth + planePadding;
    const _planeRight = width - planePadding - rightMargin;

    const _planeTop = topMargin;
    const _planeBottom = height - xAxisHeight - bottomMargin - 1;

    let xPlaneStart, xPlaneEnd, yPlaneStart, yPlaneEnd;

    if (_data.horizontal) {
        yPlaneStart = _planeLeft;
        yPlaneEnd = _planeRight;
        xPlaneStart = _planeTop;
        xPlaneEnd = _planeBottom;
        if (_data.showBarTotals) {
            yPlaneEnd -= 20;
        }
    } else {
        xPlaneStart = _planeLeft;
        xPlaneEnd = _planeRight;
        yPlaneStart = _planeBottom;
        yPlaneEnd = _planeTop;
    }

    let domain;
    let xScale: any;
    let horizontalXAxisMargin = 0;
    if (domainTypes.length === 1 && domainTypes[0] === 'date') {
        domain = domainValues.map((value) => (value.value as DateTime).toJSDate());

        xScale = dateTimeScale(domain, [xPlaneStart, xPlaneEnd]);
    } else if (domainTypes.length === 1 && domainTypes[0] === 'number') {
        domain = domainValues.map((value) => value.value) as number[];

        const xScaleFn = _data.xAxisType === 'logarithmic' ? logarithmicScale : linearScale;
        xScale = xScaleFn(domain, [xPlaneStart, xPlaneEnd], { lastTick: 'trim' });
    } else {
        domain = domainValues.map((value) => value.value.toString());

        xScale = categoricalScale(domain, [xPlaneStart, xPlaneEnd]);
    }

    if (horizontalChart && yAxisWidth < 10) {
        const widestTick = Math.max(...domain.map((tick) => formatValue(tick, xScale?.format).length));
        horizontalXAxisMargin = widestTick * 5;
        yPlaneStart = Math.min(yPlaneStart + horizontalXAxisMargin, yPlaneEnd);
    }

    let data = domain.map((domainValue, index) => {
        return { x: domainValue, y: values.map((series) => series[index] ?? null) };
    });

    let format;

    switch (_data.seriesFormat.type) {
        case 'Money_v2':
            format = { type: 'currency', currency: 'USD' } as const;
            break;
        case 'Percent_v2':
            format = { type: 'percent' } as const;
            break;
        default:
            format = { type: 'decimal' } as const;
            break;
    }

    let lastTick: 'extend' | 'max' = 'extend';

    if (_data.stackType === 'onehundredpercent') {
        data = data.map((value) => {
            const sum = value.y.reduce((acc: number, v: number | null) => acc + (v ?? 0), 0);
            return { x: value.x, y: value.y.map((v) => (v !== null && sum ? v / sum : null)) };
        });
        format = { type: 'percent' } as const;
        lastTick = 'max';
    }

    const range = data.map((series) => series.y.reduce((acc: number, v: number | null) => acc + (v ?? 0), 0));

    const yScaleFn = _data.yAxisType === 'logarithmic' ? logarithmicScale : linearScale;
    const yScale = yScaleFn(range, [yPlaneStart, yPlaneEnd], { lastTick, format });

    if (!xScale || !yScale) {
        // TODO
        return (
            <div className="flex justify-center">
                Chart type currently unsupported in embeds. Please contact Canvas support
            </div>
        );
    }

    return (
        <ChartTheme data={_data} theme={theme}>
            <div ref={resizeRef} className="max-h-[90vh]">
                <svg width={_width} height={_height}>
                    <g ref={yAxisRef}>
                        {horizontalChart ? (
                            <HorizontalXAxis xScale={xScale as any} x={yScale.rangeMin - 12} />
                        ) : (
                            <YAxis yScale={yScale} width={yAxisWidth} />
                        )}
                    </g>

                    {horizontalChart ? (
                        <HorizontalYAxis yScale={yScale} y={xPlaneEnd + 8} />
                    ) : (
                        <XAxis xScale={xScale as any} y={yScale.rangeMin} />
                    )}

                    {horizontalChart ? (
                        <VerticalGrid
                            axis={yScale.ticks}
                            scale={yScale}
                            yStart={xScale.rangeMin}
                            yEnd={xScale.rangeMax}
                        />
                    ) : (
                        <HorizontalGrid axis={yScale.ticks} scale={yScale} xStart={yAxisWidth} xEnd={width} />
                    )}

                    {(() => {
                        if (_data.chartType === 'bar' && _data.horizontal) {
                            return (
                                <HorizontalBarChart
                                    domainScale={xScale as any}
                                    valueScale={yScale}
                                    data={data}
                                    options={{ showTotals: _data.showBarTotals }}
                                    className="stroke-1"
                                />
                            );
                        } else if (_data.chartType === 'bar') {
                            return (
                                <VerticalBarChart
                                    xScale={xScale as any}
                                    yScale={yScale}
                                    data={data}
                                    className="fill-[#5ba8f7] stroke-[#5ba8f7] stroke-1"
                                />
                            );
                        } else if (_data.chartType === 'line') {
                            return (
                                <LineChart
                                    xScale={xScale as any}
                                    yScale={yScale}
                                    data={data}
                                    className="fill-none stroke-[#5ba8f7] stroke-2"
                                />
                            );
                        } else {
                            return (
                                <text
                                    x={(xScale.rangeMax + xScale.rangeMin) / 2}
                                    y={(yScale.rangeMax + yScale.rangeMin) / 2}
                                    textAnchor="middle"
                                >
                                    Chart type currently unsupported in embeds. Please contact Canvas support
                                </text>
                            );
                        }
                    })()}
                </svg>
            </div>
        </ChartTheme>
    );
}

type Value = { type: 'number'; value: number } | { type: 'date'; value: DateTime } | { type: 'string'; value: string };
function parseDomainValue(value: string): Value {
    const ntzParse = parseDateTimeNtz(value);
    if (ntzParse.isValid) return { type: 'date', value: ntzParse };

    const pivotMonthParse = DateTime.fromFormat(value, 'yyyy-MMMM');
    if (pivotMonthParse.isValid) return { type: 'date', value: pivotMonthParse };

    const ymdParse = DateTime.fromFormat(value, 'yyyy-M-dd');
    if (ymdParse.isValid) return { type: 'date', value: ymdParse };

    try {
        const parsedNumber = parseFloat(value);
        if (Number.isNaN(parsedNumber)) {
            return { type: 'string', value };
        }
        return { type: 'number', value: parsedNumber };
    } catch {
        return { type: 'string', value };
    }
}

function useElementWidth<DOMElement extends Element>(elementRef: RefObject<DOMElement>) {
    const [width, setWidth] = useState(0);

    useLayoutEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            if (entries.length > 0) {
                const lastEntry = entries[entries.length - 1];
                if (lastEntry && lastEntry.contentRect.width != width) {
                    setWidth(lastEntry.contentRect.width);
                }
            }
        });

        if (elementRef.current) {
            resizeObserver.observe(elementRef.current);
        }

        return () => {
            resizeObserver.disconnect();
        };
    });

    return width;
}
