import { Ordinal } from './types';

export function getMinMax<Value extends Ordinal>(data: Value[]): [Value, Value] {
    if (data[0] === undefined) {
        return [0, 0] as any; //TODO
    }

    let min = data[0] as Value;
    let max = data[0] as Value;

    data.forEach((value: Value) => {
        if (value < min) min = value;
        if (value > max) max = value;
    });

    return [min, max];
}

export function getMinDifference<Value>(sortedData: Value[], scaleFn: (value: Value) => number): number {
    let prev: Value | null = null;
    let minDiff = Infinity;
    sortedData.forEach((value) => {
        if (prev !== null) {
            minDiff = Math.min(minDiff, Math.abs(scaleFn(prev) - scaleFn(value)));
        }
        prev = value;
    });

    return minDiff;
}

export function roundToPrevious<Value extends Ordinal>(value: Value): Value {
    if (typeof value === 'number') {
        return roundToPreviousRoundNumber(value) as Value;
    } else {
        return value;
    }
}

export function roundToPreviousRoundNumber(value: number): number {
    if (value < 1) {
        return value;
    }

    const magnitude = Math.floor(value).toString().length - 1;
    const firstDigit = parseInt(value.toString()[0] ?? '0');

    if (magnitude >= 2) {
        const secondDigit = parseInt(value.toString()[1] ?? '0');

        return Math.pow(10, magnitude - 1) * (firstDigit * 10 + secondDigit);
    }

    return Math.pow(10, magnitude) * firstDigit;
}

export function roundToNext<Value extends Ordinal>(value: Value): Value {
    if (typeof value === 'number') {
        return roundToNextRoundNumber(value) as Value;
    } else {
        return value;
    }
}

export function roundToNextRoundNumber(value: number): number {
    if (value < 1) {
        return value;
    }

    const magnitude = Math.floor(value).toString().length - 1;
    const firstDigit = parseInt(value.toString()[0] ?? '0');

    return Math.pow(10, magnitude) * (firstDigit + 1);
}
