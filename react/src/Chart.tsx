import React from 'react'
import { HighchartsReact as HighchartsReactComponent } from 'highcharts-react-official'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import Funnel from 'highcharts/modules/funnel.js'
import exportingModule from 'highcharts/modules/exporting.js'
import { parseDateTimeNtz, parseDateTimeTz } from './DateUtil'
import { DateTime } from 'luxon'
import moment from 'moment-timezone'
import '../styles/charts.css'
import '../styles/highcharts.css'

type YAxes = Highcharts.YAxisOptions | Highcharts.YAxisOptions[]

type SeriesChartType =
  | 'column'
  | 'bar'
  | 'line'
  | 'pie'
  | 'scatter'
  | 'area'
  | 'waterfall'
  | 'funnel'
type ColorDimension = 'none' | 'series' | 'categories' | 'automatic'
type VariableCategory = 'nominal' | 'ordinal' | 'discrete' | 'continuous'
type ChartType =
  | 'bar'
  | 'line'
  | 'pie'
  | 'combo'
  | 'scatter'
  | 'funnel'
  | 'area'
export type ColorTheme =
  | 'Rainbow'
  | 'Bright'
  | 'Plasma'
  | 'GreenYellow'
  | 'Blue'
  | 'Red'
  | 'Gray'
type StackType = 'none' | 'standard' | 'onehundredpercent'
type ChartMargin = {
  top: number | null
  bottom: number | null
  left: number | null
  right: number | null
  pad: number | null
  xTickAngle: number | null
  yTickAngle: number | null
  maxTickLength: number | null
  yAxisMinimum: number | null
  yAxisMaximum: number | null
}
type Format =
  | { type: 'Automatic' }
  | { type: 'PlainText' }
  | { type: 'Money_v2'; precision: number }
  | { type: 'Percent_v2'; precision: number }
  | { type: 'Number'; precision: number }
  | { type: 'Date' }
  | { type: 'DateTime' }
  | { type: 'Money' }
  | { type: 'Percent' }
type SeriesFormat = 'line' | 'bar' | 'waterfall'
type LineShape = 'spline' | 'hvh' | 'linear'
type LineDash = 'solid' | 'dot' | 'dashdot'
type ChartDataSeriesConfig = {
  secondYAxis: boolean
  lineShape: LineShape
  lineDash: LineDash
  format: Format
}

export type ChartData = {
  colorDimension: ColorDimension
  domainCategory: VariableCategory | null
  chartType: ChartType
  seriesNames: Array<string>
  values: Array<Array<string>>
  colorTheme: ColorTheme
  horizontal: boolean
  stackType: StackType | null
  labels: Array<string>
  xAxisTitle: string | null
  yAxisTitle: string | null
  margin: ChartMargin | null
  seriesFormat: Format
  seriesConfigs: Record<string, ChartDataSeriesConfig>
  seriesColumnIds: Array<string>
  seriesFormats: Array<SeriesFormat> | null
  showBarTotals: boolean
}

Funnel(Highcharts)
exportingModule(Highcharts)

const OTHER_COLOR_INDEX = 100

function isNumeric(str: string) {
  if (typeof str === 'number' || typeof str === 'bigint') return true
  if (typeof str != 'string') return false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (
    !isNaN(str as any) && !isNaN(parseFloat(str)) && isFinite(parseFloat(str))
  )
}

type ChartColors = {
  lightColors: string[]
  darkColors: string[]
}

type Props = {
  data: ChartData | undefined
  title: string
  timezone: string | null
  colors: ChartColors | undefined
  disableExport?: boolean
}

export type ChartHandle = {
  download: () => void
}
export const Chart = React.forwardRef<ChartHandle, Props>(function Chart(
  props: Props,
  ref
) {
  const chartRef = React.useRef<HighchartsReact.RefObject>(null)
  const { data, title, timezone, colors, disableExport } = props
  const exportingEnabled = disableExport !== true;

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
  }

  React.useImperativeHandle(ref, () => ({
    download: () => {
      if (data && colors) {
        const options = getOptions(data, colors, responsive, true, timezone, true)
        chartRef.current?.chart.exportChart({ filename: title }, options)
      }
    },
  }))

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
    }
    return (
      <div>
        <HighchartsReactComponent
          highcharts={Highcharts}
          options={options}
          ref={chartRef}
        />
      </div>
    )
  }

  const options = getOptions(data, colors, responsive, false, timezone, exportingEnabled)

  const cssColorVars: { [v: string]: string } = {}
  const { lightColors, darkColors } = colors

  lightColors.forEach((color, index) => {
    cssColorVars[`--chart-color-${index}`] = color
  })
  darkColors.forEach((color, index) => {
    cssColorVars[`--chart-dark-color-${index}`] = color
  })

  return (
    <div style={cssColorVars}>
      <HighchartsReactComponent
        highcharts={Highcharts}
        options={options}
        ref={chartRef}
      />
    </div>
  )
})

function guessPrecisionAndFormatNumber(
  value: number,
  comparableValue: number
): string {
  // don't show K or M if its zero
  if (value === 0) {
    return '0'
  }

  let unitSuffix = ''
  let divisor = 1

  if (comparableValue >= 1_000_000_000) {
    unitSuffix = 'B'
    divisor = 1_000_000_000
  } else if (comparableValue >= 1_000_000) {
    unitSuffix = 'M'
    divisor = 1_000_000
  } else if (comparableValue >= 1000) {
    unitSuffix = 'k' // intentionally k, not K
    divisor = 1_000
  } else {
    unitSuffix = ''
    divisor = 1
  }

  const displayValue = value / divisor

  // This simulates -1 precision, but caps it at 1 (instead of 20)
  // https://github.com/highcharts/highcharts/blob/d79c147bda75155d0666a8fab33a9f335eb73251/ts/Core/Templating.ts#L392C9-L393C1
  // todo(wpride): noUncheckedIndexedAccess
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const origDec = (displayValue.toString().split('.')[1] || '').split('e')[0]!
    .length

  const precision = Math.min(origDec, 1)

  const { decimal, group } = getSeparator()

  return (
    Highcharts.numberFormat(displayValue, precision, decimal, group) +
    unitSuffix
  )
}

function getSeparator(): { decimal: string; group: string } {
  const numberWithGroupAndDecimalSeparator = 1000.1
  const formatted = Intl.NumberFormat().formatToParts(
    numberWithGroupAndDecimalSeparator
  )
  const decimal = formatted.find(part => part.type === 'decimal')?.value || '.'
  const group = formatted.find(part => part.type === 'group')?.value || ','
  return { decimal, group }
}

enum DomainType {
  String,
  Numeric,
  Date,
}

function getOptions(
  data: ChartData,
  colors: ChartColors,
  responsive: Highcharts.ResponsiveOptions,
  exporting: boolean,
  timezone: string | null,
  exportingEnabled: boolean
): Highcharts.Options {
  let chartType:
    | 'line'
    | 'bar'
    | 'column'
    | 'funnel'
    | 'pie'
    | 'scatter'
    | 'area' = 'line'
  switch (data.chartType) {
    case 'line':
      chartType = 'line'
      break
    case 'bar':
    case 'combo':
      if (data.horizontal === true) {
        chartType = 'bar'
      } else {
        chartType = 'column'
      }
      break
    case 'scatter':
      chartType = 'scatter'
      break
    case 'funnel':
      chartType = 'funnel'
      break
    case 'pie':
      chartType = 'pie'
      break
    case 'area':
      chartType = 'area'
      break
    default:
      console.warn(`Unrecognized chartType ${data.chartType}`)
  }
  let stacking: Highcharts.OptionsStackingValue | undefined = 'normal'
  if (data.stackType) {
    switch (data.stackType) {
      case 'none':
        stacking = undefined
        break
      case 'onehundredpercent':
        stacking = 'percent'
        break
      case 'standard':
        stacking = 'normal'
    }
  }
  const { lightColors } = colors

  const getFormattedLabel = (
    value: number | null | undefined,
    format: Format,
    seriesIndex: number,
    exactPrecision: boolean
  ): string => {
    // todo(wpride): noUncheckedIndexedAccess
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const seriesData = data.values[seriesIndex]!
    const max = Math.max(
      ...seriesData
        .map(datum => parseFloat(datum))
        .filter(datum => !isNaN(datum))
    )

    const getFormat = () => {
      if (format.type === 'Money_v2') {
        return { prefix: '$', suffix: '' }
      }
      if (format.type === 'Percent_v2') {
        return { suffix: '%', prefix: '' }
      }
      return { suffix: '', prefix: '' }
    }
    const getPrecision = () => {
      if (!exactPrecision) return -1
      if (format.type === 'Money_v2' || format.type === 'Percent_v2') {
        return format.precision
      }
      return -1
    }
    if (value === null || value === undefined) {
      return 'Unknown'
    }
    const comparableValue = isNaN(max) || !isFinite(max) ? value : max
    const { prefix, suffix } = getFormat()
    const precision = getPrecision()
    if (exactPrecision) {
      const { decimal, group } = getSeparator()
      return (
        prefix +
        Highcharts.numberFormat(value, precision, decimal, group) +
        suffix
      )
    }

    const formatted = guessPrecisionAndFormatNumber(value, comparableValue)

    return `${prefix}${formatted}${suffix}`
  }

  const getDomainLabelsAndType = (): [(string | number)[], DomainType] => {
    let isDate = true
    let isNumber = true
    const domainNumericParse = data.labels.map(datum => {
      if (!isNumeric(datum)) {
        isNumber = false
      }
      return parseFloat(datum)
    })
    const domainDateParse = data.labels.map(datum => {
      const isoDateParse = DateTime.fromISO(datum)
      const snowflakeNtzParse = parseDateTimeNtz(datum)
      const extendedDateParse = parseDateTimeTz(datum)
      if (isoDateParse.isValid) {
        return isoDateParse.toMillis()
      } else if (snowflakeNtzParse.isValid) {
        return snowflakeNtzParse.toMillis()
      } else if (extendedDateParse.isValid) {
        return extendedDateParse.toMillis()
      }
      isDate = false
      return Date.parse(datum)
    })
    // important that number goes first, because many numbers will parse as dates
    if (isNumber) {
      return [domainNumericParse, DomainType.Numeric]
    }
    if (isDate) {
      return [domainDateParse, DomainType.Date]
    }
    return [data.labels, DomainType.String]
  }
  const [domainLabels, domainType] = getDomainLabelsAndType()

  const defaultYAxis: Highcharts.YAxisOptions = {
    title: {
      text: data.yAxisTitle,
    },
    min: data.margin?.yAxisMinimum,
    max: data.margin?.yAxisMaximum,
    labels: {
      formatter(this: Highcharts.AxisLabelsFormatterContextObject) {
        if (typeof this.value === 'string') {
          return this.value
        }
        return getFormattedLabel(this.value, data.seriesFormat, 0, false)
      },
    },
  }

  // todo(wpride): this whole thing should be moved into a builder
  const getYAxis = (): [number[], YAxes] => {
    const usesMultipleYAxis = Object.values(data.seriesConfigs).find(
      config => config.secondYAxis
    )
    if (!usesMultipleYAxis) {
      return [[], defaultYAxis]
    }
    const axisList: number[] = []
    const yAxes: YAxes = [defaultYAxis]
    for (const [index, columnId] of data.seriesColumnIds.entries()) {
      const seriesConfig: ChartDataSeriesConfig | undefined =
        data.seriesConfigs[columnId]
      const format = seriesConfig?.format || data.seriesFormat
      const seriesName = data.seriesNames[index]
      const opposite = !!seriesConfig?.secondYAxis
      if (!opposite) {
        axisList.push(0)
        continue
      }
      yAxes.push({
        title: { text: seriesName },
        min: data.margin?.yAxisMinimum,
        max: data.margin?.yAxisMaximum,
        opposite,
        labels: {
          formatter(this: Highcharts.AxisLabelsFormatterContextObject) {
            if (typeof this.value === 'string') {
              return this.value
            }
            return getFormattedLabel(this.value, format, index, false)
          },
        },
      })
      axisList.push(yAxes.length - 1)
    }
    return [axisList, yAxes]
  }
  const [axisList, yAxis] = getYAxis()
  return {
    chart: {
      type: chartType,
      styledMode: !exporting,
    },
    title: {
      text: undefined,
    },
    responsive,
    time: {
      timezone: timezone ? timezone : undefined,
      moment,
    },
    exporting: {
      enabled: exportingEnabled,
    },

    yAxis,

    xAxis: {
      type:
        domainType === DomainType.Numeric
          ? 'linear'
          : domainType === DomainType.Date
          ? 'datetime'
          : 'category',
      title: {
        text: data.xAxisTitle,
      },
    },

    legend: {
      layout: 'vertical',
      align: 'right',
      verticalAlign: 'middle',
    },

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
      pie: {
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b><br>{point.percentage:.1f}%',
        },
      },
      area: {
        stacking:
          stacking === 'percent'
            ? 'percent'
            : stacking === 'normal'
            ? 'normal'
            : undefined,
      },
    },
    // TODO un-plotly this
    series: data.values.map((series: string[], seriesIndex: number) => {
      const getSeriesChartType = (): SeriesChartType => {
        if (data.chartType !== 'combo') return chartType
        const seriesFormat =
          data.seriesFormats && data.seriesFormats[seriesIndex]
        if (!seriesFormat) return 'column'
        if (seriesFormat === 'bar') return 'column'
        return seriesFormat
      }
      const seriesChartType = getSeriesChartType()
      // todo(wpride): noUncheckedIndexedAccess
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const seriesColumnId = data.seriesColumnIds[seriesIndex]!
      const seriesConfig = data.seriesConfigs[seriesColumnId]
      const seriesFormat = seriesConfig?.format || data.seriesFormat
      let seriesData

      if (chartType === 'pie') {
        seriesData = getTopChartValues(data)
      } else {
        seriesData = series.map((x: string, index: number) => [
          domainLabels[index],
          parseFloat(x),
        ])
        if (domainType === DomainType.Date) {
          seriesData.sort((a, b) => (a[0] as number) - (b[0] as number))
        }
        if (seriesFormat.type === 'Percent_v2') {
          seriesData = seriesData.map(([a, b]) => [a, (b as number) * 100])
        }
      }
      const getDataLabels = () => {
        if (
          (seriesChartType === 'bar' || seriesChartType === 'column') &&
          data.showBarTotals
        ) {
          return {
            enabled: true,
            formatter(this: Highcharts.TooltipFormatterContextObject) {
              return getFormattedLabel(this.y, seriesFormat, seriesIndex, false)
            },
          }
        } else if (seriesChartType === 'pie') {
          return {
            enabled: true,
            format: '<b>{point.name}</b><br>{point.percentage:.1f}%',
          }
        } else {
          return { enabled: false }
        }
      }
      const dataLabels = getDataLabels()
      // when not exporting CSS handles the coloring
      const color = exporting ? lightColors[seriesIndex] : undefined
      const result: Highcharts.SeriesOptionsType = {
        name: data.seriesNames[seriesIndex],
        data: seriesData,
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
              getFormattedLabel(this.y, seriesFormat, seriesIndex, true) +
              '</b></div>'
            )
          },
        },
      }
      return result
    }),

    credits: { enabled: false },
    accessibility: { enabled: false },
    tooltip: {
      shared: true,
      useHTML: true,
      padding: 0,
      shadow: false,
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
  }
}

export function SimpleHighchartChart(
  props: React.ComponentProps<typeof HighchartsReactComponent>
): React.ReactElement {
  const options = {
    credits: { enabled: false },
    title: { text: null },
    chart: {
      styledMode: true,
    },
    // eslint-disable-next-line react/prop-types
    ...props.options,
  }
  return (
    <HighchartsReactComponent
      highcharts={Highcharts}
      {...props}
      options={options}
    />
  )
}

// pie chart
function getTopChartValues(chartData: ChartData) {
  const labels = chartData.labels
  const values = chartData.values[0] || []

  const mapped = values.map((val, i) => {
    const label = labels[i] || 'Unknown'
    const value = Number.parseFloat(val)
    return [label, value] as [string, number]
  })
  mapped.sort((a, b) => b[1] - a[1])

  const total = mapped.reduce((s, a) => s + a[1], 0)

  const maxValues = 12
  // exclude values <1%
  const significantCount = mapped
    .slice(0, maxValues)
    .reduce((s, a) => s + (a[1] / total >= 0.01 ? 1 : 0), 0)

  if (labels.length <= significantCount) {
    return mapped
  }

  const truncVals = mapped.slice(0, significantCount)
  const other = mapped.slice(significantCount).reduce((s, a) => s + a[1], 0)
  return [
    ...truncVals.map(([x, y]) => ({
      y: y as number,
      name: x.toString(),
    })),
    {
      name: 'Other',
      y: other,
      colorIndex: OTHER_COLOR_INDEX,
    },
  ]
}
