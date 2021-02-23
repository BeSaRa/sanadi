import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BackendGenericService} from '../generics/backend-generic-service';
import {SubventionRequest} from '../models/subvention-request';
import {UrlService} from './url.service';
import {FactoryService} from './factory.service';
import {Generator} from '../decorators/generator';
import {SubventionRequestAid} from '../models/subvention-request-aid';
import {SubventionRequestAidService} from './subvention-request-aid.service';
import {Observable, of} from 'rxjs';
import {SubventionAidService} from './subvention-aid.service';
import {SubventionRequestInterceptor} from '../model-interceptors/subvention-request-interceptor';
import {SubventionAid} from '../models/subvention-aid';
import {ISubventionRequestCriteria} from '../interfaces/i-subvention-request-criteria';
import {SubventionLogService} from './subvention-log.service';
import {switchMap} from 'rxjs/operators';
import {SubventionLog} from '../models/subvention-log';
import {SubventionLogPopupComponent} from '../user/popups/subvention-log-popup/subvention-log-popup.component';
import {DialogRef} from '../shared/models/dialog-ref';
import {DialogService} from './dialog.service';
import {SubventionAidPopupComponent} from '../user/popups/subvention-aid-popup/subvention-aid-popup.component';

@Injectable({
  providedIn: 'root'
})
export class SubventionRequestService extends BackendGenericService<SubventionRequest> {
  list!: SubventionRequest[];
  private interceptor: SubventionRequestInterceptor = new SubventionRequestInterceptor();

  constructor(private urlService: UrlService,
              public http: HttpClient,
              private subventionAidService: SubventionAidService,
              private subventionRequestAidService: SubventionRequestAidService,
              private subventionLogService: SubventionLogService,
              private dialogService: DialogService) {
    super();
    FactoryService.registerService('SubventionRequestService', this);
  }

  loadSubventionRequestAidByBeneficiaryId(beneficiaryId: number): Observable<SubventionRequestAid[]> {
    return this.subventionRequestAidService.loadByBeneficiaryId(beneficiaryId);
  }

  _getModel() {
    return SubventionRequest;
  }

  _getSendInterceptor() {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.SUBVENTION_REQUEST;
  }

  _getReceiveInterceptor() {
    return this.interceptor.receive;
  }

  loadByCriteriaAsBlob(criteria: any): Observable<Blob> {
    return this.http.get(this._getServiceURL() + '/criteria/export?' + this._parseObjectToQueryString(criteria), {responseType: 'blob'});
  }

  loadByRequestIdAsBlob(requestId: number): Observable<Blob> {
    return this.http.get(this._getServiceURL() + '/' + requestId + '/export', {responseType: 'blob'});
  }

  loadSubventionAidByCriteria(criteria: { benId?: any, requestId?: any }): Observable<SubventionAid[]> {
    return this.subventionAidService.loadByCriteria(criteria);
  }

  loadByCriteria(criteria: Partial<ISubventionRequestCriteria>): Observable<SubventionRequestAid[]> {
    return this.subventionRequestAidService.loadByCriteria(criteria);
  }

  @Generator(undefined, true, {property: 'rs'})
  loadUnderProcess(): Observable<SubventionRequest[]> {
    return this.http.get<SubventionRequest[]>(this._getServiceURL() + '/active-requests');
  }

  openLogDialog(requestId: number): Observable<DialogRef> {
    return this.subventionLogService.loadByRequestId(requestId)
      .pipe(
        switchMap((logList: SubventionLog[]) => {
          return of(this.dialogService.show<SubventionLog[]>(SubventionLogPopupComponent, logList));
        })
      );
  }

  openAidDialog(requestId: number): Observable<DialogRef> {
    return this.loadSubventionAidByCriteria({requestId})
      .pipe(
        switchMap((aidList: SubventionAid[]) => {
          return of(this.dialogService.show<SubventionAid[]>(SubventionAidPopupComponent, aidList));
        })
      );
  }
}
