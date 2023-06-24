export { }
declare global {
  type CNode<T> = {
    data: T,
    children: CNode<T>[]
  }
  type Type<T> = new (...args: any[]) => T

  type AsyncAble<T> = T | PromiseLike<T>

  type UnpackArray<T> = T extends Array<infer X> ? X : T
}
