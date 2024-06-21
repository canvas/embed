import { Scale } from '../lib/types';
import { linearScale } from './linear';

export function categoricalScale(categories: string[], range: [number, number]): Scale<number> | null {
    if (categories.length > 1000) {
        console.error('Too many values for categorical scale');
        return null;
    }

    const ticks = categories;

    const ordering = new Map();
    categories.forEach((value, index) => {
        ordering.set(value, index);
    });
    const numericDomain = categories.map((_, index) => index);

    const scale = linearScale(numericDomain, range, { lastTick: 'max' });

    if (!scale) {
        return null;
    }

    function size(domainValue: string) {
        return scale?.size(ordering.get(domainValue)) ?? 0;
    }

    function position(domainValue: string) {
        return scale?.position(ordering.get(domainValue)) ?? 0;
    }

    function midPoint(domainValue: string) {
        return scale?.midPoint(ordering.get(domainValue)) ?? 0;
    }

    return { ...scale, ticks, size, position, midPoint } as any;
}
