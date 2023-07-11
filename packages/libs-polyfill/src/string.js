String.prototype.asNumber = function () {
    return Number(this || NaN).asNumber();
};
String.prototype.isOneOf = function (values) {
    return [...values].includes(this)
}
export { };
