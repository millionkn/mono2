export interface PipeLine<T> {
    unpack: {
        (): T;
        <R>(pipe: (self: T) => R): R;
    };
    pipeLine: <R>(pipe: (self: T) => R) => PipeLine<R>;
}
export interface PipeLike {
    pipeLine: <R>(pipe: (e: this) => R) => PipeLine<R>;
    pipeTap: (tap: (e: this) => void) => this;
    pipe: <R>(pipe: (e: this) => R) => R;
}
export declare function mergePipeLike(prototype: any): void;
declare global {
    interface ObjectConstructor {
        pipeLineFrom<T>(obj: T): PipeLine<T>;
    }
    interface Number {
        pipeLine: <R>(pipe: (e: number) => R) => PipeLine<R>;
        pipeTap: (tap: (e: number) => void) => number;
        pipe: <R>(pipe: (e: number) => R) => R;
    }
    interface String {
        pipeLine: <R>(pipe: (e: string) => R) => PipeLine<R>;
        pipeTap: (tap: (e: string) => void) => string;
        pipe: <R>(pipe: (e: string) => R) => R;
    }
    interface Boolean {
        pipeLine: <R>(pipe: (e: boolean) => R) => PipeLine<R>;
        pipeTap: (tap: (e: boolean) => void) => boolean;
        pipe: <R>(pipe: (e: boolean) => R) => R;
    }
    interface Array<T> extends PipeLike {
    }
    interface Map<K, V> extends PipeLike {
    }
    interface Set<T> extends PipeLike {
    }
}
