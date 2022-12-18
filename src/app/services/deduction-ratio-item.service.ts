import {Injectable} from '@angular/core';
import {DeductionRatioItem} from "@app/models/deduction-ratio-item";
import {CrudWithDialogGenericService} from "@app/generics/crud-with-dialog-generic-service";
import {ComponentType} from '@angular/cdk/portal';
import {HttpClient} from '@angular/common/http';
import {DialogService} from './dialog.service';
import {UrlService} from "@services/url.service";
import {FactoryService} from "@services/factory.service";

@Injectable({
  providedIn: 'root'
})
export class DeductionRatioItemService extends CrudWithDialogGenericService<DeductionRatioItem> {
  list: DeductionRatioItem[] = [];

  constructor(public http: HttpClient, public urlService: UrlService, public dialog: DialogService) {
    super()
    FactoryService.registerService('DeductionRatioItemService', this)
  }

  _getDialogComponent(): ComponentType<any> {
    throw new Error('Method not implemented.');
  }

  _getModel(): new () => DeductionRatioItem {
    return DeductionRatioItem
  }

  _getServiceURL(): string {
    return this.urlService.URLS.DEDUCTION_RATIO_ITEM
  }
}
