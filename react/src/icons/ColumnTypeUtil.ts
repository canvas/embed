import type { SvgrComponent } from './SvgrComponent.d.ts';
import { BooleanIcon, DateIcon, DateTimeIcon, IntegerIcon, MiscIcon, SqlErrorIcon, TextIcon } from './index';
// import { CsvColumnType } from '../../__generated__/globalTypes';
import { SqlType } from '../__rust_generated__/SqlType';

function exhaustiveGuard(_value: never): never {
    throw new Error(`ERROR! Reached forbidden guard function with unexpected value: ${JSON.stringify(_value)}`);
}
export function getTypeIcon(sqlType: SqlType | null): SvgrComponent {
    switch (sqlType) {
        case 'Text':
            return TextIcon;
        case 'Boolean':
            return BooleanIcon;
        case 'Number':
            return IntegerIcon;
        case 'Date':
            return DateIcon;
        case 'DateTime':
        case 'DateTimeTz':
        case 'DateTimeNtz':
            return DateTimeIcon;
        case 'Object':
        case 'Array':
        case null:
            return MiscIcon;
    }
    exhaustiveGuard(sqlType);
}

// export function getColumnTypeIcon(sqlType: CsvColumnType | null): SvgrComponent {
//     switch (sqlType) {
//         case CsvColumnType.String:
//             return TextIcon;
//         case CsvColumnType.Boolean:
//             return BooleanIcon;
//         case CsvColumnType.Float:
//         case CsvColumnType.Integer:
//             return IntegerIcon;
//         case CsvColumnType.Date:
//             return DateIcon;
//         case CsvColumnType.DateTime:
//             return DateTimeIcon;
//         case CsvColumnType.Json:
//         case null:
//             return SqlErrorIcon;
//     }
//     exhaustiveGuard(sqlType);
// }
