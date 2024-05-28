import { ValueFormat } from './format';

export type Ordinal = number | Date | string;

type Value = number | null;
export type Data<DomainValue extends Ordinal> = { x: DomainValue; y: Value | Value[] }[];

export type Scale<DomainValue extends Ordinal> = {
    domainMin: DomainValue;
    domainMax: DomainValue;

    rangeMin: number;
    rangeMax: number;

    bandWidth: number;

    ticks: DomainValue[];

    format?: ValueFormat;

    size: (domainValue: DomainValue) => number;
    position: (domainValue: DomainValue) => number;
    midPoint: (domainValue: DomainValue) => number;
};
