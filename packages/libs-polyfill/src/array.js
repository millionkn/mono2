export { };

function expand(item, parent, child, select) {
  return [select(item, parent), ...child(item).flatMap((node) => expand(node, [item, ...parent], child, select))];
}

Object.defineProperties(Array.prototype, {
  filterMap: {
    enumerable: false,
    value: function (fun) {
      const arr = [];
      this.forEach((...args) => {
        const result = fun(...args);
        if (result === undefined || result === null) {
          return;
        }
        arr.push(result);
      });
      return arr;
    }
  },
  findMap: {
    enumerable: false,
    value: function (fun) {
      for (let i = 0; i < this.length; i++) {
        const result = fun(this[i], i, this);
        if (result !== undefined && result !== null) {
          return result;
        }
      }
      return null;
    },
  },
  expand: {
    enumerable: false,
    value: function (child, select) {
      return this.flatMap((item) => expand(item, [], child, select));
    },
  },
  scan: {
    enumerable: false,
    value: function (init, fun) {
      const ret = [];
      this.reduce((pre, cur, index, arr) => {
        const next = fun(pre, cur, index, arr);
        ret.push(next);
        return next;
      }, init);
      return ret;
    },
  },
  asSet: {
    enumerable: false,
    value: function (value = (v) => v) {
      return new Set(this.map(value));
    },
  },
  asMap: {
    enumerable: false,
    value: function (key, value = (v) => v) {
      return new Map(this.map((...args) => [key(...args), value(...args)]));
    },
  },
  asObject: {
    enumerable: false,
    value: function (key, value = (v) => v) {
      return Object.fromEntries(this.asMap(key, value));
    },
  },
  groupBy: {
    enumerable: false,
    value: function (getKey) {
      return this.reduce((cache, cur, index, arr) => {
        const key = getKey(cur, index, arr);
        if (!cache.has(key)) {
          cache.set(key, []);
        }
        cache.get(key).push(cur);
        return cache;
      }, new Map());
    },
  },
  getRandom: {
    enumerable: false,
    value: function () {
      return this[Math.floor(Math.random() * this.length)];
    },
  },
  asTreeArr: {
    enumerable: false,
    value: function (selfKey, parentKey, getResult) {
      const arr = this.map((item) => {
        const self = selfKey(item);
        return {
          self,
          parent: parentKey(item, self),
          cnode: {
            data: getResult(item, self),
            children: [],
          },
        };
      });
      const cache = arr.asMap((e) => e.self);
      arr.forEach(({ parent, self, cnode }) => {
        if (parent === self) {
          return;
        }
        const children = cache.get(parent)?.cnode.children;
        if (!children) {
          return;
        }
        children.push(cnode);
      });
      return arr.filter((e) => e.parent === e.self).map((e) => e.cnode);
    },
  },
  dedup: {
    enumerable: false,
    value: function (getKey) {
      const keys = new Set();
      const result = [];
      this.forEach((obj) => {
        const key = getKey(obj);
        if (keys.has(key)) {
          return;
        }
        keys.add(key);
        result.push(obj);
      });
      return result;
    },
  },
  startsWith: {
    enumerable: false,
    value: function (arr) {
      return [...arr].findIndex((item, i) => item !== this[i]) < 0
    },
  },
  endsWith: {
    enumerable: false,
    value: function (arr) {
      return [...arr].findIndex((item, i, arr) => item !== this[this.length - arr.length + i]) < 0
    },
  },
})
