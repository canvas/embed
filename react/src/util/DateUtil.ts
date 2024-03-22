import { DateTime } from 'luxon';

export function parseDateTimeNtz(value: string): DateTime {
    const noMillisParse = DateTime.fromFormat(value, 'yyyy-MM-dd HH:mm:ss', {
        zone: 'UTC',
    });
    if (noMillisParse.isValid) return noMillisParse;
    const bigQueryParse = DateTime.fromFormat(value, "yyyy-MM-dd'T'HH:mm:ss", {
        zone: 'UTC',
    });
    if (bigQueryParse.isValid) return bigQueryParse;
    const bigQueryMillisParse = DateTime.fromFormat(value, "yyyy-MM-dd'T'HH:mm:ss.u", { zone: 'UTC' });
    if (bigQueryMillisParse.isValid) return bigQueryParse;
    const parse = DateTime.fromFormat(value, 'yyyy-MM-dd HH:mm:ss.SSS', {
        zone: 'UTC',
    });
    return parse;
}

export function parseDateTimeTz(value: string): DateTime {
    const postgresParse = DateTime.fromFormat(value, 'yyyy-MM-dd HH:mm:ssZZ', {
        zone: 'UTC',
    });
    if (postgresParse.isValid) return postgresParse;
    const bigQueryParse = DateTime.fromFormat(value, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", { zone: 'UTC' });
    if (bigQueryParse.isValid) return bigQueryParse;
    const parse = DateTime.fromFormat(value, 'yyyy-MM-dd HH:mm:ss.SSS ZZZ', {
        zone: 'UTC',
    });
    return parse;
}
