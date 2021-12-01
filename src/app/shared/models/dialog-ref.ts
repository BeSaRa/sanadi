import {OverlayRef} from '@angular/cdk/overlay/overlay-ref';
import {LangService} from '@app/services/lang.service';
import {Observable, Subject, Subscription} from 'rxjs';
import {ComponentRef, Injector, Renderer2} from '@angular/core';
import {DialogContainerComponent} from '../components/dialog-container/dialog-container.component';
import {ComponentPortal} from '@angular/cdk/portal';
import {DIALOG_CONFIG_TOKEN, DIALOG_DATA_TOKEN} from '../tokens/tokens';
import {ComponentType} from '@angular/cdk/overlay';
import {IDialogConfig} from '@app/interfaces/i-dialog-config';
import {pluck} from 'rxjs/operators';
import {ITypeDialogList} from '@app/interfaces/i-type-dialog-list';
import {PredefinedDialogComponent} from '../popups/predefined-dialog/predefined-dialog.component';

export class DialogRef {
  langChangeSubscription: Subscription | undefined = undefined;
  containerRef: ComponentRef<DialogContainerComponent> | null = null;
  injector: Injector | undefined;
  closeSubscription: Subscription | undefined;
  private afterCloseSub: Subject<any> = new Subject<any>();
  onAfterClose$: Observable<any> = this.afterCloseSub.asObservable();
  instance!: ComponentType<any>;
  private renderer2!: Renderer2;
  private componentRef!: ComponentRef<any>;
  fullscreen: boolean = false;

  constructor(private overLayRef: OverlayRef,
              private langService: LangService,
              private parentInjector: Injector,
              private component: ComponentType<any>,
              private data?: any,
              private dialogConfig?: IDialogConfig,
              private predefinedDialogType?: keyof ITypeDialogList,
              private buttonsList?: any[]) {
    this.watchLanguage();
    this.startShowDialog();
  }

  startShowDialog(): void {
    this.overLayRef.hostElement.classList.add('d-flex');
    this.injector = this.createInjector(this.data, this);
    const containerPortal = new ComponentPortal(DialogContainerComponent, null, this.injector);
    this.containerRef = this.overLayRef.attach(containerPortal);
    this.renderer2 = this.containerRef.instance.renderer2;
    this.subscribeDependOnConfig();
    this.attacheComponentToContainer();
  }

  attacheComponentToContainer(): void {
    const compPortal = new ComponentPortal(this.component, null, this.injector);
    this.componentRef = this.containerRef?.instance.portalOutlet?.attachComponentPortal(compPortal) as ComponentRef<any>;

    if (this.dialogConfig?.fullscreen) {
      this.fullscreen = true;
    }
    this.addRemoveFullscreenClass();

    try {
      this.componentRef?.location.nativeElement.classList.add('dialog-item');
    } catch (e) {
      console.log('I have a Problem in adding class dialog-item to the element', this.componentRef?.location.nativeElement);
    }
    if (this.predefinedDialogType) {
      const component: ComponentRef<PredefinedDialogComponent> = this.componentRef as ComponentRef<PredefinedDialogComponent>;
      component.instance.type = this.predefinedDialogType;
      component.instance.buttonsList = this.buttonsList || [];
    }
    this.instance = this.componentRef?.instance;
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
      this.closeSubscription = this.overLayRef.backdropClick().subscribe(() => {
        this.close();
        this.closeSubscription?.unsubscribe();
      });
    }
    if (this.dialogConfig.escToClose) {
      this.closeSubscription = this.overLayRef.keydownEvents().pipe(pluck('code')).subscribe((value) => {
        if (value === 'Escape') {
          this.close();
          this.closeSubscription?.unsubscribe();
        }
      });
    }
  }

  private createInjector<D>(data: D, dialogRef: DialogRef): Injector {
    return Injector.create({
      providers: [
        {provide: DIALOG_DATA_TOKEN, useValue: data},
        {provide: DialogRef, useValue: dialogRef},
        {provide: DIALOG_CONFIG_TOKEN, useValue: this.dialogConfig}
      ],
      parent: this.parentInjector
    });
  }

  private addRemoveFullscreenClass() {
    const element = this.componentRef.location.nativeElement;
    this.fullscreen ? this.renderer2.addClass(element, 'fullscreen') : this.renderer2.removeClass(element, 'fullscreen');
  }

  toggleFullscreen(): void {
    this.fullscreen = !this.fullscreen;
    this.addRemoveFullscreenClass();
  }
}
