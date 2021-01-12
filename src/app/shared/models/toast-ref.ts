import {OverlayRef} from '@angular/cdk/overlay/overlay-ref';
import {ToastComponent} from '../components/toast/toast.component';
import {AnimationEvent} from '@angular/animations';
import {filter, take} from 'rxjs/operators';
import {Subject, Subscription} from 'rxjs';
import {LangService} from '../../services/lang.service';
import {Language} from '../../models/language';

export class ToastRef {
  component: ToastComponent | null = null;
  private closeSubject = new Subject<void>();
  afterClose$ = this.closeSubject.asObservable();
  langSubscription?: Subscription;

  constructor(private overlay: OverlayRef, langService: LangService) {
    this.langSubscription = langService.onLanguageChange$.subscribe((lang: Language) => {
      this.overlay.setDirection(lang.direction);
    });
  }

  /**
   * @description close/hide the Toast message
   */
  close(): void {
    // listen for animation end event
    const animationSub = this.component?.animationChanges
      .pipe(
        filter((event: AnimationEvent) => event.phaseName === 'done' && event.toState === 'void'),
        take(1)
      )
      .subscribe((_) => {
        this.overlay.dispose();
        this.closeSubject.next();
        this.closeSubject.complete();
        this.langSubscription?.unsubscribe();
        animationSub?.unsubscribe();
      });
    this.component?.closeToast();
  }
}
