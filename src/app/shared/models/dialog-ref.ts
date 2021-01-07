import {OverlayRef} from '@angular/cdk/overlay/overlay-ref';
import {LangService} from '../../services/lang.service';
import {Subscription} from 'rxjs';

export class DialogRef {
  langChangeSubscription: Subscription;

  constructor(private overLayRef: OverlayRef, langService: LangService) {
    this.langChangeSubscription = langService.onLanguageChange$.subscribe((lang) => {
      this.overLayRef.setDirection(lang.direction);
    });
  }

  close(): void {
    this.langChangeSubscription.unsubscribe();
    this.overLayRef.dispose();
  }
}
