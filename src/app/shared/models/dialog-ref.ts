import {OverlayRef} from '@angular/cdk/overlay/overlay-ref';
import {LangService} from '../../services/lang.service';
import {Observable, Subject, Subscription} from 'rxjs';
import {ComponentRef, Injector} from '@angular/core';
import {DialogContainerComponent} from '../components/dialog-container/dialog-container.component';
import {ComponentPortal} from '@angular/cdk/portal';
import {DIALOG_DATA_TOKEN} from '../tokens/tokens';
import {ComponentType} from '@angular/cdk/overlay';
import {IDialogConfig} from '../../interfaces/i-dialog-config';
import {pluck} from 'rxjs/operators';

export class DialogRef {
  langChangeSubscription: Subscription | undefined = undefined;
  containerRef: ComponentRef<DialogContainerComponent> | null = null;
  injector: Injector | undefined;
  backDropCloseSub: Subscription | undefined;
  private afterCloseSub: Subject<any> = new Subject<any>();
  onAfterClose: Observable<any> = this.afterCloseSub.asObservable();

  constructor(private overLayRef: OverlayRef,
              private langService: LangService,
              private parentInjector: Injector,
              private component: ComponentType<any>,
              private data?: any,
              private dialogConfig?: IDialogConfig) {
    this.watchLanguage();
    this.startShowDialog();
  }

  startShowDialog(): void {
    this.overLayRef.hostElement.classList.add('d-flex');
    this.injector = this.createInjector(this.data, this);
    const containerPortal = new ComponentPortal(DialogContainerComponent, null, this.injector);
    this.containerRef = this.overLayRef.attach(containerPortal);
    this.subscribeDependOnConfig();
    this.attacheComponentToContainer();
  }

  attacheComponentToContainer(): void {
    this.containerRef?.instance.portalOutlet?.attachComponentPortal(new ComponentPortal(this.component, null, this.injector));
  }

  watchLanguage(): void {
    this.langChangeSubscription = this.langService.onLanguageChange$.subscribe((lang) => {
      this.overLayRef.setDirection(lang.direction);
    });
  }

  close(data?: any): void {
    const animationSub = this.containerRef?.instance.animationExitDone.subscribe(() => {
      this.langChangeSubscription?.unsubscribe();
      this.overLayRef.dispose();
      animationSub?.unsubscribe();
      this.afterCloseSub.next(data);
      this.afterCloseSub.complete();
    });
    this.containerRef?.instance.startExitAnimation();
  }

  subscribeDependOnConfig(): void {
    if (!this.dialogConfig) {
      return;
    }

    if (this.dialogConfig.backDropToClose) {
      this.overLayRef.backdropClick().subscribe(() => {
        this.close();
      });
    }
    if (this.dialogConfig.escToClose) {
      this.overLayRef.keydownEvents().pipe(pluck('code')).subscribe((value) => {
        if (value === 'Escape') {
          this.close();
        }
      });
    }
  }

  private createInjector<D>(data: D, dialogRef: DialogRef): Injector {
    return Injector.create({
      providers: [
        {provide: DIALOG_DATA_TOKEN, useValue: data},
        {provide: DialogRef, useValue: dialogRef}
      ],
      parent: this.parentInjector
    });
  }
}
