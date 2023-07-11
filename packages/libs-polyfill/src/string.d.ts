export { };
declare global {
    interface String {
        asNumber: () => number | null;
        isOneOf<T>(values: Iterable<T>): this is T
    }
}
