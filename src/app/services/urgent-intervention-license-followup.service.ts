import {Injectable} from '@angular/core';
import {BaseGenericEService} from '@app/generics/base-generic-e-service';
import {UrgentInterventionLicenseFollowup} from '@app/models/urgent-intervention-license-followup';
import {UrlService} from '@services/url.service';
import {DomSanitizer} from '@angular/platform-browser';
import {DialogService} from '@services/dialog.service';
import {DynamicOptionsService} from '@services/dynamic-options.service';
import {LicenseService} from '@services/license.service';
import {HttpClient, HttpParams} from '@angular/common/http';
import {FactoryService} from '@services/factory.service';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {
  UrgentInterventionLicenseFollowupInterceptor
} from '@app/model-interceptors/urgent-intervention-license-followup-interceptor';
import {
  SearchUrgentInterventionLicenseFollowupCriteria
} from '@app/models/search-urgent-intervention-license-followup-criteria';
import {
  UrgentInterventionAnnouncementSearchCriteria
} from '@app/models/urgent-intervention-announcement-search-criteria';
import {Observable, of} from 'rxjs';
import {UrgentInterventionAnnouncementResult} from '@app/models/urgent-intervention-announcement-result';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {catchError, map, switchMap} from 'rxjs/operators';
import {UrgentInterventionAttachment} from '@app/models/urgent-intervention-attachment';
import {CastResponse, CastResponseContainer} from '@decorators/cast-response';
import {
  UrgentInterventionReportAttachmentPopupComponent
} from '@modules/services/urgent-intervention-license-followup/popups/urgent-intervention-report-attachment-popup/urgent-intervention-report-attachment-popup.component';
import {HasInterception, InterceptParam} from '@decorators/intercept-model';
import {BlobModel} from '@app/models/blob-model';
import {IDefaultResponse} from '@contracts/idefault-response';
import {
  UrgentInterventionReportAttachmentApprovalPopupComponent
} from '@modules/services/urgent-intervention-license-followup/popups/urgent-intervention-report-attachment-approval-popup/urgent-intervention-report-attachment-approval-popup.component';

@CastResponseContainer({
  $default: {
    model: () => UrgentInterventionLicenseFollowup
  }
})
@Injectable({
  providedIn: 'root'
})
export class UrgentInterventionLicenseFollowupService extends BaseGenericEService<UrgentInterventionLicenseFollowup> {

  constructor(private urlService: UrlService,
              public domSanitizer: DomSanitizer,
              public dialog: DialogService,
              public dynamicService: DynamicOptionsService,
              private licenseService: LicenseService,
              public http: HttpClient) {
    super();
    FactoryService.registerService('UrgentInterventionLicenseFollowupService', this);
  }

  searchColumns: string[] = ['fullSerial', 'createdOn', 'caseStatus', 'ouInfo']; //'subject', 'projectName',
  selectLicenseDisplayColumns: string[] = [];
  selectLicenseDisplayColumnsReport: string[] = ['beneficiaryCountry', 'executionCountry', 'subject', 'fullSerial', 'actions'];
  serviceKey: keyof ILanguageKeys = 'menu_urgent_intervention_license_followup';
  jsonSearchFile: string = 'urgent_intervention_license_followup_search_form.json';
  interceptor: IModelInterceptor<UrgentInterventionLicenseFollowup> = new UrgentInterventionLicenseFollowupInterceptor();
  caseStatusIconMap: Map<number, string> = new Map<number, string>();

  _getUrlService(): UrlService {
    return this.urlService;
  }

  getCaseComponentName(): string {
    return 'UrgentInterventionLicenseFollowupComponent';
  }

  _getInterceptor(): Partial<IModelInterceptor<UrgentInterventionLicenseFollowup>> {
    return this.interceptor;
  }

  _getModel(): any {
    return UrgentInterventionLicenseFollowup;
  }

  _getURLSegment(): string {
    return this.urlService.URLS.URGENT_INTERVENTION_LICENSE_FOLLOWUP;
  }

  getSearchCriteriaModel<S extends UrgentInterventionLicenseFollowup>(): UrgentInterventionLicenseFollowup {
    return new SearchUrgentInterventionLicenseFollowupCriteria();
  }

  licenseSearchUrgentInterventionAnnouncement(criteria: Partial<UrgentInterventionAnnouncementSearchCriteria> = {}): Observable<UrgentInterventionAnnouncementResult[]> {
    return this.licenseService.urgentInterventionAnnouncementSearchValidOnly(criteria);
  }

  @CastResponse(() => UrgentInterventionAttachment)
  loadAttachmentsByReportId(reportId: number): Observable<UrgentInterventionAttachment[]> {
    if (!reportId) {
      return of([]);
    }
    return this.http.get<UrgentInterventionAttachment[]>(this._getURLSegment() + '/report/attachment/', {
      params: new HttpParams().set('reportId', reportId)
    });
  }

  openAttachmentsDialog(reportId: number, caseId: string, readonly: boolean, isCurrentRequestReport:boolean): Observable<DialogRef> {
    return this.loadAttachmentsByReportId(reportId).pipe(
      switchMap((result: UrgentInterventionAttachment[]) => {
        return of(this.dialog.show(UrgentInterventionReportAttachmentPopupComponent, {
          list: result,
          reportId: reportId,
          caseId: caseId,
          readonly: readonly,
          isCurrentRequestReport: isCurrentRequestReport
        }));
      })
    );
  }

  @HasInterception
  saveAttachment(caseId: string, @InterceptParam() attachment: UrgentInterventionAttachment, file: File): Observable<any> {
    const formData = new FormData();
    file ? formData.append('content', file) : null;
    attachment.description = attachment.description?? '';
    return this.http.post<any>(this._getURLSegment() + '/report/' + caseId + '/attachment/', formData, {
      params: new HttpParams({fromObject: attachment as any}),
    })
      .pipe(catchError(() => of(null)));
  }
  @HasInterception
  updateAttachment(caseId: string, @InterceptParam() attachment: UrgentInterventionAttachment, file: File): Observable<any> {
    const formData = new FormData();
    file ? formData.append('content', file) : null;
    const model ={
      id: attachment.id,
      documentTitle: attachment.documentTitle,
      vsId:attachment.vsId,
      description: attachment.description?? '',
      reportId: attachment.reportId
    }
    ;
    return this.http.post<any>(this._getURLSegment() +'/report/' + caseId + '/update-attachment/', formData, {
      params: new HttpParams({fromObject: model as any}),
    })
      .pipe(catchError(() => of(null)));
  }
  deleteAttachment(attachmentId: string): Observable<any> {
    return this.http.delete<any>(this._getURLSegment() + '/document/' + attachmentId )
      .pipe(catchError(() => of(null)));
  }

  loadAttachmentAsBlob(attachmentId: string): Observable<BlobModel> {
    return this.http.get(this._getURLSegment() + '/document/' + attachmentId + '/download', {responseType: 'blob'})
      .pipe(
        map(blob => new BlobModel(blob, this.domSanitizer),
          catchError(_ => {
            return of(new BlobModel(new Blob([], {type: 'error'}), this.domSanitizer));
          })));
  }

  approveAttachment(attachmentId: string): DialogRef {
    return this.dialog.show(UrgentInterventionReportAttachmentApprovalPopupComponent, {
      attachmentId,
      isApproved: true
    });
  }

  rejectAttachment(attachmentId: string): DialogRef {
    return this.dialog.show(UrgentInterventionReportAttachmentApprovalPopupComponent, {
      attachmentId,
      isApproved: false
    });
  }

  updateAttachmentApproval(attachmentId: string, isApproved: boolean, justification: string): Observable<UrgentInterventionAttachment | null> {
    return this.http.get<UrgentInterventionAttachment>(this._getURLSegment() + '/report/attachment/' + attachmentId + '/update', {
      params: new HttpParams().set('isApproved', isApproved).set('justification', justification)
    }).pipe(
      catchError(() => of(null))
    );
  }

  launchReport(reportId: number): Observable<boolean> {
    return this.http.post<IDefaultResponse<boolean>>(this._getURLSegment() + '/report/launch', {}, {
      params: new HttpParams().set('reportId', reportId)
    }).pipe(map(response => response.rs));
  }

  sendToSingleDepartmentReportReviewAction(taskName: string, reportId: number): Observable<boolean> {
    return this.http.post<IDefaultResponse<any>>(this._getURLSegment() + '/report/launch-review', {}, {
      params: new HttpParams().set('reportId', reportId).set('taskName', taskName)
    })
      .pipe(map(response => response.rs));
  }
}
