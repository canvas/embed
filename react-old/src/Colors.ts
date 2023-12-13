import chroma from 'chroma-js'
import { ChartData, ColorTheme } from './Chart'

type ColorPalette =
  | {
      type: 'categorical'
      preview: Array<string>
      colors: Array<string>
      darkColors?: Array<string>
    }
  | { type: 'scale'; scale: chroma.Scale }

function colorPalette(colorTheme: ColorTheme): ColorPalette {
  switch (colorTheme) {
    case 'Bright':
      return {
        type: 'categorical',
        preview: [
          '#5ba8f7',
          '#9b54f3',
          '#72b622',
          '#e6482c',
          '#f98517',
          '#fdd146',
        ],
        colors: [
          '#5ba8f7',
          '#9b54f3',
          '#e6482c',
          '#f98517',
          '#fdd146',
          '#72b622',
        ],
      }

    case 'Rainbow':
      return {
        type: 'categorical',
        preview: [
          '#3742A0',
          '#129DC9',
          '#28C093',
          '#DF3F3F',
          '#F48D54',
          '#FAC372',
        ],
        colors: [
          '#3742A0',
          '#129DC9',
          '#28C093',
          '#DF3F3F',
          '#F48D54',
          '#FAC372',
        ],
        //                darkColors: ['#4654CF', '#129DC9', '#28C093', '#DF3F3F', '#F48D54', '#FAC372'],
        darkColors: [
          '#5ba8f7',
          '#129DC9',
          '#28C093',
          '#DF3F3F',
          '#F48D54',
          '#FAC372',
        ],
      }

    case 'Plasma':
      return {
        type: 'scale',
        scale: chroma.scale(['#1d1489', '#f4bb4d']).mode('lch'),
      }

    case 'GreenYellow':
      return {
        type: 'scale',
        scale: chroma.scale(['#103338', '#D1DA62']).mode('lch'),
      }

    case 'Blue':
      return {
        type: 'scale',
        scale: chroma.scale(['#0E2836', '#55C4F9']).mode('lch'),
      }

    case 'Red':
      return {
        type: 'scale',
        scale: chroma.scale(['#bd0026', '#fed976']).mode('lch'),
      }

    case 'Gray':
      return {
        type: 'scale',
        scale: chroma.scale(['#28323f', '#d9e2ec']).mode('lch'),
      }
  }
}

function colorTable(
  colorTheme: ColorTheme,
  steps: number,
  preview?: boolean,
  dark?: boolean
): string[] {
  const palette = colorPalette(colorTheme)

  if (palette.type == 'scale') {
    return palette.scale.colors(steps)
  } else if (palette.type == 'categorical' && preview === true) {
    return palette.preview
  } else {
    if (dark) {
      return palette.darkColors
        ? palette.darkColors.slice(0, steps)
        : palette.colors.slice(0, steps)
    }
    return palette.colors.slice(0, steps)
  }
}

export function getColors(data: ChartData): {
  lightColors: string[]
  darkColors: string[]
} {
  let colorDimension = data.colorDimension

  if (colorDimension === 'automatic') {
    const isDomainCategorical =
      data.domainCategory &&
      ['nominal', 'ordinal'].includes(data.domainCategory)

    if (data.chartType === 'pie') {
      colorDimension = 'categories'
    } else if (isDomainCategorical && data.seriesNames.length < 2) {
      colorDimension = 'categories'
    } else {
      colorDimension = 'series'
    }
  }

  let steps: number
  switch (colorDimension) {
    case 'categories':
      steps = data.values[0]?.length || 1
      break
    case 'series':
      steps = data.seriesNames.length
      break
    case 'none':
      steps = 1
      break
  }
  return {
    lightColors: colorTable(data.colorTheme, steps, undefined, false),
    darkColors: colorTable(data.colorTheme, steps, undefined, true),
  }
}
