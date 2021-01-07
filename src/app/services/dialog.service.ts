import {Injectable, Injector} from '@angular/core';
import {ComponentType, Overlay} from '@angular/cdk/overlay';
import {ComponentPortal} from '@angular/cdk/portal';
import {DialogRef} from '../shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '../shared/tokens/tokens';
import {DialogContainerComponent} from '../shared/components/dialog-container/dialog-container.component';
import {LangService} from './lang.service';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private overlay: Overlay, private injector: Injector, private langService: LangService) {

  }

  show(component: ComponentType<any>, data?: any): DialogRef {
    const overlay = this.overlay.create({
      hasBackdrop: true,
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
    });
    const dialogRef = new DialogRef(overlay, this.langService);
    const injector = this.createInjector(data || null, dialogRef);
    const componentPortal = new ComponentPortal(DialogContainerComponent, null, injector);
    const componentRef = overlay.attach(componentPortal);
    componentRef.instance.portalOutlet?.attachComponentPortal(new ComponentPortal(component, null, injector));
    overlay.hostElement.classList.add('d-flex');
    return dialogRef;
  }

  private createInjector<D>(data: D, dialogRef: DialogRef): Injector {
    return Injector.create({
      providers: [
        {provide: DIALOG_DATA_TOKEN, useValue: data},
        {provide: DialogRef, useValue: dialogRef}
      ],
      parent: this.injector
    });
  }

}
