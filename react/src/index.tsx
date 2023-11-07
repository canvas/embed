import React from 'react'
import { Chart, ChartData } from './Chart'
import { getColors } from './Colors'

type WrapperProps = {
  authToken: string
  chartId: string
  timezone: string | null
  disableExport?: boolean
  host?: string
}

export const ChartWrapper: React.FC<WrapperProps> = ({
  authToken,
  chartId,
  timezone,
  disableExport,
  host: hostOverride,
}: WrapperProps) => {
  const [chartData, setChartData] = React.useState<ChartData | null>(null)
  const [error, setError] = React.useState<string | null>(null);
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
      .then(response => response.json())
      .then(data => {
        setError(null);
        setChartData(data.embedData)
      })
      .catch(error => {
        console.log(`Error getting embed data: ${error}`);
        setError(`${error}`);
        setChartData(null);
      })
  }, [authToken, chartId])

  if (error) {
    return <div>{error}</div>
  }

  if (chartData) {
    const colors = getColors(chartData)
    return (
      <Chart
        data={chartData}
        title="Title"
        timezone={timezone}
        colors={colors}
        disableExport={disableExport}
      />
    )
  } else {
    return (
      <Chart
        data={undefined}
        title="Title"
        timezone={timezone}
        colors={undefined}
      />
    )
  }
}
