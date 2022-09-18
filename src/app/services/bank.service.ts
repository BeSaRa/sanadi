import { Lookup } from '@app/models/lookup';
import { ComponentType } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Bank } from '@app/models/bank';
import { DialogService } from './dialog.service';
import { FactoryService } from '@app/services/factory.service';
import { UrlService } from '@app/services/url.service';
import { BankPopupComponent } from '@app/administration/popups/bank-popup/bank-popup.component';
import { CrudWithDialogGenericService } from "@app/generics/crud-with-dialog-generic-service";
import { CastResponse, CastResponseContainer } from "@decorators/cast-response";
import { Pagination } from "@app/models/pagination";

@CastResponseContainer({
  $default: {
    model: () => Bank
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => Bank }
  }
})
@Injectable({
  providedIn: 'root'
})
export class BankService extends CrudWithDialogGenericService<Bank> {
  list: Bank[] = [];
  _getDialogComponent(): ComponentType<any> {
    return BankPopupComponent;
  }

  _getModel() {
    return Bank;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.BANK;
  }

  constructor(public dialog: DialogService, public http: HttpClient, private urlService: UrlService) {
    super();
    FactoryService.registerService('BankService', this);
  }

  @CastResponse(() => Bank, {
    unwrap: 'rs',
    fallback: '$default'
  })
  getBankLookup() {
    return this.http.get<Lookup[]>(this._getServiceURL() + '/lookup');
  }

}
