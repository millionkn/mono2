export { }

const createItem = () => ({
  saved: null,
  next: new Map()
})

Object.defineProperties(Object, {
  lazy: {
    enumerable: false,
    value: (f) => {
      const initializer = Object.lazyInitializer(f)
      return initializer
    }
  },
  lazyInitializer: {
    enumerable: false,
    value: (f) => {
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
  },
})
