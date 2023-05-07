import {Injectable} from '@angular/core';
import {CrudWithDialogGenericService} from '@app/generics/crud-with-dialog-generic-service';
import {Localization} from '@models/localization';
import {ComponentType} from '@angular/cdk/overlay';
import {LocalizationPopupComponent} from '@app/shared/popups/localization-popup/localization-popup.component';
import {HttpClient} from '@angular/common/http';
import {UrlService} from '@services/url.service';
import {DialogService} from '@services/dialog.service';
import {FactoryService} from '@services/factory.service';
import {CastResponseContainer} from "@decorators/cast-response";
import {Pagination} from "@models/pagination";

@CastResponseContainer({
  $default: {
    model: () => Localization
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => Localization }
  }
})
@Injectable({
  providedIn: 'root'
})
export class LocalizationService extends CrudWithDialogGenericService<Localization> {
  list: Localization[] = [];
  constructor(public http: HttpClient,
              private urlService: UrlService,
              public dialog: DialogService) {
    super();
    FactoryService.registerService('LocalizationService', this);
  }

  _getDialogComponent(): ComponentType<any> {
    return LocalizationPopupComponent;
  }

  _getModel(): { new(): Localization } {
    return Localization;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.LANGUAGE;
  }


}
