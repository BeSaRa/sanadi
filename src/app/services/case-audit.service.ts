import { UrgentInterventionClosureInterceptor } from './../model-interceptors/urgent-intervention-closure-interceptor';
import { ConsultationInterceptor } from '@app/model-interceptors/consultation-interceptor';
import { Injectable } from '@angular/core';
import { CastResponse, CastResponseContainer } from '@decorators/cast-response';
import { Pagination } from '@models/pagination';
import { CaseAudit } from '@models/case-audit';
import { CrudGenericService } from '@app/generics/crud-generic-service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UrlService } from '@services/url.service';
import { DialogService } from '@services/dialog.service';
import { FactoryService } from '@services/factory.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CaseModel } from '@models/case-model';
import { CaseTypes } from '@enums/case-types.enum';
import { ComponentType } from '@angular/cdk/overlay';
import { CaseAuditPopupComponent } from '@modules/e-services-main/popups/case-audit-popup/case-audit-popup.component';
import { CustomsExemptionRemittance } from '@models/customs-exemption-remittance';
import { CustomsExemptionRemittanceInterceptor } from '@model-interceptors/customs-exemption-remittance-interceptor';
import {
  AuditCustomsExemptionComponent
} from '@modules/services/customs-exemption-remittance/audit/audit-customs-exemption/audit-customs-exemption.component';
import {
  CaseAuditDifferencesPopupComponent
} from '@modules/e-services-main/popups/case-audit-differences-popup/case-audit-differences-popup.component';
import { AdminResult } from '@models/admin-result';
import { IValueDifference } from '@contracts/i-value-difference';
import { PartnerApproval } from '@models/partner-approval';
import { PartnerApprovalInterceptor } from '@model-interceptors/partner-approval-interceptor';
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
import { CollectionApproval } from '@app/models/collection-approval';
import { CollectionApprovalInterceptor } from '@app/model-interceptors/collection-approval-interceptor';
import { AuditCollectionServicesApprovalComponent } from '@app/modules/services/collection-approval/audit/audit-collection-services-approval/audit-collection-services-approval.component';
import { CollectorApproval } from '@app/models/collector-approval';
import { CollectorApprovalInterceptor } from '@app/model-interceptors/collector-approval-interceptor';
import { AuditCollectorApprovalComponent } from '@app/modules/services/collector-approval/audit/audit-collector-approval/audit-collector-approval.component';
import { Employment } from '@app/models/employment';
import { EmploymentInterceptor } from '@app/model-interceptors/employment-interceptor';
import { AuditEmploymentComponent } from '@app/modules/services/employment/audit/audit-employment/audit-employment.component';
import { ExternalOrgAffiliation } from '@app/models/external-org-affiliation';
import { ExternalOrgAffiliationInterceptor } from '@app/model-interceptors/external-org-affiliation-interceptor';
import { AuditExternalOrganizationAffiliationComponent } from '@app/modules/services/external-organization-affiliation/audit/audit-external-organization-affiliation/audit-external-organization-affiliation.component';
import { FinalExternalOfficeApproval } from '@app/models/final-external-office-approval';
import { AuditFinalExternalOfficeApprovalComponent } from '@app/modules/services/final-external-office-approval/audit/audit-final-external-office-approval/audit-final-external-office-approval.component';
import { FinancialTransferLicensing } from '@app/models/financial-transfer-licensing';
import { FinancialTransferLicensingInterceptor } from '@app/model-interceptors/financial-transfer-licensing-interceptor';
import { AuditFinancialTransfersLicensingComponent } from '@app/modules/services/financial-transfer-licensing/audit/audit-financial-transfers-licensing/audit-financial-transfers-licensing.component';
import { Consultation } from '@app/models/consultation';
import { AuditConsultationComponent } from '@app/modules/services/consultation/audit/audit-consultation/audit-consultation.component';
import { FinalExternalOfficeApprovalInterceptor } from '@app/model-interceptors/final-external-office-approval-interceptor';
import { UrgentInterventionLicense } from '@app/models/urgent-intervention-license';
import { UrgentInterventionLicenseInterceptor } from '@app/model-interceptors/urgent-intervention-license-interceptor';
import { AuditUrgentInterventionLicenseComponent } from '@app/modules/services/urgent-intervention-licensing/audit/audit-urgent-intervention-license/audit-urgent-intervention-license.component';
import { UrgentInterventionFinancialNotification } from '@app/models/urgent-intervention-financial-notification';
import { UrgentInterventionFinancialNotificationInterceptor } from '@app/model-interceptors/urgent-intervention-financial-notification-interceptor';
import { AuditUrgentInterventionFinancialNotificationComponent } from '@app/modules/services/urgent-intervention-financial-notification/audit/audit-urgent-intervention-financial-notification/audit-urgent-intervention-financial-notification.component';
import { AuditTransferringIndividualFundsAbroadComponent } from '@app/modules/services/transferring-individual-funds-abroad/audit/audit-transferring-individual-funds-abroad/audit-transferring-individual-funds-abroad.component';
import { TransferringIndividualFundsAbroad } from '@app/models/transferring-individual-funds-abroad';
import { TransferringIndividualFundsAbroadInterceptor } from '@app/model-interceptors/transferring-individual-funds-abroad-interceptor';
import { UrgentInterventionAnnouncement } from '@app/models/urgent-intervention-announcement';
import { UrgentInterventionAnnouncementInterceptor } from '@app/model-interceptors/urgent-intervention-announcement-interceptor';
import { AuditUrgentInterventionAnnouncementComponent } from '@app/modules/services/urgent-intervention-announcement/audit/audit-urgent-intervention-announcement/audit-urgent-intervention-announcement.component';
import { AuditUrgentInterventionClosureComponent } from '@app/modules/services/urgent-intervention-closure/audit/audit-urgent-intervention-closure/audit-urgent-intervention-closure.component';
import { UrgentInterventionClosure } from '@app/models/urgent-intervention-closure';
import { AuditProjectFundraisingComponent } from '@app/modules/services/project-fundraising/pages/project-fundraising/audit/audit-project-fundraising/audit-project-fundraising.component';
import { ProjectFundraisingInterceptor } from '@app/model-interceptors/project-fundraising-interceptor';
import { ProjectFundraising } from '@app/models/project-fundraising';
import { ProjectImplementation } from '@app/models/project-implementation';
import { ProjectImplementationInterceptor } from '@app/model-interceptors/project-implementation-interceptor';
import { AuditProjectImplementationComponent } from '@app/modules/services/project-implementation/audit/audit-project-implementation/audit-project-implementation.component';
import { UrgentJointReliefCampaign } from '@app/models/urgent-joint-relief-campaign';
import { UrgentJointReliefCampaignInterceptor } from '@app/model-interceptors/urgent-joint-relief-campaign-interceptor';
import { AuditUrgentJointReliefCampaignComponent } from '@app/modules/services/urgent-joint-relief-campaign/audit/audit-urgent-joint-relief-campaign/audit-urgent-joint-relief-campaign.component';

@CastResponseContainer({
  $default: {
    model: () => CaseAudit
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => CaseAudit }
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
    [CaseTypes.COLLECTION_APPROVAL]: CollectionApproval,
    [CaseTypes.COLLECTOR_LICENSING]: CollectorApproval,
    [CaseTypes.EMPLOYMENT]: Employment,
    [CaseTypes.EXTERNAL_ORG_AFFILIATION_REQUEST]: ExternalOrgAffiliation,
    [CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL]: FinalExternalOfficeApproval,
    [CaseTypes.FINANCIAL_TRANSFERS_LICENSING]: FinancialTransferLicensing,
    [CaseTypes.CONSULTATION]: Consultation,
    [CaseTypes.URGENT_INTERVENTION_LICENSING]: UrgentInterventionLicense,
    [CaseTypes.URGENT_INTERVENTION_FINANCIAL_NOTIFICATION]: UrgentInterventionFinancialNotification,
    [CaseTypes.TRANSFERRING_INDIVIDUAL_FUNDS_ABROAD]: TransferringIndividualFundsAbroad,
    [CaseTypes.URGENT_INTERVENTION_ANNOUNCEMENT]: UrgentInterventionAnnouncement,
    [CaseTypes.URGENT_INTERVENTION_CLOSURE]: UrgentInterventionClosure,
    [CaseTypes.PROJECT_FUNDRAISING]: ProjectFundraising,
    [CaseTypes.PROJECT_IMPLEMENTATION]: ProjectImplementation,
    [CaseTypes.URGENT_JOINT_RELIEF_CAMPAIGN]: UrgentJointReliefCampaign,

  };
  caseInterceptors: { [key in CaseTypes]?: any } = {
    [CaseTypes.CUSTOMS_EXEMPTION_REMITTANCE]: CustomsExemptionRemittanceInterceptor,
    [CaseTypes.PARTNER_APPROVAL]: PartnerApprovalInterceptor,
    [CaseTypes.ORGANIZATION_ENTITIES_SUPPORT]: OrganizationsEntitiesSupportInterceptor,
    [CaseTypes.INQUIRY]: InquiryInterceptor,
    [CaseTypes.AWARENESS_ACTIVITY_SUGGESTION]: AwarenessActivitySuggestionInterceptor,
    [CaseTypes.COLLECTION_APPROVAL]: CollectionApprovalInterceptor,
    [CaseTypes.COLLECTOR_LICENSING]: CollectorApprovalInterceptor,
    [CaseTypes.EMPLOYMENT]: EmploymentInterceptor,
    [CaseTypes.EXTERNAL_ORG_AFFILIATION_REQUEST]: ExternalOrgAffiliationInterceptor,
    [CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL]: FinalExternalOfficeApprovalInterceptor,
    [CaseTypes.FINANCIAL_TRANSFERS_LICENSING]: FinancialTransferLicensingInterceptor,
    [CaseTypes.CONSULTATION]: ConsultationInterceptor,
    [CaseTypes.URGENT_INTERVENTION_LICENSING]: UrgentInterventionLicenseInterceptor,
    [CaseTypes.URGENT_INTERVENTION_FINANCIAL_NOTIFICATION]: UrgentInterventionFinancialNotificationInterceptor,
    [CaseTypes.TRANSFERRING_INDIVIDUAL_FUNDS_ABROAD]: TransferringIndividualFundsAbroadInterceptor,
    [CaseTypes.URGENT_INTERVENTION_ANNOUNCEMENT]: UrgentInterventionAnnouncementInterceptor,
    [CaseTypes.URGENT_INTERVENTION_CLOSURE]: UrgentInterventionClosureInterceptor,
    [CaseTypes.PROJECT_FUNDRAISING]: ProjectFundraisingInterceptor,
    [CaseTypes.PROJECT_IMPLEMENTATION]: ProjectImplementationInterceptor,
    [CaseTypes.URGENT_JOINT_RELIEF_CAMPAIGN]: UrgentJointReliefCampaignInterceptor,
  };
  auditCaseComponents: { [key in CaseTypes]?: ComponentType<any> } = {
    [CaseTypes.CUSTOMS_EXEMPTION_REMITTANCE]: AuditCustomsExemptionComponent,
    [CaseTypes.PARTNER_APPROVAL]: AuditPartnerApprovalComponent,
    [CaseTypes.ORGANIZATION_ENTITIES_SUPPORT]: AuditOrganizationsEntitiesSupportComponent,
    [CaseTypes.INQUIRY]: AuditInquiryAndComplaintComponent,
    [CaseTypes.AWARENESS_ACTIVITY_SUGGESTION]: AuditAwarenessActivitySuggestionComponent,
    [CaseTypes.COLLECTION_APPROVAL]: AuditCollectionServicesApprovalComponent,
    [CaseTypes.COLLECTOR_LICENSING]: AuditCollectorApprovalComponent,
    [CaseTypes.EMPLOYMENT]: AuditEmploymentComponent,
    [CaseTypes.EXTERNAL_ORG_AFFILIATION_REQUEST]: AuditExternalOrganizationAffiliationComponent,
    [CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL]: AuditFinalExternalOfficeApprovalComponent,
    [CaseTypes.FINANCIAL_TRANSFERS_LICENSING]: AuditFinancialTransfersLicensingComponent,
    [CaseTypes.CONSULTATION]: AuditConsultationComponent,
    [CaseTypes.URGENT_INTERVENTION_LICENSING]: AuditUrgentInterventionLicenseComponent,
    [CaseTypes.URGENT_INTERVENTION_FINANCIAL_NOTIFICATION]: AuditUrgentInterventionFinancialNotificationComponent,
    [CaseTypes.TRANSFERRING_INDIVIDUAL_FUNDS_ABROAD]: AuditTransferringIndividualFundsAbroadComponent,
    [CaseTypes.URGENT_INTERVENTION_ANNOUNCEMENT]: AuditUrgentInterventionAnnouncementComponent,
    [CaseTypes.URGENT_INTERVENTION_CLOSURE]: AuditUrgentInterventionClosureComponent,
    [CaseTypes.PROJECT_FUNDRAISING]: AuditProjectFundraisingComponent,
    [CaseTypes.PROJECT_IMPLEMENTATION]: AuditProjectImplementationComponent,
    [CaseTypes.URGENT_JOINT_RELIEF_CAMPAIGN]: AuditUrgentJointReliefCampaignComponent,

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
      params: new HttpParams({ fromObject: criteria })
    }).pipe(catchError(() => of([] as CaseAudit[])));
  }

  loadAuditsByCaseId(caseId: string): Observable<CaseAudit[]> {
    if (!caseId) {
      return of([]);
    }
    return this._loadByCriteria({ caseId: caseId })
      .pipe(catchError(() => of([])));
  }

  showCaseModelAuditPopup(newVersion: CaseModel<any, any>, caseAudit: CaseAudit) {
    this.dialog.show(CaseAuditPopupComponent, {
      newVersion: newVersion,
      caseAudit: caseAudit
    }, { fullscreen: true })
  }

  showDifferencesPopup(differencesList: IValueDifference[], titleInfo?: AdminResult): void {
    this.dialog.show(CaseAuditDifferencesPopupComponent, {
      differencesList: differencesList,
      titleInfo: titleInfo
    }).onAfterClose$.subscribe();
  }
}
