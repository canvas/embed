import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { ChartData } from 'src/__rust_generated__/ChartData';
import { XAxis, YAxis } from 'src/charts/Axis';
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
    const height = Math.max(300, _height ?? 0);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (resizeRef.current) {
            setWidth(resizeRef.current.clientWidth ?? 0);
            setHeight(resizeRef.current.clientHeight ?? 0);
        }
    });

    if (!_data) {
        return <>Loading</>;
    }

    const xAxisHeight = 24;
    const yAxisWidth = 40;

    const topMargin = 16;
    const bottomMargin = 4;
    const rightMargin = 8;
    const planePadding = 8;

    const domainValues = (_data.labels ?? []).map(parseDomainValue);
    const values = _data.values.map((series) => series.map(parseFloat));

    if (values.length === 0) {
        return <div className="flex justify-center h-[300px] items-center">No data.</div>;
    }

    const domainTypes = [...new Set(domainValues.map((value) => value.type))];

    const planeLeft = yAxisWidth + planePadding;
    const planeRight = width - planePadding - rightMargin;

    let domain;
    let xScale;
    if (domainTypes.length === 1 && domainTypes[0] === 'date') {
        domain = domainValues.map((value) => (value.value as DateTime).toJSDate());

        xScale = dateTimeScale(domain, [planeLeft, planeRight]);
    } else if (domainTypes.length === 1 && domainTypes[0] === 'number') {
        domain = domainValues.map((value) => value.value) as number[];

        const xScaleFn = _data.xAxisType === 'logarithmic' ? logarithmicScale : linearScale;
        xScale = xScaleFn(domain, [planeLeft, planeRight], { lastTick: 'trim' });
    } else {
        domain = domainValues.map((value) => value.value.toString());

        xScale = categoricalScale(domain, [planeLeft, planeRight]);
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

    const planeTop = topMargin;
    const planeBottom = height - xAxisHeight - bottomMargin - 1;

    const yScaleFn = _data.yAxisType === 'logarithmic' ? logarithmicScale : linearScale;
    const yScale = yScaleFn(range, [planeBottom, planeTop], { lastTick, format });

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
            <div ref={resizeRef}>
                <svg width={_width} height={_height}>
                    <XAxis xScale={xScale as any} y={yScale.rangeMin} />
                    <YAxis yScale={yScale} width={yAxisWidth} />

                    <HorizontalGrid axis={yScale.ticks} scale={yScale} xStart={yAxisWidth} xEnd={width} />

                    {(() => {
                        if (_data.chartType === 'bar') {
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
