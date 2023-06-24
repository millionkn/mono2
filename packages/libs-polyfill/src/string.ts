export {}
declare global {
  interface String {
    asNumber: () => number | null
  }
}
String.prototype.asNumber = function () {
  return Number(this || NaN).asNumber()
}