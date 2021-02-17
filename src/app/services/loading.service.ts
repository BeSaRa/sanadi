import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private state$ = new BehaviorSubject<boolean>(false);
  loading$: Observable<boolean> = this.state$.asObservable().pipe(distinctUntilChanged());

  constructor() {
  }

  private setState(state: boolean): void {
    this.state$.next(state);
  }

  show(): void {
    this.setState(true);
  }

  hide(): void {
    this.setState(false);
  }
}
