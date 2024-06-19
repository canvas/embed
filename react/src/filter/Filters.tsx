import React from 'react';
import Filter from './Filter';
import { EmbedResponse } from '../types/EmbedResponse';
import { EmbedElementType } from '../__rust_generated__/EmbedElementType';
import { Component } from '../__rust_generated__/Component';
import { EmbedElement } from '../__rust_generated__/EmbedElement';

function getComponent(element: EmbedElementType): Component | undefined {
    return element.type === 'component' ? element.component : undefined;
}

function getInlineFilters(elements: Record<string, EmbedElement>): string[] {
    return Object.values(elements)
        .map((element) => {
            const component = getComponent(element.elementType);
            if (component) {
                if (component.component === 'SearchComponent') {
                    const filterId: string = JSON.parse(component.config).filterId;
                    if (filterId) {
                        return [filterId];
                    }
                }
            }
            return [];
        })
        .flat();
}

export function Filters({ canvasData }: { canvasData: EmbedResponse }) {
    const filters = canvasData?.filters?.filters;
    const filtersVisible = filters?.filter(
        (filter) =>
            (filter?.filterType?.type === 'select' && filter.filterType.storeId != null) ||
            (filter.filterType.type === 'search' && !getInlineFilters(canvasData.elements).includes(filter.filterId)),
    );

    return (
        <section className="flex">
            {filtersVisible?.map((filter) => <Filter key={filter.filterId} canvasData={canvasData} filter={filter} />)}
        </section>
    );
}
