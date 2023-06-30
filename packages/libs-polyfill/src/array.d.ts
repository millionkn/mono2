export { };
declare global {
    interface Array<T> {
        filterMap<R>(fun: (item: T, index: number, arr: T[]) => R | null): R[];
        findMap<R>(fun: (item: T, index: number, arr: T[]) => R | null): R | null;
        groupBy<K>(key: (item: T, index: number, arr: T[]) => K): Map<K, T[]>;
        expand<R>(child: (item: T) => T[], select: (target: T, parent: T[]) => R): R[];
        asTreeArr<K, R>(selfKey: (item: T) => K, parentKey: (item: T, self: K) => K, getResult: (item: T, self: K) => R): CNode<R>[];
        scan<K>(init: K, fun: (init: K, value: T, index: number, arr: T[]) => K): K[];
        asSet<V = T>(value?: (item: T, index: number, arr: T[]) => V): Set<V>;
        asMap<K, V = T>(key: (item: T, index: number, arr: T[]) => K, value?: (item: T, index: number, arr: T[]) => V): Map<K, V>;
        asObject<K extends string | symbol | number, V = T>(key: (item: T, index: number, arr: T[]) => K, value?: (item: T, index: number, arr: T[]) => V): {
            [key in K]: V;
        };
        getRandom(): T;
        dedup<K>(key: (obj: T) => K): T[];
        startsWith(arr: Iterable<T>): boolean;
        endsWith(arr: Iterable<T>): boolean;
    }
}
