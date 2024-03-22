import '../styles/charts.less';
import '../styles/highcharts.less';

import React from 'react';
import { HighchartsReact as HighchartsReactComponent } from 'highcharts-react-official';
import HighchartsReact from 'highcharts-react-official';
import Highcharts, { PointOptionsObject } from 'highcharts';
import Funnel from 'highcharts/modules/funnel';
import Sankey from 'highcharts/modules/sankey';
import Bullet from 'highcharts/modules/bullet';
import HCMore from 'highcharts/highcharts-more';
import exportingModule from 'highcharts/modules/exporting';
import { parseDateTimeNtz, parseDateTimeTz } from './DateUtil';
import { DateTime } from 'luxon';
import moment from 'moment-timezone';
import { ChartData } from './rust_types/ChartData';
import { Format } from './rust_types/Format';
import { ChartDataSeriesConfig } from './rust_types/ChartDataSeriesConfig';
import { Theme, colorTable } from './theme.util';

type YAxes = Highcharts.YAxisOptions | Highcharts.YAxisOptions[];

type SeriesChartType = 'column' | 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'waterfall' | 'funnel' | 'bullet';

Funnel(Highcharts);
Sankey(Highcharts);
Bullet(Highcharts);
HCMore(Highcharts);
exportingModule(Highcharts);

const OTHER_COLOR_INDEX = 100;

function isNumeric(str: string) {
    if (typeof str === 'number' || typeof str === 'bigint') return true;
    if (typeof str != 'string') return false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return !isNaN(str as any) && !isNaN(parseFloat(str)) && isFinite(parseFloat(str));
}

type TargetData = {
    data: { x: string | number; y: number }[];
    label: string;
};

function getTargetData(chartData: ChartData, domainLabels: (string | number)[]): TargetData[] {
    return chartData.targets.map((target) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const data = target.columns.map((col, index) => ({ x: domainLabels[index]!, y: parseFloat(col) }));
        const label = target.label;
        return {
            data,
            label,
        };
    });
}

function getColors(data: ChartData, theme: Theme): { lightColors: string[]; darkColors: string[] } {
    let colorDimension = data.colorDimension;

    if (colorDimension === 'automatic') {
        const isDomainCategorical = data.domainCategory && ['nominal', 'ordinal'].includes(data.domainCategory);

        if (data.chartType === 'pie') {
            colorDimension = 'categories';
        } else if (isDomainCategorical && data.seriesNames.length < 2) {
            colorDimension = 'categories';
        } else {
            colorDimension = 'series';
        }
    }

    let steps: number;
    switch (colorDimension) {
        case 'categories':
            steps = data.values[0]?.length || 1;
            break;
        case 'series':
            steps = data.seriesNames.length;
            break;
        case 'none':
            steps = 1;
            break;
    }
    return {
        lightColors: colorTable(data.colorTheme, steps, theme, false),
        darkColors: colorTable(data.colorTheme, steps, theme, true),
    };
}

type ChartColors = {
    lightColors: string[];
    darkColors: string[];
};

type ChartProps = {
    data: ChartData | undefined;
    title: string;
    timezone: string | null;
    theme: Theme;
};

export type ChartHandle = {
    download: () => void;
};
export const Chart = React.forwardRef<ChartHandle, ChartProps>(function HighchartChart(props: ChartProps, ref) {
    const chartRef = React.useRef<HighchartsReact.RefObject>(null);
    const { data, title, timezone, theme } = props;
    const colors = React.useMemo(() => {
        if (data) {
            return getColors(data, theme);
        }
    }, [data, theme]);

    const responsive = {
        rules: [
            {
                condition: {
                    maxWidth: 500,
                },
                chartOptions: {
                    legend: {
                        align: 'center' as const,
                        verticalAlign: 'bottom' as const,
                        layout: 'horizontal' as const,
                    },
                },
            },
        ],
    };

    React.useImperativeHandle(ref, () => ({
        download: () => {
            if (data && colors) {
                const options = getOptions(data, colors, responsive, true, timezone);
                chartRef.current?.chart.exportChart({ filename: title }, options);
            }
        },
    }));

    if (!data || !colors) {
        const options: Highcharts.Options = {
            chart: {
                type: 'bar',
                styledMode: true,
            },
            title: { text: undefined },
            credits: { enabled: false },
            responsive,
            accessibility: { enabled: false },
        };
        return (
            <div>
                <HighchartsReactComponent highcharts={Highcharts} options={options} ref={chartRef} />
            </div>
        );
    }

    const options = getOptions(data, colors, responsive, false, timezone);

    const cssColorVars: { [v: string]: string } = {};
    const { lightColors, darkColors } = colors;

    lightColors.forEach((color, index) => {
        cssColorVars[`--theme-light-chart-color-${index}`] = color;
    });
    darkColors.forEach((color, index) => {
        cssColorVars[`--theme-dark-chart-color-${index}`] = color;
    });

    return (
        <div style={cssColorVars}>
            <HighchartsReactComponent highcharts={Highcharts} options={options} ref={chartRef} />
        </div>
    );
});

export function guessPrecisionAndFormatNumber(value: number, comparableValue: number): string {
    // don't show K or M if its zero
    if (value === 0) {
        return '0';
    }

    let unitSuffix = '';
    let divisor = 1;

    if (comparableValue >= 1_000_000_000) {
        unitSuffix = 'B';
        divisor = 1_000_000_000;
    } else if (comparableValue >= 1_000_000) {
        unitSuffix = 'M';
        divisor = 1_000_000;
    } else if (comparableValue >= 1000) {
        unitSuffix = 'k'; // intentionally k, not K
        divisor = 1_000;
    } else {
        unitSuffix = '';
        divisor = 1;
    }

    const displayValue = value / divisor;

    // This simulates -1 precision, but caps it at 1 (instead of 20)
    // https://github.com/highcharts/highcharts/blob/d79c147bda75155d0666a8fab33a9f335eb73251/ts/Core/Templating.ts#L392C9-L393C1
    // todo(wpride): noUncheckedIndexedAccess
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const origDec = (displayValue.toString().split('.')[1] || '').split('e')[0]!.length;

    const precision = Math.min(origDec, 1);

    const { decimal, group } = getSeparator();

    return Highcharts.numberFormat(displayValue, precision, decimal, group) + unitSuffix;
}

function getSeparator(): { decimal: string; group: string } {
    const numberWithGroupAndDecimalSeparator = 1000.1;
    const formatted = Intl.NumberFormat().formatToParts(numberWithGroupAndDecimalSeparator);
    const decimal = formatted.find((part) => part.type === 'decimal')?.value || '.';
    const group = formatted.find((part) => part.type === 'group')?.value || ',';
    return { decimal, group };
}

enum DomainType {
    String,
    Numeric,
    Date,
}
const getFormattedLabel = (
    data: ChartData,
    value: number | null | undefined,
    format: Format,
    seriesIndex: number,
    exactPrecision: boolean,
): string => {
    // todo(wpride): noUncheckedIndexedAccess
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const seriesData = data.values[seriesIndex]!;
    const max = Math.max(...seriesData.map((datum) => parseFloat(datum)).filter((datum) => !isNaN(datum)));

    const getFormat = () => {
        if (format.type === 'Money_v2') {
            return { prefix: '$', suffix: '' };
        }
        if (format.type === 'Percent_v2') {
            return { suffix: '%', prefix: '' };
        }
        return { suffix: '', prefix: '' };
    };
    const getPrecision = () => {
        if (!exactPrecision) return -1;
        if (format.type === 'Money_v2' || format.type === 'Percent_v2') {
            return format.precision;
        }
        return -1;
    };
    if (value === null || value === undefined) {
        return 'Unknown';
    }
    const comparableValue = isNaN(max) || !isFinite(max) ? value : max;
    const { prefix, suffix } = getFormat();
    const precision = getPrecision();
    if (exactPrecision) {
        const { decimal, group } = getSeparator();
        return prefix + Highcharts.numberFormat(value, precision, decimal, group) + suffix;
    }

    const formatted = guessPrecisionAndFormatNumber(value, comparableValue);

    return `${prefix}${formatted}${suffix}`;
};

type CategoryPoint = { name: string | undefined; y: number; colorIndex?: number; className?: string };
type ContinuousPoint = { x: number; y: number; className?: string };
type BulletPoint = { target: number; y: number; className?: string };

type CategorySeries = { type: 'category'; series: CategoryPoint[] };
type ContinuousSeries = { type: 'continuous'; series: ContinuousPoint[] };
type BulletSeries = { type: 'bullet'; series: BulletPoint[]; categories: string[] };

const getSeriesData = (
    chartType: SeriesChartType,
    data: ChartData,
    series: string[],
    domainLabels: (string | number)[],
    domainType: DomainType,
    seriesFormat: Format,
    targetData: TargetData[],
): CategorySeries | ContinuousSeries | BulletSeries => {
    if (chartType === 'pie') {
        return { type: 'category', series: getTopChartValues(data) };
    }

    let seriesData = series.map((x: string, index: number) => {
        const y = parseFloat(x);
        const targetValue = targetData[0]?.data[index];
        if (targetValue !== undefined) {
            if (targetValue.y > y) {
                return {
                    x: domainLabels[index],
                    y: parseFloat(x),
                    className: 'pacing-negative-point',
                    target: targetValue.y,
                };
            } else {
                return {
                    x: domainLabels[index],
                    y: parseFloat(x),
                    className: 'pacing-positive-point',
                    target: targetValue.y,
                };
            }
        } else {
            return { x: domainLabels[index], y: parseFloat(x) };
        }
    });
    if (domainType === DomainType.Date) {
        seriesData.sort((a, b) => (a.x as number) - (b.x as number));
    }
    if (seriesFormat.type === 'Percent_v2') {
        seriesData = seriesData.map((datum) => ({ ...datum, y: (datum.y as number) * 100 }));
    }

    if (chartType === 'bullet') {
        const response: BulletSeries = {
            type: 'bullet',
            series: seriesData.map((datum) => ({
                y: datum.y,
                target: datum.target as number,
                className: datum.className,
                label: datum.x,
            })),
            categories: seriesData.map((datum) => datum.x as string),
        };
        return response;
    }

    if (domainType === DomainType.String) {
        return {
            type: 'category',
            series: seriesData.map(({ x, y, className }) => ({ name: x as string, y, className })),
        };
    }
    return {
        type: 'continuous',
        series: seriesData.map(({ x, y, className }) => ({ x: x as number, y, className })),
    };
};

const getDomainLabelsAndType = (data: ChartData): [(string | number)[], DomainType] => {
    let isDate = true;
    let isNumber = true;
    const domainNumericParse = data.labels.map((datum) => {
        if (!isNumeric(datum)) {
            isNumber = false;
        }
        return parseFloat(datum);
    });
    const domainDateParse = data.labels.map((datum) => {
        const isoDateParse = DateTime.fromISO(datum);
        const snowflakeNtzParse = parseDateTimeNtz(datum);
        const extendedDateParse = parseDateTimeTz(datum);
        if (isoDateParse.isValid) {
            return isoDateParse.toMillis();
        } else if (snowflakeNtzParse.isValid) {
            return snowflakeNtzParse.toMillis();
        } else if (extendedDateParse.isValid) {
            return extendedDateParse.toMillis();
        }
        isDate = false;
        return Date.parse(datum);
    });
    // important that number goes first, because many numbers will parse as dates
    if (isNumber) {
        return [domainNumericParse, DomainType.Numeric];
    }
    if (isDate) {
        return [domainDateParse, DomainType.Date];
    }
    return [data.labels, DomainType.String];
};

const getYAxis = (data: ChartData): [number[], YAxes] => {
    if (data.chartType === 'bullet') {
        return [[], { visible: false }];
    }
    const defaultYAxis: Highcharts.YAxisOptions = {
        title: {
            text: data.yAxisTitle,
        },
        min: data.margin?.yAxisMinimum,
        max: data.margin?.yAxisMaximum,
        labels: {
            formatter(this: Highcharts.AxisLabelsFormatterContextObject) {
                if (typeof this.value === 'string') {
                    return this.value;
                }
                return getFormattedLabel(data, this.value, data.seriesFormat, 0, false);
            },
        },
    };
    const usesMultipleYAxis = Object.values(data.seriesConfigs).find((config) => config.secondYAxis);
    if (!usesMultipleYAxis) {
        return [[], defaultYAxis];
    }
    const axisList: number[] = [];
    const yAxes: YAxes = [defaultYAxis];
    for (const [index, columnId] of data.seriesColumnIds.entries()) {
        const seriesConfig: ChartDataSeriesConfig | undefined = data.seriesConfigs[columnId];
        const format = seriesConfig?.format || data.seriesFormat;
        const seriesName = data.seriesNames[index];
        const opposite = !!seriesConfig?.secondYAxis;
        if (!opposite) {
            axisList.push(0);
            continue;
        }
        yAxes.push({
            title: { text: seriesName },
            min: data.margin?.yAxisMinimum,
            max: data.margin?.yAxisMaximum,
            opposite,
            labels: {
                formatter(this: Highcharts.AxisLabelsFormatterContextObject) {
                    if (typeof this.value === 'string') {
                        return this.value;
                    }
                    return getFormattedLabel(data, this.value, format, index, false);
                },
            },
        });
        axisList.push(yAxes.length - 1);
    }
    return [axisList, yAxes];
};

function getOptions(
    data: ChartData,
    colors: ChartColors,
    responsive: Highcharts.ResponsiveOptions,
    exporting: boolean,
    timezone: string | null,
): Highcharts.Options {
    let chartType: SeriesChartType = 'line';
    switch (data.chartType) {
        case 'line':
            chartType = 'line';
            break;
        case 'bar':
        case 'combo':
            if (data.horizontal === true) {
                chartType = 'bar';
            } else {
                chartType = 'column';
            }
            break;
        case 'scatter':
            chartType = 'scatter';
            break;
        case 'funnel':
            chartType = 'funnel';
            break;
        case 'pie':
        case 'donut':
            chartType = 'pie';
            break;
        case 'area':
            chartType = 'area';
            break;
        case 'bullet':
            chartType = 'bullet';
            break;
        default:
            console.warn(`Unrecognized chartType ${data.chartType}`);
    }
    let stacking: Highcharts.OptionsStackingValue | undefined = 'normal';
    if (data.stackType) {
        switch (data.stackType) {
            case 'none':
                stacking = undefined;
                break;
            case 'onehundredpercent':
                stacking = 'percent';
                break;
            case 'standard':
                stacking = 'normal';
        }
    }
    const { lightColors } = colors;
    const [domainLabels, domainType] = getDomainLabelsAndType(data);
    const [axisList, yAxis] = getYAxis(data);

    const targetData = getTargetData(data, domainLabels);
    const hasTargets = targetData.length > 0;
    let bulletCategories: string[] | null = null;
    const series = data.values.map((series: string[], seriesIndex: number) => {
        const getSeriesChartType = (): SeriesChartType => {
            if (data.chartType !== 'combo') return chartType;
            const seriesFormat = data.seriesFormats && data.seriesFormats[seriesIndex];
            if (!seriesFormat) return 'column';
            if (seriesFormat === 'bar') return 'column';
            return seriesFormat;
        };
        const seriesChartType = getSeriesChartType();
        // todo(wpride): noUncheckedIndexedAccess
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const seriesColumnId = data.seriesColumnIds[seriesIndex]!;
        const seriesConfig = data.seriesConfigs[seriesColumnId];
        const seriesFormat = seriesConfig?.format || data.seriesFormat;
        const getDataLabels = () => {
            if ((seriesChartType === 'bar' || seriesChartType === 'column') && data.showBarTotals) {
                if (hasTargets) {
                    return {
                        inside: true,
                        enabled: true,
                        className: 'inside-data-labels',
                        formatter(this: Highcharts.TooltipFormatterContextObject) {
                            return getFormattedLabel(data, this.y, seriesFormat, seriesIndex, false);
                        },
                    };
                } else {
                    return {
                        enabled: true,
                        formatter(this: Highcharts.TooltipFormatterContextObject) {
                            return getFormattedLabel(data, this.y, seriesFormat, seriesIndex, false);
                        },
                    };
                }
            } else if (seriesChartType === 'bullet') {
                return {
                    enabled: true,
                    inside: true,
                    className: 'inside-data-labels',
                    formatter(this: Highcharts.TooltipFormatterContextObject) {
                        return getFormattedLabel(data, this.y, seriesFormat, seriesIndex, false);
                    },
                };
            } else if (data.chartType === 'donut') {
                return {
                    enabled: false,
                };
            } else if (seriesChartType === 'pie') {
                return {
                    enabled: true,
                    format: '<b>{point.name}</b><br>{point.percentage:.1f}%',
                };
            } else {
                return { enabled: false };
            }
        };
        const dataLabels = getDataLabels();

        const seriesData = getSeriesData(chartType, data, series, domainLabels, domainType, seriesFormat, targetData);
        if (seriesData.type === 'bullet') {
            bulletCategories = seriesData.categories;
        }

        const innerSize = data.chartType === 'donut' ? '60%' : undefined;

        // when not exporting CSS handles the coloring
        const color = exporting ? lightColors[seriesIndex] : undefined;
        const result: Highcharts.SeriesOptionsType = {
            name: data.seriesNames[seriesIndex],
            data: seriesData.series as Array<PointOptionsObject>,
            innerSize,
            color,
            type: seriesChartType,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            yAxis: axisList[seriesIndex] as any,
            dataLabels,
            tooltip: {
                pointFormatter(this: Highcharts.Point) {
                    return (
                        `<div><span class="highcharts-color-${this.colorIndex}">\u25CF</span> ` +
                        this.series.name +
                        ': <b>' +
                        getFormattedLabel(data, this.y, seriesFormat, seriesIndex, true) +
                        '</b></div>'
                    );
                },
            },
        };
        return result;
    });
    for (const target of targetData) {
        const _data = target.data.map(({ x, y }) => [x, y, y]);
        _data.sort((a, b) => (a[0] as number) - (b[0] as number));
        series.push({
            type: 'columnrange',
            data: _data,
            name: target.label,
            minPointLength: 1,
            pointPlacement: 'on',
            className: 'target-column-range',
            dataLabels: {
                enabled: true,
                inside: true,
                position: 'center',
                formatter(this: Highcharts.PointLabelObject) {
                    return getFormattedLabel(data, this.y, { type: 'Automatic' }, 0, true);
                },
            },
            grouping: false,
            tooltip: {
                pointFormatter(this: Highcharts.Point) {
                    return (
                        `<div><span class="highcharts-color-${this.colorIndex}">\u25CF</span> ` +
                        this.series.name +
                        ': <b>' +
                        getFormattedLabel(data, this.y, { type: 'Automatic' }, 0, true) +
                        '</b></div>'
                    );
                },
            },
        });
    }
    const getXAxis = (): Highcharts.XAxisOptions => {
        if (data.chartType === 'bullet' && bulletCategories !== null) {
            return { categories: bulletCategories };
        }
        return {
            type:
                domainType === DomainType.Numeric ? 'linear' : domainType === DomainType.Date ? 'datetime' : 'category',
            title: {
                text: data.xAxisTitle,
            },
        };
    };
    const getTooltip = (): Highcharts.TooltipOptions => {
        if (chartType === 'bullet') {
            return {
                enabled: false,
            };
        }
        return {
            shared: true,
            useHTML: true,
            padding: 0,
            shadow: false,
            backgroundColor: 'transparent',
            borderWidth: 0,
        };
    };
    const getLegend = (): Highcharts.LegendOptions => {
        if (data.chartType === 'donut') {
            return {
                layout: 'horizontal',
                align: 'center',
                verticalAlign: 'bottom',
            };
        } else {
            return {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle',
                // don't show the legend if there is only 1 dataset
                enabled: data.seriesColumnIds.length !== 1,
            };
        }
    };
    const getPieOptions = (): Highcharts.PlotPieOptions => {
        if (data.chartType === 'donut') {
            return {
                dataLabels: {
                    enabled: false,
                },
                center: ['50%', '50%'],
                showInLegend: true,
            };
        } else {
            return {
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b><br>{point.percentage:.1f}%',
                },
            };
        }
    };
    const xAxis = getXAxis();
    const tooltip = getTooltip();
    const legend = getLegend();
    const pie = getPieOptions();
    return {
        chart: {
            type: chartType,
            height: chartType === 'bullet' ? '10%' : undefined,
            styledMode: !exporting,
            inverted: chartType === 'bullet' ? true : undefined,
        },
        title: {
            text: undefined,
        },
        responsive,
        time: {
            timezone: timezone ? timezone : undefined,
            moment,
            useUTC: false,
        },

        yAxis,

        xAxis,

        legend,

        plotOptions: {
            series: {
                label: {
                    connectorAllowed: false,
                },
            },
            column: {
                stacking,
            },
            bar: {
                stacking,
            },
            pie,
            area: {
                stacking: stacking === 'percent' ? 'percent' : stacking === 'normal' ? 'normal' : undefined,
            },
        },
        series,

        credits: { enabled: false },
        accessibility: { enabled: false },
        tooltip,
    };
}

export function SimpleHighchartChart(props: React.ComponentProps<typeof HighchartsReactComponent>): React.ReactElement {
    const options = {
        credits: { enabled: false },
        title: { text: null },
        chart: {
            styledMode: true,
        },
        // eslint-disable-next-line react/prop-types
        ...props.options,
    };
    return <HighchartsReactComponent highcharts={Highcharts} {...props} options={options} />;
}

// pie chart
function getTopChartValues(chartData: ChartData): CategoryPoint[] {
    const labels = chartData.labels;
    const values = chartData.values[0] || [];

    const mapped = values.map((val, i) => {
        const label = labels[i] || 'Unknown';
        const value = Number.parseFloat(val);
        return { name: label, y: value };
    });
    mapped.sort((a, b) => b.y - a.y);

    const total = mapped.reduce((s, a) => s + a.y, 0);

    const maxValues = 12;
    // exclude values <1%
    const significantCount = mapped.slice(0, maxValues).reduce((s, a) => s + (a.y / total >= 0.01 ? 1 : 0), 0);

    if (labels.length <= significantCount) {
        return mapped;
    }

    const truncVals = mapped.slice(0, significantCount);
    const other = mapped.slice(significantCount).reduce((s, a) => s + a.y, 0);
    return [
        ...truncVals.map(({ name, y }) => ({
            y,
            name,
        })),
        {
            name: 'Other',
            y: other,
            colorIndex: OTHER_COLOR_INDEX,
        },
    ];
}
