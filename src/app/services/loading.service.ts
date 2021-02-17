import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {delay, distinctUntilChanged} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private state$ = new BehaviorSubject<boolean>(false);
  loading$: Observable<boolean> = this.state$.asObservable().pipe(delay(0), distinctUntilChanged());

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
