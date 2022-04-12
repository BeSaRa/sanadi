import {Injectable} from '@angular/core';
import {BackendGenericService} from '../generics/backend-generic-service';
import {Beneficiary} from '../models/beneficiary';
import {FactoryService} from './factory.service';
import {HttpClient, HttpParams} from '@angular/common/http';
import {UrlService} from './url.service';
import {Observable} from 'rxjs';
import {BeneficiaryInterceptor} from '../model-interceptors/beneficiary-interceptor';
import {Generator} from '../decorators/generator';
import {IBeneficiaryCriteria} from '../interfaces/i-beneficiary-criteria';
import {DialogRef} from '../shared/models/dialog-ref';
import {DialogService} from './dialog.service';
import {
  SelectBeneficiaryPopupComponent
} from '../sanady/popups/select-beneficiary-popup/select-beneficiary-popup.component';
import {Pair} from '../interfaces/pair';
import {BeneficiarySaveStatus} from '../enums/beneficiary-save-status.enum';
import {map} from 'rxjs/operators';
import {InterceptParam, SendInterceptor} from '../decorators/model-interceptor';
import {GeneralInterceptor} from '@app/model-interceptors/general-interceptor';
import {IDefaultResponse} from '@app/interfaces/idefault-response';
import {SanadiAuditResult} from '@app/models/sanadi-audit-result';
import {SanadiAuditResultInterceptor} from '@app/model-interceptors/sanadi-audit-result-interceptor';
import {BeneficiaryIncomeInterceptor} from '@app/model-interceptors/beneficiary-income-interceptor';
import {BeneficiaryObligationInterceptor} from '@app/model-interceptors/beneficiary-obligation-interceptor';

@Injectable({
  providedIn: 'root'
})
export class BeneficiaryService extends BackendGenericService<Beneficiary> {
  list!: Beneficiary[];
  beneficiaryIncomeInterceptor = new BeneficiaryIncomeInterceptor();
  beneficiaryObligationInterceptor = new BeneficiaryObligationInterceptor();

  constructor(public http: HttpClient, private urlService: UrlService, private dialogService: DialogService) {
    super();
    FactoryService.registerService('BeneficiaryService', this);
  }

  @Generator(undefined, true)
  private _loadByCriteria(criteria: Partial<IBeneficiaryCriteria>): Observable<Beneficiary[]> {
    return this.http.post<Beneficiary[]>(this.urlService.URLS.BENEFICIARY + '/criteria', criteria);
  }

  loadByCriteria(criteria: Partial<IBeneficiaryCriteria>): Observable<Beneficiary[]> {
    return this._loadByCriteria(criteria);
  }

  @SendInterceptor()
  createWithValidate(@InterceptParam() beneficiary: Partial<Beneficiary>, validate: boolean = true): Observable<Pair<BeneficiarySaveStatus, Beneficiary>> {
    delete beneficiary.id;
    return this.http.post<Pair<BeneficiarySaveStatus, Beneficiary>>(this._getServiceURL() + '/validate-save', beneficiary, {
      params: new HttpParams({
        fromObject: {'with-check': validate + ''}
      })
    }).pipe(map((response: any) => response.rs));
  }

  _getModel() {
    return Beneficiary;
  }

  _getSendInterceptor() {
    return BeneficiaryInterceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.BENEFICIARY;
  }

  _getReceiveInterceptor() {
    return BeneficiaryInterceptor.receive;
  }

  openSelectBeneficiaryDialog(list: Beneficiary[]): DialogRef {
    return this.dialogService.show<Beneficiary[]>(SelectBeneficiaryPopupComponent, list);
  }

  /**
   * @description Loads the beneficiary audit data by request id
   * @param requestId
   */
  loadBeneficiaryAuditData(requestId: number): Observable<SanadiAuditResult[]> {
    return this.http.get<IDefaultResponse<SanadiAuditResult[]>>(this._getServiceURL() + '/audit/' + requestId)
      .pipe(
        map((result) => {
          return result.rs.map(data => {
            let item = Object.assign(new SanadiAuditResult, data),
              interceptor = new SanadiAuditResultInterceptor();

            item = GeneralInterceptor.receive(item);
            item.auditEntity = 'BENEFICIARY';
            return interceptor.receive(item);
          })
        })
      );
  }

  @Generator(undefined, false)
  private _loadBeneficiaryAuditDetails(auditId: number): Observable<Beneficiary> {
    return this.http.get<Beneficiary>(this._getServiceURL() + '/audit/updates/' + auditId);
  }

  loadBeneficiaryAuditDetails(auditId: number): Observable<Beneficiary> {
    return this._loadBeneficiaryAuditDetails(auditId);
  }
}
