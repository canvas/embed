// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.
import type { SqlDialect } from './SqlDialect';

export interface TableComponent {
    name: string;
    database: string;
    schema: string;
    table: string;
    warehouseAuthId: string;
    sqlDialect: SqlDialect;
}
