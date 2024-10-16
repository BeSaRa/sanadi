import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SubventionRequest } from '../models/subvention-request';
import { UrlService } from './url.service';
import { FactoryService } from './factory.service';
import { SubventionRequestAid } from '../models/subvention-request-aid';
import { SubventionRequestAidService } from './subvention-request-aid.service';
import { Observable, of } from 'rxjs';
import { SubventionAidService } from './subvention-aid.service';
import { SubventionAid } from '../models/subvention-aid';
import { ISubventionRequestCriteria } from '@contracts/i-subvention-request-criteria';
import { SubventionLogService } from './subvention-log.service';
import { catchError, map, switchMap } from 'rxjs/operators';
import { SubventionLog } from '../models/subvention-log';
import { SubventionLogPopupComponent } from '../sanady/popups/subvention-log-popup/subvention-log-popup.component';
import { DialogRef } from '../shared/models/dialog-ref';
import { DialogService } from './dialog.service';
import { SubventionAidPopupComponent } from '../sanady/popups/subvention-aid-popup/subvention-aid-popup.component';
import { ReasonPopupComponent } from '../sanady/popups/reason-popup/reason-popup.component';
import { LangService } from './lang.service';
import { SanadiAuditResult } from '@app/models/sanadi-audit-result';
import { Beneficiary } from '@app/models/beneficiary';
import { HasInterception, InterceptParam } from '@decorators/intercept-model';
import { BlobModel } from '@app/models/blob-model';
import { DomSanitizer } from '@angular/platform-browser';
import { CrudGenericService } from '@app/generics/crud-generic-service';
import { CastResponse, CastResponseContainer } from '@decorators/cast-response';
import { Pagination } from '@app/models/pagination';

@CastResponseContainer({
  $default: {
    model: () => SubventionRequest,
  },
  _loadSubventionRequestAuditData: {
    model: () => SanadiAuditResult,
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => SubventionRequest },
  },
})
@Injectable({
  providedIn: 'root',
})
export class SubventionRequestService extends CrudGenericService<SubventionRequest> {
  list!: SubventionRequest[];

  constructor(
    private urlService: UrlService,
    public http: HttpClient,
    private domSanitizer: DomSanitizer,
    private langService: LangService,
    private subventionAidService: SubventionAidService,
    private subventionRequestAidService: SubventionRequestAidService,
    private subventionLogService: SubventionLogService,
    private dialogService: DialogService
  ) {
    super();
    FactoryService.registerService('SubventionRequestService', this);
  }

  loadSubventionRequestAidByBeneficiaryId(
    beneficiaryId: number
  ): Observable<SubventionRequestAid[]> {
    return this.subventionRequestAidService.loadByBeneficiaryId(beneficiaryId);
  }

  _getModel() {
    return SubventionRequest;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.SUBVENTION_REQUEST;
  }

  _getPartialRequestServiceURL(): string {
    return this.urlService.URLS.SUBVENTION_REQUEST_PARTIAL;
  }

  loadByBeneficiaryIdAsBlob(beneficiaryId: number): Observable<Blob> {
    return this.http.get(
      this._getServiceURL() +
        '/sub-aids/beneficiary/' +
        beneficiaryId +
        '/export?lang=' +
        this.langService.getPrintingLanguage(),
      { responseType: 'blob' }
    );
  }

  loadByRequestIdAsBlob(requestId: number): Observable<Blob> {
    return this.http.get(
      this._getServiceURL() +
        '/' +
        requestId +
        '/export?lang=' +
        this.langService.getPrintingLanguage(),
      { responseType: 'blob' }
    );
  }

  loadSubventionAidByCriteria(criteria: {
    benId?: any;
    requestId?: any;
  }): Observable<SubventionAid[]> {
    return this.subventionAidService.loadByCriteria(criteria);
  }

  loadByCriteria(
    criteria: Partial<ISubventionRequestCriteria>
  ): Observable<SubventionRequestAid[]> {
    return this.subventionRequestAidService.loadByCriteria(criteria);
  }

  loadByCriteriaAsBlob(
    criteria: Partial<ISubventionRequestCriteria>
  ): Observable<Blob> {
    criteria.lang = this.langService.getPrintingLanguage();
    return this.subventionRequestAidService.loadByCriteriaAsBlob(criteria);
  }

  @CastResponse(undefined)
  loadUnderProcess(): Observable<SubventionRequest[]> {
    return this.http.get<SubventionRequest[]>(
      this._getServiceURL() + '/active-requests'
    );
  }

  openLogDialog(requestId: number): Observable<DialogRef> {
    return this.subventionLogService.loadByRequestId(requestId).pipe(
      switchMap((logList: SubventionLog[]) => {
        return of(
          this.dialogService.show(SubventionLogPopupComponent, {
            requestId,
            logList,
          })
        );
      })
    );
  }

  openAidDialog(requestId: number, isPartial: boolean): Observable<DialogRef> {
    return this.loadSubventionAidByCriteria({ requestId }).pipe(
      switchMap((aidList: SubventionAid[]) => {
        return of(
          this.dialogService.show<{
            aidList: SubventionAid[];
            isPartial: boolean;
          }>(SubventionAidPopupComponent, {
            aidList,
            isPartial,
          })
        );
      })
    );
  }

  openCancelDialog(
    request: SubventionRequest | SubventionRequestAid
  ): DialogRef {
    return this.dialogService.show(ReasonPopupComponent, {
      record: request,
      titleText: request.requestFullSerial,
      submitButtonKey: 'btn_cancel',
    });
  }

  openDeleteDialog(
    request: SubventionRequest | SubventionRequestAid
  ): DialogRef {
    return this.dialogService.show(ReasonPopupComponent, {
      record: request,
      titleText: request.requestFullSerial,
      submitButtonKey: 'btn_delete',
    });
  }

  @CastResponse('')
  cancelRequest(requestId: number, reason: string): Observable<boolean> {
    return this.http.put<boolean>(this._getServiceURL() + '/cancel', {
      requestId: requestId,
      reason,
    });
  }

  @CastResponse('')
  deleteRequest(requestId: number, reason: string): Observable<boolean> {
    return this.http.put<boolean>(this._getServiceURL() + '/delete', {
      requestId: requestId,
      reason,
    });
  }

  /**
   * @description Loads the subvention request audit data by request id
   * @param requestId
   */
  @CastResponse(() => SanadiAuditResult)
  private _loadSubventionRequestAuditData(
    requestId: number
  ): Observable<SanadiAuditResult[]> {
    return this.http.get<SanadiAuditResult[]>(
      this._getServiceURL() + '/audit/' + requestId
    );
  }

  /**
   * @description Loads the subvention request audit data by request id
   * @param requestId
   */
  loadSubventionRequestAuditData(
    requestId: number
  ): Observable<SanadiAuditResult[]> {
    return this._loadSubventionRequestAuditData(requestId).pipe(
      map((result) =>
        result.map((item) => {
          item.auditEntity = 'SUBVENTION_REQUEST';
          return item;
        })
      )
    );
  }

  @CastResponse(undefined)
  private _loadSubventionRequestAuditDetails(
    auditId: number
  ): Observable<SubventionRequest> {
    return this.http.get<SubventionRequest>(
      this._getServiceURL() + '/audit/updates/' + auditId
    );
  }

  loadSubventionRequestAuditDetails(
    auditId: number
  ): Observable<SubventionRequest> {
    return this._loadSubventionRequestAuditDetails(auditId);
  }

  @HasInterception
  loadDisclosureFormAsBlob(
    @InterceptParam() beneficiary: Beneficiary
  ): Observable<BlobModel> {
    return this.http
      .post(
        this._getServiceURL() + '/beneficiary/nda-form/export',
        beneficiary,
        { responseType: 'blob' }
      )
      .pipe(
        map(
          (blob) => new BlobModel(blob, this.domSanitizer),
          catchError((_) => {
            return of(
              new BlobModel(new Blob([], { type: 'error' }), this.domSanitizer)
            );
          })
        )
      );
  }
}
