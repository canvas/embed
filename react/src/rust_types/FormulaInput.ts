// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.
import type { Dropdown } from './Dropdown';
import type { Point } from './Point';
import type { PositionTarget } from './PositionTarget';
import type { Text } from './Text';

export interface FormulaInput {
    text: Text;
    target: PositionTarget;
    dropdown: Dropdown;
    cancel_value: string;
    data_store_id: string | null;
    original_size: Point;
    is_column_formula: boolean;
}