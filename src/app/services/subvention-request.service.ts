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
import {ReasonPopupComponent} from '../user/popups/reason-popup/reason-popup.component';
import {LangService} from './lang.service';
import {RequestDetailsPopupComponent} from '../user/popups/request-details-popup/request-details-popup.component';
import {FilterRequestPopupComponent} from '../user/popups/filter-request-popup/filter-request-popup.component';
import {IPartialRequestCriteria} from '../interfaces/i-partial-request-criteria';
import {OrgUnit} from '../models/org-unit';
import {OrganizationUnitService} from './organization-unit.service';

@Injectable({
  providedIn: 'root'
})
export class SubventionRequestService extends BackendGenericService<SubventionRequest> {
  list!: SubventionRequest[];
  private interceptor: SubventionRequestInterceptor = new SubventionRequestInterceptor();

  constructor(private urlService: UrlService,
              public http: HttpClient,
              private langService: LangService,
              private subventionAidService: SubventionAidService,
              private subventionRequestAidService: SubventionRequestAidService,
              private subventionLogService: SubventionLogService,
              private dialogService: DialogService,
              private orgUnitService: OrganizationUnitService) {
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

  loadByCriteriaAsBlob(criteria: Partial<ISubventionRequestCriteria> | string): Observable<Blob> {
    let finalCriteriaString;
    if (typeof criteria === 'string') {
      finalCriteriaString = criteria;
    } else {
      finalCriteriaString = this._parseObjectToQueryString({...criteria});
    }
    finalCriteriaString = finalCriteriaString + '&lang=' + this.langService.getPrintingLanguage();
    return this.http.get(this._getServiceURL() + '/criteria/export?' + finalCriteriaString, {responseType: 'blob'});
  }

  loadByBeneficiaryIdAsBlob(beneficiaryId: number): Observable<Blob> {
    return this.http.get(this._getServiceURL() + '/sub-aids/beneficiary/' + beneficiaryId + '/export?lang=' + this.langService.getPrintingLanguage(), {responseType: 'blob'});
  }

  loadByRequestIdAsBlob(requestId: number): Observable<Blob> {
    return this.http.get(this._getServiceURL() + '/' + requestId + '/export?lang=' + this.langService.getPrintingLanguage(), {responseType: 'blob'});
  }

  loadSubventionAidByCriteria(criteria: { benId?: any, requestId?: any }): Observable<SubventionAid[]> {
    return this.subventionAidService.loadByCriteria(criteria);
  }

  loadByCriteria(criteria: Partial<ISubventionRequestCriteria> | string): Observable<SubventionRequestAid[]> {
    return this.subventionRequestAidService.loadByCriteria(criteria);
  }

  @Generator(undefined, true, {property: 'rs'})
  loadUnderProcess(): Observable<SubventionRequest[]> {
    return this.http.get<SubventionRequest[]>(this._getServiceURL() + '/active-requests');
  }

  @Generator(undefined, true, {property: 'rs'})
  loadPartialRequests(): Observable<SubventionRequest[]> {
    return this.http.get<SubventionRequest[]>(this._getServiceURL() + '/partial-requests/active');
  }

  @Generator(undefined, true, {property: 'rs'})
  loadPartialRequestsByCriteria(criteria: Partial<IPartialRequestCriteria>): Observable<SubventionRequest[]> {
    return this.http.get<SubventionRequest[]>(this._getServiceURL() + '/partial-requests/criteria'  + this._generateQueryString(criteria));
  }

  @Generator(undefined, false, {property: 'rs'})
  loadPartialRequestById(id: number): Observable<SubventionRequest> {
    return this.http.get<SubventionRequest>(this._getServiceURL() + '/partial-requests/' + id);
  }

  openLogDialog(requestId: number): Observable<DialogRef> {
    return this.subventionLogService.loadByRequestId(requestId)
      .pipe(
        switchMap((logList: SubventionLog[]) => {
          return of(this.dialogService.show(SubventionLogPopupComponent, {
            requestId,
            logList
          }));
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

  openPartialRequestDetailsDialog(requestId: number): Observable<DialogRef> {
    return this.loadPartialRequestById(requestId)
      .pipe(
        switchMap((requestData: SubventionRequest) => {
          return of(this.dialogService.show(RequestDetailsPopupComponent, {
            requestData,
            allowAddPartialRequest: true
          }));
        })
      );
  }

  openCancelDialog(request: SubventionRequest | SubventionRequestAid): DialogRef {
    return this.dialogService.show(ReasonPopupComponent, {
      record: request,
      titleText: request.requestFullSerial,
      submitButtonKey: 'btn_cancel'
    });
  }

  openDeleteDialog(request: SubventionRequest | SubventionRequestAid): DialogRef {
    return this.dialogService.show(ReasonPopupComponent, {
      record: request,
      titleText: request.requestFullSerial,
      submitButtonKey: 'btn_delete'
    });
  }

  cancelRequest(requestId: number, reason: string): Observable<boolean> {
    return this.http.put<boolean>(this._getServiceURL() + '/cancel', {
      requestId: requestId,
      reason
    });
  }

  deleteRequest(requestId: number, reason: string): Observable<boolean> {
    return this.http.put<boolean>(this._getServiceURL() + '/delete', {
      requestId: requestId,
      reason
    });
  }

  openFilterPartialRequestDialog(filterCriteria: Partial<IPartialRequestCriteria>): Observable<DialogRef> {
    return this.orgUnitService.load().pipe(
      switchMap((orgUnits: OrgUnit[]) => {
        return of(this.dialogService.show(FilterRequestPopupComponent, {
          criteria: filterCriteria,
          orgUnits: orgUnits
        }));
      })
    )
  }

  @Generator(undefined, false, {property: 'rs'})
  createPartialRequestById(id: number): Observable<SubventionRequest> {
    return this.http.put<SubventionRequest>(this._getServiceURL() + '/partial-requests/create/' + id, {});
  }
}
