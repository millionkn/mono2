export {};
declare global {
    interface Set<T> {
        map<R>(cb: (item: T, index: number, arr: T[]) => R): R[];
    }
}
