import type { SvgrComponent } from './SvgrComponent';

export type Icon = SvgrComponent & {
    source: string;
};

export function icon(path: string): Icon {
    // Necessary due to https://webpack.js.org/guides/dependency-management/#require-with-expression
    const basepath = path.replace('.svg', '');

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const component = require(`${basepath}.svg`).default;
    component.source = require(`${basepath}.svg?source`);

    return component;
}
