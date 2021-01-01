import {OverlayRef} from '@angular/cdk/overlay/overlay-ref';
import {ToastComponent} from '../components/toast/toast.component';
import {AnimationEvent} from '@angular/animations';
import {filter, take} from 'rxjs/operators';
import {Subject} from 'rxjs';

export class ToastRef {
  component: ToastComponent | null = null;
  private closeSubject = new Subject<void>();
  afterClose$ = this.closeSubject.asObservable();

  constructor(private overlay: OverlayRef) {
  }

  /**
   * @description close/hide the Toast message
   */
  close(): void {
    // listen for animation end event
    this.component?.animationChanges
      .pipe(
        filter((event: AnimationEvent) => event.phaseName === 'done' && event.toState === 'void'),
        take(1)
      )
      .subscribe((_) => {
        this.overlay.dispose();
        this.closeSubject.next();
        this.closeSubject.complete();
      });
    this.component?.closeToast();
  }
}
