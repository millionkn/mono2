export { };
declare global {
  interface ObjectConstructor {
    lazy<T>(init: () => T): () => T
  }
}
