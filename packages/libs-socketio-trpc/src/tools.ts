import { observable } from '@trpc/server/observable';
import { Observable } from 'rxjs';

export function fromRxjs<T>(getOb$: () => Observable<T>) {
  return observable<T>((observer) => {
    const subscribtion = getOb$().subscribe({
      next: (v) => observer.next(v),
      error: (e) => observer.error(e),
      complete: () => observer.complete()
    })
    return () => subscribtion.unsubscribe()
  })
}