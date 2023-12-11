import React from 'react'
import {
  Chart as _Chart,
  ChartProps,
  ChartData as InnerChartData,
} from './Chart'
import { GetCanvasEmbedResponse, Canvas as InnerCanvas } from './Canvas'
import { getColors } from './Colors'

export type ChartData = InnerChartData

type CanvasProps = {
  canvasId: string
  authToken: string
  host?: string
}

type WrapperProps = {
  authToken: string
  chartId: string
  timezone: string | null
  disableExport?: boolean
  host?: string
}

export const DataChart: React.FC<ChartProps> = ({
  data,
  title,
  timezone,
  disableExport,
}: ChartProps) => {
  return (
    <_Chart
      data={data}
      title={title}
      timezone={timezone}
      disableExport={disableExport}
    />
  )
}

export const Canvas: React.FC<CanvasProps> = ({
  canvasId,
  authToken,
  host: hostOverride,
}: CanvasProps) => {
  const [canvasData, setCanvasData] =
    React.useState<GetCanvasEmbedResponse | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const host = hostOverride || 'https://api.canvasapp.com'
  React.useEffect(() => {
    fetch(`${host}/v1/embed/canvas_embed?canvas_id=${canvasId}`, {
      method: 'GET',
      headers: {
        'x-embed-key': authToken,
      },
    })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text()
          console.error(`Error getting canvas data: ${text}`)
          setCanvasData(null)
          setError(text)
        } else {
          const chartData = await res.json()
          setCanvasData(chartData)
          setError(null)
        }
      })
      .catch(error => {
        console.log(`Error getting embed data: ${error}`)
        setError(`${error}`)
        setCanvasData(null)
      })
  }, [authToken, canvasId])
  console.log('canvasData', canvasData)
  return <InnerCanvas canvasId={canvasId} />
}

export const Chart: React.FC<WrapperProps> = ({
  authToken,
  chartId,
  timezone,
  disableExport,
  host: hostOverride,
}: WrapperProps) => {
  const [chartData, setChartData] = React.useState<InnerChartData | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const host = hostOverride || 'https://api.canvasapp.com'
  React.useEffect(() => {
    if (!authToken) {
      console.warn('Missing authToken')
      return
    }
    if (!chartId) {
      console.warn('Missing chartId')
      return
    }
    fetch(`${host}/v1/embed/embed_data?embed_id=${chartId}`, {
      method: 'GET',
      headers: {
        'x-embed-key': authToken,
      },
    })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text()
          console.error(`Error getting chart data: ${text}`)
          setChartData(null)
          setError(text)
        } else {
          const chartData = await res.json()
          setChartData(chartData)
          setError(null)
        }
      })
      .catch(error => {
        console.log(`Error getting embed data: ${error}`)
        setError(`${error}`)
        setChartData(null)
      })
  }, [authToken, chartId])

  if (error) {
    return <div>{error}</div>
  }

  if (chartData) {
    return (
      <_Chart
        data={chartData}
        title="Title"
        timezone={timezone}
        disableExport={disableExport}
      />
    )
  } else {
    return <_Chart data={undefined} title="Title" timezone={timezone} />
  }
}
