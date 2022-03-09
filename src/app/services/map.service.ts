import {Injectable} from '@angular/core';
import {DialogService} from "@app/services/dialog.service";
import {IMapOptions} from "@app/interfaces/imap-options";
import {DialogRef} from "@app/shared/models/dialog-ref";
import {RacaMapsPopupComponent} from "@app/modules/maps/poups/raca-maps-popup/raca-maps-popup.component";
import {FactoryService} from "@app/services/factory.service";

@Injectable({
  providedIn: 'root'
})
export class MapService {
  loaded: boolean = false;

  constructor(private dialog: DialogService) {
    FactoryService.registerService('MapService', this);
  }

  ping(): void {

  }

  openMap(options: IMapOptions): DialogRef {
    return this.dialog.show(RacaMapsPopupComponent, options)
  }
}
