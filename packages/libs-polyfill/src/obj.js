export { }

const r = {}

Object.lazy = (fun) => {
  let cache = r
  return () => {
    if (cache !== r) { return cache }
    return cache = fun()
  }
}