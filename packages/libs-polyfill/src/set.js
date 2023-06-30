Set.prototype.map = function (cb) {
    return [...this].map((item, index, arr) => cb(item, index, arr));
};
export {};
