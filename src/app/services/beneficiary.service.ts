import {Injectable} from '@angular/core';
import {BackendGenericService} from '../generics/backend-generic-service';
import {Beneficiary} from '../models/beneficiary';
import {FactoryService} from './factory.service';
import {HttpClient, HttpParams} from '@angular/common/http';
import {UrlService} from './url.service';
import {Observable} from 'rxjs';
import * as interceptor from '../model-interceptors/beneficiary-interceptor';
import {Generator} from '../decorators/generator';
import {IBeneficiaryCriteria} from '../interfaces/i-beneficiary-criteria';
import {DialogRef} from '../shared/models/dialog-ref';
import {DialogService} from './dialog.service';
import {SelectBeneficiaryPopupComponent} from '../user/popups/select-beneficiary-popup/select-beneficiary-popup.component';

@Injectable({
  providedIn: 'root'
})
export class BeneficiaryService extends BackendGenericService<Beneficiary> {

  list!: Beneficiary[];

  constructor(public  http: HttpClient, private urlService: UrlService, private dialogService: DialogService) {
    super();
    FactoryService.registerService('BeneficiaryService', this);
  }

  @Generator(undefined, true)
  private _loadByCriteria(criteria: Partial<IBeneficiaryCriteria>): Observable<Beneficiary[]> {
    return this.http.get<Beneficiary[]>(this.urlService.URLS.BENEFICIARY + '/criteria', {
      params: new HttpParams({
        fromString: this._parseObjectToQueryString(criteria)
      })
    });
  }

  loadByCriteria(criteria: Partial<IBeneficiaryCriteria>): Observable<Beneficiary[]> {
    return this._loadByCriteria(criteria);
  }

  _getModel() {
    return Beneficiary;
  }

  _getSendInterceptor() {
    return interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.BENEFICIARY;
  }

  _getReceiveInterceptor() {
    return interceptor.receive;
  }

  openSelectBeneficiaryDialog(list: Beneficiary[]): DialogRef {
    return this.dialogService.show<Beneficiary[]>(SelectBeneficiaryPopupComponent, list);
  }
}
