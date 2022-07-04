import {Injectable, Injector} from '@angular/core';
import {Overlay} from '@angular/cdk/overlay';
import {ComponentPortal} from '@angular/cdk/portal';
import {ToastComponent} from '../shared/components/toast/toast.component';
import {ToastRef} from '../shared/models/toast-ref';
import {TOAST_DATA_TOKEN} from '../shared/tokens/tokens';
import {LangService} from './lang.service';
import {FactoryService} from './factory.service';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private overlayRefStack: ToastRef[] = [];
  private langService: LangService = {} as LangService;
  private maxStackLength: number = 5;

  constructor(private overlay: Overlay, private injector: Injector) {
    FactoryService.registerService('ToastService', this);
    const timerId = setTimeout(() => {
      this.langService = FactoryService.getService('LangService');
      clearTimeout(timerId);
    });

  }

  /**
   * @description create toast function.
   * @param message content of the toast
   * @param alertClass which class to append to the content div.
   * @param closeAfterTime specify the time(in seconds) after which toast will close.
   * Default = 3 seconds
   * @private
   */
  private createToast(message: string, alertClass: string, closeAfterTime: number = 3): ToastRef {

    if (this.overlayRefStack.length && this.overlayRefStack.length === this.maxStackLength) {
      this.overlayRefStack.shift()?.close();
    }
    const toastOverlay = this.overlay.create({
      panelClass: 'panel-class'
    });


    const toastRef = new ToastRef(toastOverlay, this.langService);
    this.overlayRefStack.push(toastRef);

    const injector = this.createInjector(message, toastRef);
    const timer = setTimeout(() => {
      toastRef.close();
      clearTimeout(timer);
    }, closeAfterTime * 1000);

    const componentPortal = new ComponentPortal(ToastComponent, null, injector);
    const componentRef = toastOverlay.attach(componentPortal);
    componentRef.instance.alertClass = alertClass ? alertClass : 'alert-success';
    toastRef.component = componentRef.instance;

    toastOverlay.hostElement.classList.add('main-toast-wrapper');
    return toastRef;
  }

  /**
   * @description create injector for the toast component to use it later after init the component.
   * @param data
   * @param toastRef
   * @private
   */
  private createInjector(data: any, toastRef: ToastRef): Injector {
    return Injector.create({
      providers: [
        {provide: TOAST_DATA_TOKEN, useValue: data}
      ],
      parent: this.injector
    });
  }

  /**
   * @description display Toast message with red color [Error].
   * @param message content of the message that you want to display it inside the toast.
   * @param closeAfterTime specify the time(in seconds) after which toast will close.
   */
  error(message: string, closeAfterTime?: number): ToastRef {
    return this.createToast(message, 'alert-danger', closeAfterTime);
  }

  /**
   * @description display Toast message with green color [Success].
   * @param message content of the message that you want to display it inside the toast.
   * @param closeAfterTime specify the time(in seconds) after which toast will close.
   */
  success(message: string, closeAfterTime?: number): ToastRef {
    return this.createToast(message, 'alert-success', closeAfterTime);
  }

  /**
   * @description display Toast message with blue color [Info].
   * @param message content of the message that you want to display it inside the toast.
   * @param closeAfterTime specify the time(in seconds) after which toast will close.
   */
  info(message: string, closeAfterTime?: number): ToastRef {
    return this.createToast(message, 'alert-info', closeAfterTime);
  }

  /**
   * @description display Toast message with yellow color [Alert-Warning].
   * @param message content of the message that you want to display it inside the toast.
   * @param closeAfterTime specify the time(in seconds) after which toast will close.
   */
  alert(message: string, closeAfterTime?: number): ToastRef {
    return this.createToast(message, 'alert-warning', closeAfterTime);
  }

  /**
   * @description display Toast message with gray color [dimmed].
   * @param message content of the message that you want to display it inside the toast.
   * @param closeAfterTime specify the time(in seconds) after which toast will close.
   */
  gray(message: string, closeAfterTime?: number): ToastRef {
    return this.createToast(message, 'alert-secondary', closeAfterTime);
  }
}
