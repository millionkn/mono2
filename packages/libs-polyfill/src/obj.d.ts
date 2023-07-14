export { };
declare global {
  interface ObjectConstructor {
    lazyInitializer<F extends (...args: any[]) => any>(init: F): F
    lazy<T>(init: () => T): () => T
  }
}
