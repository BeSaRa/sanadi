import {Injectable, Injector} from '@angular/core';
import {Overlay} from '@angular/cdk/overlay';
import {ComponentPortal} from '@angular/cdk/portal';
import {ToastComponent} from '../components/toast/toast.component';
import {ToastRef} from '../models/toast-ref';
import {TOAST_DATA_TOKEN} from '../tokens/tokens';
import {OverlayRef} from '@angular/cdk/overlay/overlay-ref';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private overlayRefStack: OverlayRef[] = [];

  constructor(private overlay: Overlay, private injector: Injector) {

  }

  /**
   * @description create toast function.
   * @param message content of the toast
   * @param alertClass which class to append to the content div
   * @private
   */
  private createToast(message: string, alertClass: string): ToastRef {
    this.overlayRefStack.push(this.overlay.create({
      panelClass: 'panel-class'
    }));

    const toastRef = new ToastRef(this.overlayRefStack[this.overlayRefStack.length - 1]);
    const injector = this.createInjector(message, toastRef);

    const timer = setTimeout(() => {
      toastRef.close();
      clearTimeout(timer);
    }, 5000);

    const componentPortal = new ComponentPortal(ToastComponent, null, injector);
    const componentRef = this.overlayRefStack[this.overlayRefStack.length - 1].attach(componentPortal);
    componentRef.instance.alertClass = alertClass ? alertClass : 'alert-success';
    toastRef.component = componentRef.instance;

    this.overlayRefStack[this.overlayRefStack.length - 1].hostElement.classList.add('main-toast-wrapper');
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
