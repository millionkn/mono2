export { };
Object.defineProperties(Set.prototype, {
  map: {
    enumerable: false,
    value: function (cb) {
      return [...this].map((item, index, arr) => cb(item, index, arr));
    },
  }
})

