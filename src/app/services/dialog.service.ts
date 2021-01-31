import {Injectable, Injector} from '@angular/core';
import {ComponentType, Overlay} from '@angular/cdk/overlay';
import {DialogRef} from '../shared/models/dialog-ref';
import {LangService} from './lang.service';
import {IDialogConfig} from '../interfaces/i-dialog-config';
import {PredefinedDialogComponent} from '../shared/popups/predefined-dialog/predefined-dialog.component';
import {ITypeDialogList} from '../interfaces/i-type-dialog-list';
import {FactoryService} from './factory.service';
import {IDialogPredefinedConfig} from '../interfaces/i-dialog-predefined-config';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  langService: LangService = {} as LangService;

  constructor(private overlay: Overlay, private injector: Injector) {
    FactoryService.registerService('DialogService', this);
    const timeoutId = setTimeout(() => {
      this.langService = FactoryService.getService('LangService');
      clearTimeout(timeoutId);
    });
  }

  private _showDialog(component: ComponentType<any>,
                      data?: any,
                      config?: IDialogConfig,
                      predefinedDialog?: keyof ITypeDialogList): DialogRef {
    const overlay = this.overlay.create({
      hasBackdrop: true,
      panelClass: 'dialog-pan-class',
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
    });
    return new DialogRef(overlay, this.langService, this.injector, component, data, config, predefinedDialog);
  }

  show<D>(component: ComponentType<any>, data?: D, config?: IDialogConfig): DialogRef {
    return this._showDialog(component, data, config);
  }

  alert(data?: string, config: IDialogPredefinedConfig = {actionBtn: 'btn_close'}): DialogRef {
    return this._showDialog(PredefinedDialogComponent, data, config, 'alert');
  }

  error(data?: string, config: IDialogPredefinedConfig = {actionBtn: 'btn_close'}): DialogRef {
    return this._showDialog(PredefinedDialogComponent, data, config, 'error');
  }

  success(data?: string, config: IDialogPredefinedConfig = {actionBtn: 'btn_close'}): DialogRef {
    return this._showDialog(PredefinedDialogComponent, data, config, 'success');
  }

  info(data?: string, config: IDialogPredefinedConfig = {actionBtn: 'btn_close'}): DialogRef {
    return this._showDialog(PredefinedDialogComponent, data, config, 'info');
  }

  confirm(data?: string, config: IDialogPredefinedConfig = {cancelBtn: 'btn_no', actionBtn: 'btn_yes'}): DialogRef {
    return this._showDialog(PredefinedDialogComponent, data, config, 'confirm');
  }


}
