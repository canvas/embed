/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '*.png' {
    const value: any;
    export = value;
}

export type SvgrComponent = React.StatelessComponent<React.SVGAttributes<SVGElement>>;

declare module '*.svg' {
    const ReactComponent: SvgrComponent;

    export { ReactComponent };
}

declare module '*.svg?source' {
    const value: string;
    export = value;
}
