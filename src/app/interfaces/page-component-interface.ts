import {BehaviorSubject, Subject, Subscription} from 'rxjs';

export interface PageComponentInterface<T> {
  reload$: BehaviorSubject<any>
  add$: Subject<any>
  addSubscription: Subscription;
  reloadSubscription: Subscription;

  add(): void

  edit(model: T, event: MouseEvent): void

  delete(model: T, event: MouseEvent): void

  listenToReload(): void

  listenToAdd(): void
}
