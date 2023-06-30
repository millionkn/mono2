export {};
declare global {
    interface Math {
        isInArea(point: [number, number] | null, area: [number, number][]): boolean;
        avg(...arr: number[]): number;
        WGS84ToMercator(point: [number, number]): [number, number];
        distance(p1: [number, number], p2: [number, number]): number;
    }
}
