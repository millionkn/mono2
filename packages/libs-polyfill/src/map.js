Map.prototype.asArray = function (mapper) {
    return [...this.entries()].map(([k, v], index) => mapper([k, v], index));
};
Map.prototype.mapValue = function (fun) {
    return new Map([...this.entries()].map(([key, value], index) => [key, fun([key, value], index)]));
};
export {};
