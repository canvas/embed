import chroma from 'chroma-js';

export type FontFamily =
    | {
          type: 'file';
          fileType: 'woff' | 'woff2';
          name: string;
          url: string;
      }
    | { type: 'browser'; name: string };

type Palette = { type: 'palette' | 'scale' | 'map'; colors: string[]; darkColors?: string[]; name: string };

export type Theme = {
    palettes?: Palette[];
    fonts?: {
        // Body font
        body?: FontFamily;

        // Display font (headings, titles, etc.), if different from body font
        display?: FontFamily;

        // Big number - the actual number
        bigNumber?: FontFamily;
    };
};

export const DEFAULT_PALETTE: Palette = {
    name: 'Bright',
    type: 'palette',
    colors: ['#5ba8f7', '#9b54f3', '#e6482c', '#f98517', '#fdd146', '#72b622'],
};
export const DEFAULT_MAP_PALETTE: Palette = { type: 'map', colors: ['#5aa7f6', '#f4f7fb'], name: 'Map Default' };

export const defaultTheme: Theme = {
    palettes: [
        DEFAULT_PALETTE,
        DEFAULT_MAP_PALETTE,
        {
            type: 'palette',
            colors: ['#3742a0', '#129dc9', '#28c093', '#df3f3f', '#f48d54', '#fac372'],
            darkColors: ['#5ba8f7', '#129dc9', '#28c093', '#df3f3f', '#f48d54', '#fac372'],
            name: 'Rainbow',
        },
        { name: 'Plasma', type: 'scale', colors: ['#1d1489', '#f4bb4d'] },
        { name: 'GreenYellow', type: 'scale', colors: ['#103338', '#D1DA62'] },
        { name: 'Blue', type: 'scale', colors: ['#0E2836', '#55C4F9'] },
        { name: 'Red', type: 'scale', colors: ['#bd0026', '#fed976'] },
        { name: 'Gray', type: 'scale', colors: ['#28323f', '#d9e2ec'] },
    ],
    fonts: {
        body: { type: 'browser', name: 'inherit' },
        display: { type: 'browser', name: 'inherit' },
    },
};

const DEFAULT_PALETTE_ID = 'Rainbow'; // Unfortunately I didn't name this 'default' or make it null
const fallbackPalette: Palette = {
    type: 'palette',
    colors: ['#3742a0', '#129dc9', '#28c093', '#df3f3f', '#f48d54', '#fac372'],
    name: 'Rainbow',
};

export function colorTable(colorPaletteId: string, steps: number, theme: Theme, dark?: boolean): string[] {
    // Default to brand theme if present, otherwise our default
    const defaultPalette = theme.palettes?.[0];

    const palette =
        (colorPaletteId === DEFAULT_PALETTE_ID
            ? defaultPalette
            : theme.palettes?.find(({ name }) => name === colorPaletteId)) ?? fallbackPalette;

    if (palette.type === 'scale') {
        const scale = chroma.scale(palette.colors).mode('lch');
        return scale.colors(steps);
    } else if ('darkColors' in palette && palette.darkColors && dark) {
        return palette.darkColors.slice(0, steps);
    } else {
        return palette.colors.slice(0, steps);
    }
}

export function getTheme(theme?: Theme): Theme {
    if (!theme) {
        return defaultTheme;
    }

    const fullTheme = {
        palettes: [...(theme.palettes ?? []), ...(defaultTheme.palettes ?? [])],
        ...(theme && 'fonts' in theme ? theme.fonts : defaultTheme.fonts),
    };

    return fullTheme;
}
