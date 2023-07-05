export function mergePipeLike(prototype) {
    prototype.pipe = function (pipe) {
        return pipe(this);
    };
    prototype.pipeTap = function (tap) {
        tap(this);
        return this;
    };
    prototype.pipeLine = function (pipe) {
        return Object.pipeLineFrom(this).pipeLine(pipe);
    };
}
Object.pipeLineFrom = (value) => {
    return {
        unpack: (pipe = (v) => v) => pipe(value),
        pipeLine: (pipe) => Object.pipeLineFrom(pipe(value))
    };
};
Number.prototype.pipe = function (pipe) {
    return pipe(this.valueOf());
};
Number.prototype.pipeTap = function (tap) {
    const value = this.valueOf();
    tap(value);
    return value;
};
Number.prototype.pipeLine = function (pipe) {
    return Object.pipeLineFrom(this.valueOf()).pipeLine(pipe);
};
String.prototype.pipe = function (pipe) {
    return pipe(this.valueOf());
};
String.prototype.pipeTap = function (tap) {
    const value = this.valueOf();
    tap(value);
    return value;
};
String.prototype.pipeLine = function (pipe) {
    return Object.pipeLineFrom(this.valueOf()).pipeLine(pipe);
};
Boolean.prototype.pipe = function (pipe) {
    return pipe(this.valueOf());
};
Boolean.prototype.pipeTap = function (tap) {
    const value = this.valueOf();
    tap(value);
    return value;
};
Boolean.prototype.pipeLine = function (pipe) {
    return Object.pipeLineFrom(this.valueOf()).pipeLine(pipe);
};
mergePipeLike(Array.prototype);
mergePipeLike(Map.prototype);
mergePipeLike(Set.prototype);
