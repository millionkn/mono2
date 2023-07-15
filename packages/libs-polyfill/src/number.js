export { };

Object.defineProperties(Number.prototype, {
  times: {
    enumerable: false,
    value: function (fun) {
      return new Array(this.valueOf())
        .fill(null)
        .map((_, i) => fun(i));
    }
  },
  asNumber: {
    enumerable: false,
    value: function () {
      if (Number.isNaN(this) || Infinity === this || -Infinity === this) {
        return null;
      }
      return Number(this).valueOf();
    }
  },
})
