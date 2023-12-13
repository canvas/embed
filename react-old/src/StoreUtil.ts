import {EmbedElement} from './rust_types/EmbedElement';
import {ChartEmbed} from './rust_types/ChartEmbed';
import {DataPayload} from './rust_types/DataPayload';

export function getChart(element: EmbedElement): ChartEmbed | undefined {
  return typeof element != 'string' && 'chart' in element
    ? element.chart
    : undefined
}

export function getSpreadsheet(element: EmbedElement): DataPayload | undefined {
  return typeof element != 'string' && 'spreadsheet' in element
    ? element.spreadsheet
    : undefined
}
