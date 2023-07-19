import { MonoTypeOperatorFunction, Observable, share, shareReplay, timer } from "rxjs";

export function keepReplay<T>(disposeDelay: number): MonoTypeOperatorFunction<T> {
  return (ob$) => ob$.pipe(
    shareReplay({ bufferSize: 1, refCount: true }),
    (ob$) => new Observable((subscriber) => {
      const subscription = ob$.subscribe({
        next: (v) => subscriber.next(v),
        error: (e) => subscriber.error(e),
        complete: () => subscriber.complete(),
      })
      return () => timer(disposeDelay).subscribe(() => subscription.unsubscribe())
    }),
  )
}