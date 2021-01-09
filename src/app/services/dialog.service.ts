import {Injectable, Injector} from '@angular/core';
import {ComponentType, Overlay} from '@angular/cdk/overlay';
import {DialogRef} from '../shared/models/dialog-ref';
import {LangService} from './lang.service';
import {IDialogConfig} from '../interfaces/i-dialog-config';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private overlay: Overlay, private injector: Injector, private langService: LangService) {

  }

  show(component: ComponentType<any>, data?: any, config?: IDialogConfig): DialogRef {
    const overlay = this.overlay.create({
      hasBackdrop: true,
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
    });
    return new DialogRef(overlay, this.langService, this.injector, component, data, config);
  }


}
