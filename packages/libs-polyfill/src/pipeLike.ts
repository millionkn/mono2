export interface PipeLine<T> {
  unpack: {
    (): T,
    <R>(pipe: (self: T) => R): R
  }
  pipeLine: <R>(pipe: (self: T) => R) => PipeLine<R>
}

export interface PipeLike {
  pipeLine: <R>(pipe: (e: this) => R) => PipeLine<R>
  pipeTap: (tap: (e: this) => void) => this
  pipe: <R>(pipe: (e: this) => R) => R
}

export function mergePipeLike(prototype: any) {
  prototype.pipe = function (pipe: any) {
    return pipe(this)
  }
  prototype.pipeTap = function (tap: any) {
    tap(this)
    return this
  }
  prototype.pipeLine = function (pipe: any) {
    return Object.pipeLineFrom(this).pipeLine(pipe)
  }
}

declare global {
  interface ObjectConstructor {
    pipeLineFrom<T>(obj: T): PipeLine<T>
  }
  interface Number {
    pipeLine: <R>(pipe: (e: number) => R) => PipeLine<R>
    pipeTap: (tap: (e: number) => void) => number
    pipe: <R>(pipe: (e: number) => R) => R
  }
  interface String {
    pipeLine: <R>(pipe: (e: string) => R) => PipeLine<R>
    pipeTap: (tap: (e: string) => void) => string
    pipe: <R>(pipe: (e: string) => R) => R
  }
  interface Array<T> extends PipeLike { }
  interface Map<K, V> extends PipeLike { }
  interface Set<T> extends PipeLike { }
}
Object.pipeLineFrom = (value) => {
  return {
    unpack: (pipe = (v: any) => v) => pipe(value),
    pipeLine: (pipe) => Object.pipeLineFrom(pipe(value))
  }
}
Number.prototype.pipe = function (pipe: any) {
  return pipe(this.valueOf())
}
Number.prototype.pipeTap = function (tap: any) {
  const value = this.valueOf()
  tap(value)
  return value
}
Number.prototype.pipeLine = function (pipe: any) {
  return Object.pipeLineFrom(this.valueOf()).pipeLine(pipe)
}
String.prototype.pipe = function (pipe: any) {
  return pipe(this.valueOf())
}
String.prototype.pipeTap = function (tap: any) {
  const value = this.valueOf()
  tap(value)
  return value
}
String.prototype.pipeLine = function (pipe: any) {
  return Object.pipeLineFrom(this.valueOf()).pipeLine(pipe)
}
mergePipeLike(Array.prototype)
mergePipeLike(Map.prototype)
mergePipeLike(Set.prototype)
