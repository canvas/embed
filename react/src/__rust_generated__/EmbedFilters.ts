// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.
import type { FilterConfig } from './FilterConfig';
import type { FilterVariableValue } from './FilterVariableValue';
import type { LabelValue } from './LabelValue';

export interface EmbedFilters {
    filters: Array<FilterConfig>;
    defaultValues: Record<string, FilterVariableValue>;
    // uniqueValues: Record<string, Array<[string, string]>>;
    uniqueValuesV2: Record<string, Array<LabelValue>>;
}
