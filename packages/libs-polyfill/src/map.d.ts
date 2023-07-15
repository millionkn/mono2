export { };
declare global {
  interface Map<K, V> {
    mapValue<R>(fun: (entities: readonly [K, V], index: number) => R): Map<K, R>;
    asArray<R>(mapper: (entries: [K, V], index: number) => R): R[];
  }
}
