import {Injectable} from '@angular/core';
import {CastResponse, CastResponseContainer} from '@decorators/cast-response';
import {Pagination} from '@models/pagination';
import {CaseAudit} from '@models/case-audit';
import {CrudGenericService} from '@app/generics/crud-generic-service';
import {HttpClient, HttpParams} from '@angular/common/http';
import {UrlService} from '@services/url.service';
import {DialogService} from '@services/dialog.service';
import {FactoryService} from '@services/factory.service';
import {Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {CaseModel} from '@models/case-model';
import {CaseTypes} from '@enums/case-types.enum';
import {ComponentType} from '@angular/cdk/overlay';
import {CaseAuditPopupComponent} from '@modules/e-services-main/popups/case-audit-popup/case-audit-popup.component';
import {CustomsExemptionRemittance} from '@models/customs-exemption-remittance';
import {CustomsExemptionRemittanceInterceptor} from '@model-interceptors/customs-exemption-remittance-interceptor';
import {
  AuditCustomsExemptionComponent
} from '@modules/services/customs-exemption-remittance/audit/audit-customs-exemption/audit-customs-exemption.component';
import {
  CaseAuditDifferencesPopupComponent
} from '@modules/e-services-main/popups/case-audit-differences-popup/case-audit-differences-popup.component';
import {AdminResult} from '@models/admin-result';
import {IValueDifference} from '@contracts/i-value-difference';
import {PartnerApproval} from '@models/partner-approval';
import {PartnerApprovalInterceptor} from '@model-interceptors/partner-approval-interceptor';
import {
  AuditPartnerApprovalComponent
} from '@modules/services/partner-approval/audit/audit-partner-approval/audit-partner-approval.component';
import { OrganizationsEntitiesSupport } from '@app/models/organizations-entities-support';
import { AuditOrganizationsEntitiesSupportComponent } from '@app/modules/services/organization-entities-support/audit/audit-organizations-entities-support/audit-organizations-entities-support.component';
import { OrganizationsEntitiesSupportInterceptor } from '@app/model-interceptors/organizations-entities-support-interceptor';
import { Inquiry } from '@app/models/inquiry';
import { InquiryInterceptor } from '@app/model-interceptors/inquiry-interceptor';
import { AuditInquiryAndComplaintComponent } from '@app/modules/services/inquiries-and-complaints/audit/audit-inquiry-and-complaint/audit-inquiry-and-complaint.component';
import { AwarenessActivitySuggestion } from '@app/models/awareness-activity-suggestion';
import { AwarenessActivitySuggestionInterceptor } from '@app/model-interceptors/awareness-activity-suggestion';
import { AuditAwarenessActivitySuggestionComponent } from '@app/modules/services/awareness-activity-suggestion/audit/audit-awareness-activity-suggestion/audit-awareness-activity-suggestion.component';

@CastResponseContainer({
  $default: {
    model: () => CaseAudit
  },
  $pagination: {
    model: () => Pagination,
    shape: {'rs.*': () => CaseAudit}
  }
})
@Injectable({
  providedIn: 'root'
})
export class CaseAuditService extends CrudGenericService<CaseAudit> {
  list: CaseAudit[] = [];
  caseModels: { [key in CaseTypes]?: any } = {
    [CaseTypes.CUSTOMS_EXEMPTION_REMITTANCE]: CustomsExemptionRemittance,
    [CaseTypes.PARTNER_APPROVAL]: PartnerApproval,
    [CaseTypes.ORGANIZATION_ENTITIES_SUPPORT]: OrganizationsEntitiesSupport,
    [CaseTypes.INQUIRY]: Inquiry,
    [CaseTypes.AWARENESS_ACTIVITY_SUGGESTION]: AwarenessActivitySuggestion,
  };
  caseInterceptors: { [key in CaseTypes]?: any } = {
    [CaseTypes.CUSTOMS_EXEMPTION_REMITTANCE]: CustomsExemptionRemittanceInterceptor,
    [CaseTypes.PARTNER_APPROVAL]: PartnerApprovalInterceptor,
    [CaseTypes.ORGANIZATION_ENTITIES_SUPPORT]: OrganizationsEntitiesSupportInterceptor,
    [CaseTypes.INQUIRY]: InquiryInterceptor,
    [CaseTypes.AWARENESS_ACTIVITY_SUGGESTION]: AwarenessActivitySuggestionInterceptor,
  };
  auditCaseComponents: { [key in CaseTypes]?: ComponentType<any> } = {
    [CaseTypes.CUSTOMS_EXEMPTION_REMITTANCE]: AuditCustomsExemptionComponent,
    [CaseTypes.PARTNER_APPROVAL]: AuditPartnerApprovalComponent,
    [CaseTypes.ORGANIZATION_ENTITIES_SUPPORT]: AuditOrganizationsEntitiesSupportComponent,
    [CaseTypes.INQUIRY]: AuditInquiryAndComplaintComponent,
    [CaseTypes.AWARENESS_ACTIVITY_SUGGESTION]: AuditAwarenessActivitySuggestionComponent,
  };

  constructor(public http: HttpClient,
              private urlService: UrlService,
              public dialog: DialogService) {
    super();
    FactoryService.registerService('CaseAuditService', this);
  }

  _getModel(): { new(): CaseAudit } {
    return CaseAudit;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.CASE_AUDIT;
  }

  @CastResponse(undefined)
  private _loadByCriteria(criteria: Partial<{ caseId: string, version: number }>) {
    return this.http.get<CaseAudit[]>(this._getServiceURL() + '/criteria', {
      params: new HttpParams({fromObject: criteria})
    }).pipe(catchError(() => of([] as CaseAudit[])));
  }

  loadAuditsByCaseId(caseId: string): Observable<CaseAudit[]> {
    if (!caseId) {
      return of([]);
    }
    return this._loadByCriteria({caseId: caseId})
      .pipe(catchError(() => of([])));
  }

  showCaseModelAuditPopup(newVersion: CaseModel<any, any>, caseAudit: CaseAudit) {
    this.dialog.show(CaseAuditPopupComponent, {
      newVersion: newVersion,
      caseAudit: caseAudit
    }, {fullscreen: true})
  }

  showDifferencesPopup(differencesList: IValueDifference[], titleInfo?: AdminResult): void {
    this.dialog.show(CaseAuditDifferencesPopupComponent, {
      differencesList: differencesList,
      titleInfo: titleInfo
    }).onAfterClose$.subscribe();
  }
}
