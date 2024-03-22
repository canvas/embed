import chroma from 'chroma-js';

export type FontFamily =
    | {
          type: 'file';
          fileType: 'woff2';
          name: string;
          url: string;
      }
    | { type: 'browser'; name: string };

type Palette = string[] | { light: string[]; dark: string[] } | { scale: string[] };

export type Theme = {
    palettes: { [palette: string]: Palette };
    fonts?: {
        // Body font - required
        body: FontFamily;

        // Display font (headings, titles, etc.), if different from body font
        display?: FontFamily;

        // Big number - the actual number
        bigNumber?: FontFamily;
    };
};

export const defaultTheme: Theme = {
    palettes: {
        default: {
            light: ['#3742a0', '#129dc9', '#28c093', '#df3f3f', '#f48d54', '#fac372'],
            dark: ['#5ba8f7', '#129dc9', '#28c093', '#df3f3f', '#f48d54', '#fac372'],
        },
        Bright: ['#5ba8f7', '#9b54f3', '#e6482c', '#f98517', '#fdd146', '#72b622'],
        Plasma: {
            scale: ['#1d1489', '#f4bb4d'],
        },
        GreenYellow: {
            scale: ['#103338', '#D1DA62'],
        },
        Blue: {
            scale: ['#0E2836', '#55C4F9'],
        },
        Red: {
            scale: ['#bd0026', '#fed976'],
        },
        Gray: {
            scale: ['#28323f', '#d9e2ec'],
        },
    },
    fonts: {
        body: { type: 'browser', name: 'inherit' },
        display: { type: 'browser', name: 'inherit' },
    },
};

const DEFAULT_PALETTE_ID = 'Rainbow'; // Unfortunately I didn't name this 'default' or make it null
const fallbackPalette = ['#3742a0', '#129dc9', '#28c093', '#df3f3f', '#f48d54', '#fac372'];

export function colorTable(colorPaletteId: string, steps: number, theme: Theme, dark?: boolean): string[] {
    // Default to brand theme if present, otherwise our default
    const defaultPalette = theme.palettes.brand ?? theme.palettes.default;

    const palette =
        (colorPaletteId === DEFAULT_PALETTE_ID ? defaultPalette : theme.palettes[colorPaletteId]) ?? fallbackPalette;

    if ('scale' in palette) {
        const scale = chroma.scale(palette.scale).mode('lch');
        return scale.colors(steps);
    } else if ('light' in palette) {
        if (dark) {
            return palette.dark ? palette.dark.slice(0, steps) : palette.light.slice(0, steps);
        }
        return palette.light.slice(0, steps);
    } else {
        return palette.slice(0, steps);
    }
}
