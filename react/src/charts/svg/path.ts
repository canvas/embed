export function moveCursorTo(x: number, y: number): string {
    return `M${x} ${y}`;
}

export function moveCursor(deltaX: number, deltaY: number): string {
    return `m${deltaX} ${deltaY}`;
}

export function verticalLineTo(y: number): string {
    return `V${y}`;
}

export function verticalLine(deltaY: number): string {
    return `v${deltaY}`;
}

export function lineTo(x: number, y: number): string {
    return `L${x} ${y}`;
}

export function line(deltaX: number, deltaY: number): string {
    return `l${deltaX} ${deltaY}`;
}

export function horizontalLineTo(x: number): string {
    return `H${x}`;
}

export function horizontalLine(deltaX: number): string {
    return `h${deltaX}`;
}

export function ellipticalArcCurveTo(
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    angle = 0,
    arc: 'large' | 'small' = 'small',
    sweep: 'clockwise' | 'counterclockwise' = 'clockwise',
): string {
    return `A${radiusX} ${radiusY} ${angle} ${arc === 'large' ? 1 : 0} ${sweep === 'clockwise' ? 1 : 0} ${x} ${y}`;
}

export function ellipticalArcCurve(
    deltaX: number,
    deltaY: number,
    radiusX: number,
    radiusY: number,
    angle = 0,
    arc: 'large' | 'small' = 'small',
    sweep: 'clockwise' | 'counterclockwise' = 'clockwise',
): string {
    return `a${radiusX} ${radiusY} ${angle} ${arc === 'large' ? 1 : 0} ${
        sweep === 'clockwise' ? 1 : 0
    } ${deltaX} ${deltaY}`;
}
