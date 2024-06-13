import { Scale } from '../lib/types';

export function dateTimeScale(domain: Date[], range: [number, number]): Scale<Date> | null {
    const sortedDomain = [...domain];
    sortedDomain.sort((a, b) => a.getTime() - b.getTime());

    const domainMin = sortedDomain[0];
    const domainMax = sortedDomain[sortedDomain.length - 1];

    const [rangeMin, rangeMax] = range;

    if (domainMin === undefined || domainMax === undefined) {
        return null;
    }

    const ticks: Date[] = [];
    const dateRangeDays = Math.abs(domainMax.getTime() - domainMin.getTime()) / 1000 / 60 / 60 / 24;
    if (dateRangeDays > 700) {
        for (let year = domainMin.getFullYear() + 1; year <= domainMax.getFullYear(); year += 1) {
            ticks.push(new Date(year, 0, 1));
        }
    } else {
        ticks.push(domainMin);

        const tickCount = 6;

        const tickDelta = Math.floor(dateRangeDays / (tickCount - 1));

        for (let i = 1; i < 7; i++) {
            const tick = new Date(domainMin);
            tick.setDate(domainMin.getDate() + tickDelta * i);
            if (tick.getTime() > domainMax.getTime()) {
                break;
            }
            ticks.push(tick);
        }

        ticks.push(domainMax);
    }

    const rangeWidth = rangeMax - rangeMin;
    const domainWidth = domainMax.getTime() - domainMin.getTime();

    let bandWidth = rangeWidth / (domainWidth / (1000 * 60 * 60 * 24 * 30));
    bandWidth = Math.min(bandWidth, rangeWidth / domain.length);
    bandWidth = Math.max(2, bandWidth);

    function size(domainValue: Date) {
        const domainPos = (domainValue.getTime() - (domainMin?.getTime() ?? 0)) / domainWidth;
        return domainPos * (rangeWidth - bandWidth);
    }

    function position(domainValue: Date) {
        return size(domainValue) + rangeMin;
    }

    function midPoint(domainValue: Date) {
        return position(domainValue) + bandWidth / 2;
    }

    return { size, position, midPoint, ticks, bandWidth, domainMin, domainMax, rangeMin, rangeMax };
}
