import React, { ReactElement, ReactNode, useMemo } from 'react';

import { Theme, colorTable } from 'src/components/layout/themes/theme.util';
import { ColorDimension } from 'src/__rust_generated__/ColorDimension';
import { ChartData } from 'src/__rust_generated__/ChartData';

export function ChartTheme({
    data,
    theme,
    children,
}: {
    data: ChartData | undefined;
    theme: Theme | undefined;
    children: ReactNode;
}): ReactElement {
    const colors = useMemo(() => {
        if (data && theme) {
            return getColors(data, theme);
        }
    }, [data, theme]);

    const cssColorVars: { [v: string]: string } = {};

    if (colors) {
        const { lightColors, darkColors } = colors;

        lightColors.forEach((color, index) => {
            cssColorVars[`--theme-light-chart-color-${index}`] = color;
        });
        darkColors.forEach((color, index) => {
            cssColorVars[`--theme-dark-chart-color-${index}`] = color;
        });
    }

    return <div style={cssColorVars}>{children}</div>;
}

export function getColors(data: ChartData, theme: Theme): ChartColors {
    let colorDimension = data.colorDimension;

    if (colorDimension === 'automatic') {
        // inference is disabled for now; this incorrectly categorizes date strings are nominal when they should
        // be discrete.

        // const isDomainCategorical = data.domainCategory && ['nominal', 'ordinal'].includes(data.domainCategory);

        // if (data.chartType === 'pie') {
        //     colorDimension = 'categories';
        // } else if (isDomainCategorical && data.seriesNames.length < 2) {
        //     colorDimension = 'categories';
        // } else {
        //     colorDimension = 'series';
        // }
        colorDimension = 'series';
    }

    let steps: number;
    switch (colorDimension) {
        case 'categories':
            steps = data.values[0]?.length || 1;
            break;
        case 'series':
            steps = data.seriesNames.length;
            break;
        case 'none':
            steps = 1;
            break;
    }
    return {
        lightColors: colorTable(data.colorTheme, steps, theme, false),
        darkColors: colorTable(data.colorTheme, steps, theme, true),
        colorDimension,
    };
}

export type ChartColors = {
    lightColors: string[];
    darkColors: string[];
    colorDimension: ColorDimension;
};
