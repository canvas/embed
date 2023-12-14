import isEmpty from 'lodash/isEmpty';

export function buildUrl(url: string, params: Record<string, string>): string {
    if (isEmpty(params)) return url;

    const queryString = Object.keys(params)
        .map((key) => `${key}=${params[key]}`)
        .join('&');
    return `${url}?${queryString}`;
}

export function stripDollarPrefix(obj: Record<string, any>): Record<string, any> {
    const newObj = {};
    Object.keys(obj).forEach((key) => {
        if (key.startsWith('$')) {
            newObj[key.slice(1)] = obj[key];
        } else {
            newObj[key] = obj[key];
        }
    });
    return newObj;
}
