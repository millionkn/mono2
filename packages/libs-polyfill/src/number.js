Number.prototype.times = function (fun) {
    return new Array(this.valueOf())
        .fill(null)
        .map((_, i) => fun(i));
};
Number.prototype.asNumber = function () {
    if (Number.isNaN(this) || Infinity === this || -Infinity === this) {
        return null;
    }
    return Number(this).valueOf();
};
export {};