// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.
import type { Formula } from './Formula';
import type { PivotValue } from './PivotValue';

export interface Pivot {
    rows: Array<string>;
    values: Array<PivotValue>;
    formulas: Array<Formula>;
}