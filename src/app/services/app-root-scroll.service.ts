import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppRootScrollService {
  private onScroll: Subject<number> = new Subject<number>();
  onScroll$: Observable<number> = this.onScroll.asObservable();

  constructor() {
  }

  emitScrollEvent(event: number): void {
    this.onScroll.next(event);
  }
}
