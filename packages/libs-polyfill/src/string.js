export { };

Object.defineProperties(String.prototype, {
  asNumber: {
    enumerable: false,
    value: function () {
      return Number(this || NaN).asNumber();
    }
  },
  isOneOf: {
    enumerable: false,
    value: function (values) {
      return [...values].includes(this)
    }
  }
})
