export { }
declare global {
  interface Set<T> {
    map<R>(cb: (item: T, index: number, arr: T[]) => R): R[]
  }
}
Set.prototype.map = function (cb) {
  return [...this].map((item, index, arr) => cb(item, index, arr))
}