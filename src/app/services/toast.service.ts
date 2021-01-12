import {Injectable, Injector} from '@angular/core';
import {Overlay} from '@angular/cdk/overlay';
import {ComponentPortal} from '@angular/cdk/portal';
import {ToastComponent} from '../shared/components/toast/toast.component';
import {ToastRef} from '../shared/models/toast-ref';
import {TOAST_DATA_TOKEN} from '../shared/tokens/tokens';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private overlayRefStack: ToastRef[] = [];

  constructor(private overlay: Overlay, private injector: Injector) {

  }

  /**
   * @description create toast function.
   * @param message content of the toast
   * @param alertClass which class to append to the content div
   * @private
   */
  private createToast(message: string, alertClass: string): ToastRef {

    if (this.overlayRefStack.length && this.overlayRefStack.length === 5) {
      this.overlayRefStack.shift()?.close();
    }
    const toastOverlay = this.overlay.create({
      panelClass: 'panel-class'
    });


    const toastRef = new ToastRef(toastOverlay);
    this.overlayRefStack.push(toastRef);

    const injector = this.createInjector(message, toastRef);
    const timer = setTimeout(() => {
      toastRef.close();
      clearTimeout(timer);
    }, 3000);

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
   * @param message:string content of the message that you want to display it inside the toast.
   */
  error(message: string): ToastRef {
    return this.createToast(message, 'alert-danger');
  }

  /**
   * @description display Toast message with green color [Success].
   * @param message:string content of the message that you want to display it inside the toast.
   */
  success(message: string): ToastRef {
    return this.createToast(message, 'alert-success');
  }

  /**
   * @description display Toast message with blue color [Info].
   * @param message:string content of the message that you want to display it inside the toast.
   */
  info(message: string): ToastRef {
    return this.createToast(message, 'alert-info');
  }

  /**
   * @description display Toast message with yellow color [Alert-Warning].
   * @param message:string content of the message that you want to display it inside the toast.
   */
  alert(message: string): ToastRef {
    return this.createToast(message, 'alert-warning');
  }

  /**
   * @description display Toast message with gray color [dimmed].
   * @param message:string content of the message that you want to display it inside the toast.
   */
  gray(message: string): ToastRef {
    return this.createToast(message, 'alert-secondary');
  }
}
