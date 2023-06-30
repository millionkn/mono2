export {};
declare global {
    interface Number {
        times<T>(fun: (i: number) => T): T[];
        asNumber: () => number | null;
    }
}
