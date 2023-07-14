export { }

const createItem = () => ({
  saved: null,
  next: new Map()
})

Object.lazyInitializer = (f) => {
  const root = createItem()
  return (...args) => {
    const target = args.reduce((pre, cur) => {
      if (!pre.next.has(cur)) { pre.next.set(cur, createItem()) }
      return pre.next.get(cur)
    }, root)
    if (target.saved === null) {
      target.saved = { value: f(...args) }
    }
    return target.saved.value
  }
}

Object.lazy = (f) => {
  const initializer = Object.lazyInitializer(f)
  return initializer
}