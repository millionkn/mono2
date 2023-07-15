export {}
function mergePipeLike(prototype, valueOf) {
  Object.defineProperties(prototype, {
    'pipeValue': {
      enumerable: false,
      value: valueOf ? function (pipe) {
        return pipe(this.valueOf());
      } : function (pipe) {
        return pipe(this);
      }
    },
    'pipeTap': {
      enumerable: false,
      value: valueOf ? function (tap) {
        const value = this.valueOf()
        tap(value);
        return value;
      } : function (tap) {
        tap(this);
        return this;
      }
    },
    'pipeLine': {
      enumerable: false,
      value: valueOf ? function (pipe) {
        return Object.pipeLineFrom(this.valueOf()).pipeLine(pipe);
      } : function (pipe) {
        return Object.pipeLineFrom(this).pipeLine(pipe);
      }
    },
  })
}
Object.defineProperties(Object, {
  'pipeLineFrom': {
    enumerable: false,
    value: (value) => {
      return {
        unpack: (pipe = (v) => v) => pipe(value),
        pipeTap: (tap) => {
          tap(value)
          return Object.pipeLineFrom(value)
        },
        pipeLine: (pipe) => Object.pipeLineFrom(pipe(value))
      };
    }
  },
})
mergePipeLike(Number.prototype, true)
mergePipeLike(String.prototype, true)
mergePipeLike(Boolean.prototype, true)
mergePipeLike(Array.prototype, false);
mergePipeLike(Map.prototype, false);
mergePipeLike(Set.prototype, false);
