import {ComponentType} from '@angular/cdk/portal';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BackendWithDialogOperationsGenericService} from '@app/generics/backend-with-dialog-operations-generic-service';
import {Bank} from '@app/models/bank';
import {DialogService} from './dialog.service';
import {FactoryService} from '@app/services/factory.service';
import {BankInterceptor} from '@app/model-interceptors/bank-interceptor';
import {UrlService} from '@app/services/url.service';
import {BankPopupComponent} from '@app/administration/popups/bank-popup/bank-popup.component';

@Injectable({
  providedIn: 'root'
})
export class BankService extends BackendWithDialogOperationsGenericService<Bank> {
  list: Bank[] = [];
  interceptor: BankInterceptor = new BankInterceptor();

  _getDialogComponent(): ComponentType<any> {
    return BankPopupComponent;
  }

  _getModel() {
    return Bank;
  }

  _getSendInterceptor() {
    return this.interceptor.send;
  }

  _getReceiveInterceptor() {
    return this.interceptor.receive;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.BANK;
  }

  constructor(public dialog: DialogService, public http: HttpClient, private urlService: UrlService) {
    super();
    FactoryService.registerService('BankService', this);
  }
}
