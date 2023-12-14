import {EmbedElement} from './rust_types/EmbedElement';
import {ChartEmbed} from './rust_types/ChartEmbed';
import {DataPayload} from './rust_types/DataPayload';

export function getChart(element: EmbedElement): ChartEmbed | undefined {
  return element.elementType.type === 'chart' ? element.elementType : undefined
}

export function getSpreadsheet(element: EmbedElement): DataPayload | undefined {
  return element.elementType.type === 'spreadsheet' ? element.elementType : undefined
}
