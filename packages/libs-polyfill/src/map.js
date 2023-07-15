export { };

Object.defineProperties(Map.prototype, {
  asArray: {
    enumerable: false,
    value: function (mapper) {
      return [...this.entries()].map(([k, v], index) => mapper([k, v], index));
    }
  },
  mapValue: {
    enumerable: false,
    value: function (fun) {
      return new Map([...this.entries()].map(([key, value], index) => [key, fun([key, value], index)]));
    }
  },
})
