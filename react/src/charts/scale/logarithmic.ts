import { Scale } from '../lib/types';
import { numberScale } from './linear';

function symlog10(value: number) {
    const sign = value >= 0 ? 1 : -1;

    return sign * Math.log10(1 + Math.abs(value));
}

export function logarithmicScale(
    domain: number[],
    range: [number, number],
    options?: { lastTick?: 'trim' | 'extend' | 'max'; evenTicks?: boolean },
): Scale<number> | null {
    const evenTicks = options?.evenTicks ?? true;

    const scale = numberScale(domain, range, { ...options, extendToZero: false, scaleFn: symlog10 });

    if (!scale) {
        return null;
    }

    let ticks = scale.ticks;

    if (evenTicks) {
        let currentValue = scale.domainMax;
        ticks = [];
        while (currentValue > scale.domainMin) {
            ticks.unshift(currentValue);
            currentValue /= 10;
        }
        ticks.unshift(scale.domainMin);
    }

    return { ...scale, ticks };
}
