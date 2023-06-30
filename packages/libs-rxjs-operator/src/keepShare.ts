import { MonoTypeOperatorFunction, Observable, share, timer } from "rxjs";

export function keepShare<T>(disposeDelay: number): MonoTypeOperatorFunction<T> {
  return (ob$) => ob$.pipe(share(), (ob$) => new Observable((subscriber) => {
    const subscription = ob$.subscribe({
      next: (v) => subscriber.next(v),
      error: (e) => subscriber.error(e),
      complete: () => subscriber.complete(),
    })
    return () => timer(disposeDelay).subscribe(() => subscription.unsubscribe())
  }))
}