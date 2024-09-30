import { FinancialTransferLicensing } from '@app/models/financial-transfer-licensing';
import { OrganizationsEntitiesSupport } from '@app/models/organizations-entities-support';
import { GeneralProcessNotification } from '@app/models/general-process-notification';
import { SearchAwarenessActivitySuggestionCriteria } from '@models/search-awareness-activity-suggestion-criteria';
import { AwarenessActivitySuggestion } from '@models/awareness-activity-suggestion';
import { TransferringIndividualFundsAbroad } from '@app/models/transferring-individual-funds-abroad';
import { ExternalOrgAffiliation } from '@app/models/external-org-affiliation';
import { ExternalOrgAffiliationResult } from '@models/external-org-affiliation-result';
import { ExternalOrgAffiliationSearchCriteria } from '@models/external-org-affiliation-search-criteria';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FactoryService } from '@app/services/factory.service';
import { Observable, of } from 'rxjs';
import { InitialExternalOfficeApprovalResult } from '@app/models/initial-external-office-approval-result';
import { UrlService } from '@app/services/url.service';
import {
  InitialExternalOfficeApprovalSearchCriteria
} from '@app/models/initial-external-office-approval-search-criteria';
import { EmployeeService } from '@app/services/employee.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DialogService } from '@app/services/dialog.service';
import {
  SelectLicensePopupComponent
} from '@app/modules/e-services-main/popups/select-license-popup/select-license-popup.component';
import { FinalExternalOfficeApprovalSearchCriteria } from '@app/models/final-external-office-approval-search-criteria';
import { catchError, map } from 'rxjs/operators';
import { BlobModel } from '@app/models/blob-model';
import { DomSanitizer } from '@angular/platform-browser';
import { CaseTypes } from '@app/enums/case-types.enum';
import { PartnerApproval } from '@app/models/partner-approval';
import { FinalExternalOfficeApprovalResult } from '@app/models/final-external-office-approval-result';
import { FinalExternalOfficeApproval } from '@app/models/final-external-office-approval';
import { InitialExternalOfficeApproval } from '@app/models/initial-external-office-approval';
import {
  InitialExternalOfficeApprovalInterceptor
} from '@app/model-interceptors/initial-external-office-approval-interceptor';
import {
  FinalExternalOfficeApprovalInterceptor
} from '@app/model-interceptors/final-external-office-approval-interceptor';
import { InternalProjectLicenseResult } from '@app/models/internal-project-license-result';
import { InternalProjectLicenseSearchCriteria } from '@app/models/internal-project-license-search-criteria';
import { InternalProjectLicense } from '@app/models/internal-project-license';
import { PartnerApprovalSearchCriteria } from '@app/models/PartnerApprovalSearchCriteria';
import { ServiceRequestTypes } from '@app/enums/service-request-types';
import { IDefaultResponse } from '@app/interfaces/idefault-response';
import { GeneralInterceptor } from '@app/model-interceptors/general-interceptor';
import { Fundraising } from '@app/models/fundraising';
import { FundraisingSearchCriteria } from '@app/models/FundRaisingSearchCriteria';
import { UrgentInterventionLicenseResult } from '@app/models/urgent-intervention-license-result';
import { UrgentInterventionLicense } from '@app/models/urgent-intervention-license';
import { UrgentInterventionLicenseSearchCriteria } from '@app/models/urgent-intervention-license-search-criteria';
import { CollectionLicense } from '@app/license-models/collection-license';
import { CollectorLicense } from '@app/license-models/collector-license';
import { InternalBankAccountLicense } from '@app/license-models/internal-bank-account-license';
import { HasInterception, InterceptionContainer, InterceptParam } from '@decorators/intercept-model';
import { CollectionApprovalInterceptor } from '@app/model-interceptors/collection-approval-interceptor';
import { CollectorApprovalInterceptor } from '@app/model-interceptors/collector-approval-interceptor';
import {
  UrgentInterventionAnnouncementSearchCriteria
} from '@app/models/urgent-intervention-announcement-search-criteria';
import { UrgentInterventionAnnouncementResult } from '@app/models/urgent-intervention-announcement-result';
import { UrgentInterventionAnnouncement } from '@app/models/urgent-intervention-announcement';
import { UrgentInterventionClosure } from '@app/models/urgent-intervention-closure';
import { ForeignCountriesProjectsResult } from '@app/models/foreign-countries-projects-results';
import { ForeignCountriesProjectsSearchCriteria } from '@app/models/foreign-countries-projects-seach-criteria';
import { ForeignCountriesProjects } from '@app/models/foreign-countries-projects';
import { CastResponse } from "@decorators/cast-response";
import { GeneralAssociationMeetingAttendance } from '@app/models/general-association-meeting-attendance';
import { ProjectFundraising } from "@app/models/project-fundraising";
import { ProjectImplementation } from "@models/project-implementation";
import { FinancialAnalysis } from '@app/models/financial-analysis';

const collectionInterceptor = new CollectionApprovalInterceptor()
const collectorInterceptor = new CollectorApprovalInterceptor()

@InterceptionContainer({
  validateMultiLicenseCollection: {
    1: collectionInterceptor.send
  },
  validateMultiLicenseCollector: {
    1: collectorInterceptor.send
  }
})
@Injectable({
  providedIn: 'root'
})
export class LicenseService {

  constructor(private http: HttpClient,
    public urlService: UrlService,
    private dialog: DialogService,
    public domSanitizer: DomSanitizer,
    private employeeService: EmployeeService) {
    FactoryService.registerService('LicenseService', this);
  }

  getServiceUrlByCaseType(caseType: number) {
    let url: string = '';
    switch (caseType) {
      case CaseTypes.INITIAL_EXTERNAL_OFFICE_APPROVAL:
        url = this.urlService.URLS.INITIAL_OFFICE_APPROVAL;
        break;
      case CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL:
        url = this.urlService.URLS.E_FINAL_EXTERNAL_OFFICE_APPROVAL;
        break;
      case CaseTypes.PARTNER_APPROVAL:
        url = this.urlService.URLS.E_PARTNER_APPROVAL;
        break;
      case CaseTypes.INTERNAL_PROJECT_LICENSE:
        url = this.urlService.URLS.INTERNAL_PROJECT_LICENSE;
        break;
      case CaseTypes.COLLECTION_APPROVAL:
        url = this.urlService.URLS.COLLECTION_APPROVAL;
        break;
      case CaseTypes.COLLECTOR_LICENSING:
        url = this.urlService.URLS.COLLECTOR_APPROVAL;
        break;
      case CaseTypes.FUNDRAISING_LICENSING:
        url = this.urlService.URLS.FUNDRAISING;
        break;
      case CaseTypes.URGENT_INTERVENTION_LICENSING:
        url = this.urlService.URLS.URGENT_INTERVENTION_LICENSE;
        break;
      case CaseTypes.URGENT_JOINT_RELIEF_CAMPAIGN:
        url = this.urlService.URLS.URGENT_JOINT_RELIEF_CAMPAIGN;
        break;
      case CaseTypes.URGENT_INTERVENTION_ANNOUNCEMENT:
        url = this.urlService.URLS.URGENT_INTERVENTION_ANNOUNCEMENT;
        break;
      case CaseTypes.CUSTOMS_EXEMPTION_REMITTANCE:
        url = this.urlService.URLS.CUSTOMS_EXEMPTION_REMITTANCE;
        break;
      case CaseTypes.INTERNAL_BANK_ACCOUNT_APPROVAL:
        url = this.urlService.URLS.INTERNAL_BANK_ACCOUNT_APPROVAL;
        break;
      case CaseTypes.EMPLOYMENT:
        url = this.urlService.URLS.EMPLOYMENT;
        break;
      case CaseTypes.URGENT_INTERVENTION_CLOSURE:
        url = this.urlService.URLS.URGENT_INTERVENTION_CLOSURE;
        break;
      case CaseTypes.EXTERNAL_ORG_AFFILIATION_REQUEST:
        url = this.urlService.URLS.EXTERNAL_ORG_AFFILIATION_REQUEST;
        break;
      case CaseTypes.URGENT_INTERVENTION_FINANCIAL_NOTIFICATION:
        url = this.urlService.URLS.URGENT_INTERVENTION_FINANCIAL_NOTIFICATION;
        break;
      case CaseTypes.FOREIGN_COUNTRIES_PROJECTS:
        url = this.urlService.URLS.FOREIGN_COUNTRIES_PROJECTS;
        break;
      case CaseTypes.TRANSFERRING_INDIVIDUAL_FUNDS_ABROAD:
        url = this.urlService.URLS.TRANSFERRING_INDIVIDUAL_FUNDS_ABROAD;
        break;
      case CaseTypes.URGENT_INTERVENTION_LICENSE_FOLLOWUP:
        url = this.urlService.URLS.URGENT_INTERVENTION_LICENSE_FOLLOWUP;
        break;
      case CaseTypes.GENERAL_ASSOCIATION_MEETING_ATTENDANCE:
        url = this.urlService.URLS.GENERAL_ASSOCIATION_MEETING_ATTENDANCE;
        break;
      case CaseTypes.NPO_MANAGEMENT:
        url = this.urlService.URLS.NPO_MANAGEMENT;
        break;
      case CaseTypes.AWARENESS_ACTIVITY_SUGGESTION:
        url = this.urlService.URLS.AWARENESS_ACTIVITY_SUGGESTION;
        break;
      case CaseTypes.GENERAL_PROCESS_NOTIFICATION:
        url = this.urlService.URLS.GENERAL_PROCESS_NOTIFICATION;
        break;
      case CaseTypes.PROJECT_FUNDRAISING:
        url = this.urlService.URLS.PROJECT_FUNDRAISING;
        break;
      case CaseTypes.ORGANIZATION_ENTITIES_SUPPORT:
        url = this.urlService.URLS.ORGANIZATION_ENTITIES_SUPPORT;
        break;
      case CaseTypes.FINANCIAL_TRANSFERS_LICENSING:
        url = this.urlService.URLS.FINANCIAL_TRANSFERS_LICENSING;
        break;
      case CaseTypes.PROJECT_IMPLEMENTATION:
        url = this.urlService.URLS.PROJECT_IMPLEMENTATION;
        break;
      case CaseTypes.COORDINATION_WITH_ORGANIZATION_REQUEST:
        url = this.urlService.URLS.E_COORDINATION_WITH_ORGANIZATION_REQUEST;
        break;
      case CaseTypes.PROJECT_COMPLETION:
        url = this.urlService.URLS.PROJECT_COMPLETION;
        break;
      case CaseTypes.FINANCIAL_ANALYSIS:
        url = this.urlService.URLS.FINANCIAL_ANALYSIS;
        break;
      case CaseTypes.PENALTIES_AND_VIOLATIONS:
        url = this.urlService.URLS.PENALTIES_AND_VIOLATIONS;
        break;
    }
    return url;
  }

  @CastResponse(() => InitialExternalOfficeApprovalResult)
  private _initialLicenseSearch(criteria: Partial<InitialExternalOfficeApprovalSearchCriteria>): Observable<InitialExternalOfficeApprovalResult[]> {
    const orgId = { organizationId: this.employeeService.isExternalUser() ? this.employeeService.getProfile()?.id : undefined }
    return this.http.post<InitialExternalOfficeApprovalResult[]>(this.getServiceUrlByCaseType(CaseTypes.INITIAL_EXTERNAL_OFFICE_APPROVAL) + '/license/search', { ...criteria, ...orgId })
  }

  initialLicenseSearch(criteria: Partial<InitialExternalOfficeApprovalSearchCriteria>): Observable<InitialExternalOfficeApprovalResult[]> {
    return this._initialLicenseSearch(criteria);
  }

  @CastResponse(() => PartnerApproval)
  partnerApprovalLicenseSearch(criteria: Partial<PartnerApprovalSearchCriteria>): Observable<PartnerApproval[]> {
    return this.http.post<PartnerApproval[]>(this.getServiceUrlByCaseType(CaseTypes.PARTNER_APPROVAL) + '/license/search', { ...criteria })
  }

  @CastResponse(() => PartnerApproval)
  partnerApprovalLicenseSearchByOrgId(criteria: Partial<PartnerApprovalSearchCriteria>): Observable<PartnerApproval[]> {
    const orgId = { organizationId: this.employeeService.isExternalUser() ? this.employeeService.getProfile()?.id : undefined }
    return this.http.post<PartnerApproval[]>(this.getServiceUrlByCaseType(CaseTypes.PARTNER_APPROVAL) + '/license/search', { ...criteria, ...orgId })
  }

  @CastResponse(() => Fundraising)
  fundRaisingLicenseSearch(criteria: Partial<FundraisingSearchCriteria>): Observable<Fundraising[]> {
    const orgId = { organizationId: this.employeeService.isExternalUser() ? this.employeeService.getProfile()?.id : undefined };
    return this.http.post<Fundraising[]>(this.getServiceUrlByCaseType(CaseTypes.FUNDRAISING_LICENSING) + "/license/search", { ...criteria, ...orgId });
  }

  @CastResponse(() => FinalExternalOfficeApprovalResult)
  private _finalApprovalLicenseSearch(criteria: Partial<FinalExternalOfficeApprovalSearchCriteria>): Observable<FinalExternalOfficeApprovalResult[]> {
    const orgId = { organizationId: this.employeeService.isExternalUser() ? this.employeeService.getProfile()?.id : undefined }
    return this.http.post<FinalExternalOfficeApprovalResult[]>(this.getServiceUrlByCaseType(CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL) + '/license/search', { ...criteria, ...orgId })
  }

  finalApprovalLicenseSearch(criteria: Partial<FinalExternalOfficeApprovalSearchCriteria>): Observable<FinalExternalOfficeApprovalResult[]> {
    return this._finalApprovalLicenseSearch(criteria);
  }

  @CastResponse(() => ExternalOrgAffiliationResult)
  private _externalOrgAffiliationSearchCriteria(criteria: Partial<ExternalOrgAffiliationSearchCriteria>): Observable<ExternalOrgAffiliationResult[]> {
    const orgId = { organizationId: this.employeeService.isExternalUser() ? this.employeeService.getProfile()?.id : undefined }
    return this.http.post<ExternalOrgAffiliationResult[]>(this.getServiceUrlByCaseType(CaseTypes.EXTERNAL_ORG_AFFILIATION_REQUEST) + '/license/search', { ...criteria, ...orgId })
  }

  externalOrgAffiliationSearch(criteria: Partial<ExternalOrgAffiliationSearchCriteria>): Observable<ExternalOrgAffiliationResult[]> {
    return this._externalOrgAffiliationSearchCriteria(criteria);
  }

  @CastResponse(() => AwarenessActivitySuggestion)
  private _awarenessActivitySuggestionSearchCriteria(criteria: Partial<SearchAwarenessActivitySuggestionCriteria>): Observable<AwarenessActivitySuggestion[]> {
    const orgId = { organizationId: this.employeeService.isExternalUser() ? this.employeeService.getProfile()?.id : undefined }
    return this.http.post<AwarenessActivitySuggestion[]>(this.getServiceUrlByCaseType(CaseTypes.AWARENESS_ACTIVITY_SUGGESTION) + '/license/search', { ...criteria, ...orgId })
  }

  awarenessActivitySuggestionSearch(criteria: Partial<SearchAwarenessActivitySuggestionCriteria>): Observable<AwarenessActivitySuggestion[]> {
    return this._awarenessActivitySuggestionSearchCriteria(criteria);
  }

  @CastResponse(() => GeneralProcessNotification)
  private _GeneralProcessNotificationSearchCriteria(criteria: Partial<GeneralProcessNotification>): Observable<GeneralProcessNotification[]> {
    const orgId = { organizationId: this.employeeService.isExternalUser() ? this.employeeService.getProfile()?.id : undefined }
    return this.http.post<GeneralProcessNotification[]>(this.getServiceUrlByCaseType(CaseTypes.GENERAL_PROCESS_NOTIFICATION) + '/search', { ...criteria, ...orgId })
  }

  GeneralProcessNotificationSearch(criteria: Partial<GeneralProcessNotification>): Observable<GeneralProcessNotification[]> {
    return this._GeneralProcessNotificationSearchCriteria(criteria);
  }

  @CastResponse(() => ForeignCountriesProjectsResult)
  private _foreignCountriesProjectsSearchCriteria(criteria: Partial<ForeignCountriesProjectsSearchCriteria>): Observable<ForeignCountriesProjectsResult[]> {
    const orgId = { organizationId: this.employeeService.isExternalUser() ? this.employeeService.getProfile()?.id : undefined }
    return this.http.post<ForeignCountriesProjectsResult[]>(this.getServiceUrlByCaseType(CaseTypes.FOREIGN_COUNTRIES_PROJECTS) + '/license/search', { ...criteria, ...orgId })
  }

  foreignCountriesProjectsSearch(criteria: Partial<ForeignCountriesProjectsSearchCriteria>): Observable<ForeignCountriesProjectsResult[]> {
    return this._foreignCountriesProjectsSearchCriteria(criteria);
  }

  @CastResponse(() => InternalProjectLicenseResult)
  private _internalProjectLicenseSearch(criteria: Partial<InternalProjectLicenseSearchCriteria>): Observable<InternalProjectLicenseResult[]> {
    const orgId = { organizationId: this.employeeService.isExternalUser() ? this.employeeService.getProfile()?.id : undefined }
    return this.http.post<InternalProjectLicenseResult[]>(this.getServiceUrlByCaseType(CaseTypes.INTERNAL_PROJECT_LICENSE) + '/license/search', { ...criteria, ...orgId })
  }

  internalProjectLicenseSearch(criteria: Partial<InternalProjectLicenseSearchCriteria>): Observable<InternalProjectLicenseResult[]> {
    return this._internalProjectLicenseSearch(criteria);
  }

  @CastResponse(() => UrgentInterventionLicenseResult)
  private _urgentInterventionLicenseSearch(criteria: Partial<UrgentInterventionLicenseSearchCriteria>): Observable<UrgentInterventionLicenseResult[]> {
    const orgId = { organizationId: this.employeeService.isExternalUser() ? this.employeeService.getProfile()?.id : undefined }
    return this.http.post<UrgentInterventionLicenseResult[]>(this.getServiceUrlByCaseType(CaseTypes.URGENT_INTERVENTION_LICENSING) + '/license/search', { ...criteria, ...orgId })
  }

  urgentInterventionLicenseSearch(criteria: Partial<UrgentInterventionLicenseSearchCriteria>): Observable<UrgentInterventionLicenseResult[]> {
    return this._urgentInterventionLicenseSearch(criteria);
  }

  @CastResponse(() => UrgentInterventionAnnouncementResult)
  private _urgentInterventionAnnouncementSearch(criteria: Partial<UrgentInterventionAnnouncementSearchCriteria>, validOnly: boolean = false): Observable<UrgentInterventionAnnouncementResult[]> {
    const orgId = { organizationId: this.employeeService.isExternalUser() ? this.employeeService.getProfile()?.id : undefined },
      url = this.getServiceUrlByCaseType(CaseTypes.URGENT_INTERVENTION_ANNOUNCEMENT) + '/license/search' + (validOnly ? '-valid' : '');
    return this.http.post<UrgentInterventionAnnouncementResult[]>(url, { ...criteria, ...orgId })
  }

  urgentInterventionAnnouncementSearch(criteria: Partial<UrgentInterventionAnnouncementSearchCriteria>): Observable<UrgentInterventionAnnouncementResult[]> {
    return this._urgentInterventionAnnouncementSearch(criteria);
  }

  urgentInterventionAnnouncementSearchValidOnly(criteria: Partial<UrgentInterventionAnnouncementSearchCriteria>): Observable<UrgentInterventionAnnouncementResult[]> {
    return this._urgentInterventionAnnouncementSearch(criteria, true);
  }

  @CastResponse(() => UrgentInterventionClosure)
  private _urgentInterventionClosureSearch(criteria: Partial<UrgentInterventionClosure>): Observable<UrgentInterventionClosure[]> {
    const orgId = { organizationId: this.employeeService.isExternalUser() ? this.employeeService.getProfile()?.id : undefined }
    return this.http.post<UrgentInterventionClosure[]>(this.getServiceUrlByCaseType(CaseTypes.URGENT_INTERVENTION_CLOSURE) + '/license/search', { ...criteria, ...orgId })
  }

  urgentInterventionClosureSearch(criteria: Partial<UrgentInterventionClosure>): Observable<UrgentInterventionClosure[]> {
    return this._urgentInterventionClosureSearch(criteria);
  }

  @CastResponse(() => OrganizationsEntitiesSupport)
  private _organizationsEntitiesSupportSearch(criteria: Partial<OrganizationsEntitiesSupport>): Observable<OrganizationsEntitiesSupport[]> {
    const orgId = { organizationId: this.employeeService.isExternalUser() ? this.employeeService.getProfile()?.id : undefined }
    return this.http.post<OrganizationsEntitiesSupport[]>(this.getServiceUrlByCaseType(CaseTypes.ORGANIZATION_ENTITIES_SUPPORT) + '/license/search', { ...criteria, ...orgId })
  }

  organizationsEntitiesSupportSearch(criteria: Partial<OrganizationsEntitiesSupport>): Observable<OrganizationsEntitiesSupport[]> {
    return this._organizationsEntitiesSupportSearch(criteria);
  }

  @CastResponse(() => FinancialTransferLicensing)
  private _FinancialTransferLicensingSearch(criteria: Partial<FinancialTransferLicensing>): Observable<FinancialTransferLicensing[]> {
    const orgId = { organizationId: this.employeeService.isExternalUser() ? this.employeeService.getProfile()?.id : undefined }
    return this.http.post<FinancialTransferLicensing[]>(this.getServiceUrlByCaseType(CaseTypes.FINANCIAL_TRANSFERS_LICENSING) + '/license/search', { ...criteria, ...orgId })
  }

  FinancialTransferLicensingSearch(criteria: Partial<FinancialTransferLicensing>): Observable<FinancialTransferLicensing[]> {
    return this._FinancialTransferLicensingSearch(criteria);
  }
  @CastResponse(() => FinancialAnalysis)
  private _FinancialAnalysisSearch(criteria: Partial<FinancialAnalysis>): Observable<FinancialAnalysis[]> {
    const orgId = { organizationId: this.employeeService.isExternalUser() ? this.employeeService.getProfile()?.id : undefined }
    return this.http.post<FinancialAnalysis[]>(this.getServiceUrlByCaseType(CaseTypes.FINANCIAL_ANALYSIS) + '/license/search', { ...criteria, ...orgId })
  }

  FinancialAnalysisSearch(criteria: Partial<FinancialAnalysis>): Observable<FinancialAnalysis[]> {
    return this._FinancialAnalysisSearch(criteria);
  }
  @CastResponse(() => InitialExternalOfficeApproval)
  private _loadInitialLicenseByLicenseId(licenseId: string): Observable<InitialExternalOfficeApproval> {
    return this.http.get<InitialExternalOfficeApproval>(this.getServiceUrlByCaseType(CaseTypes.INITIAL_EXTERNAL_OFFICE_APPROVAL) + '/license/' + licenseId + '/details');
  }

  loadInitialLicenseByLicenseId(licenseId: string): Observable<InitialExternalOfficeApproval> {
    return this._loadInitialLicenseByLicenseId(licenseId);
  }

  @CastResponse(() => PartnerApproval)
  private _loadPartnerLicenseByLicenseId(licenseId: string): Observable<PartnerApproval> {
    return this.http.get<PartnerApproval>(this.getServiceUrlByCaseType(CaseTypes.PARTNER_APPROVAL) + '/license/' + licenseId + '/details');
  }

  loadPartnerLicenseByLicenseId(licenseId: string): Observable<PartnerApproval> {
    return this._loadPartnerLicenseByLicenseId(licenseId);
  }

  @CastResponse(() => FinalExternalOfficeApproval)
  private _loadFinalLicenseByLicenseId(licenseId: string): Observable<FinalExternalOfficeApproval> {
    return this.http.get<FinalExternalOfficeApproval>(this.getServiceUrlByCaseType(CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL) + '/license/' + licenseId + '/details');
  }

  loadFinalLicenseByLicenseId(licenseId: string): Observable<FinalExternalOfficeApproval> {
    return this._loadFinalLicenseByLicenseId(licenseId);
  }

  @CastResponse(() => InternalProjectLicense)
  private _loadInternalProjectLicenseByLicenseId(licenseId: string): Observable<InternalProjectLicense> {
    return this.http.get<InternalProjectLicense>(this.getServiceUrlByCaseType(CaseTypes.INTERNAL_PROJECT_LICENSE) + '/license/' + licenseId + '/details');
  }

  loadInternalProjectLicenseByLicenseId(licenseId: string): Observable<InternalProjectLicense> {
    return this._loadInternalProjectLicenseByLicenseId(licenseId);
  }

  @CastResponse(() => Fundraising)
  private _loadFundraisingLicenseByLicenseId(licenseId: string): Observable<Fundraising> {
    return this.http.get<Fundraising>(this.getServiceUrlByCaseType(CaseTypes.FUNDRAISING_LICENSING) + '/license/' + licenseId + '/details');
  }

  loadFundraisingLicenseByLicenseId(licenseId: string): Observable<Fundraising> {
    return this._loadFundraisingLicenseByLicenseId(licenseId);
  }

  @CastResponse(() => CollectorLicense)
  private _validateCollectorLicenseByRequestType<T>(requestType: number, oldLicenseId: string): Observable<T> {
    return this.http.post<T>(this.getServiceUrlByCaseType(CaseTypes.COLLECTOR_LICENSING) + '/draft/validate', {
      requestType,
      collectorItemList: [{
        oldLicenseId
      }]
    });
  }

  @CastResponse(() => InternalBankAccountLicense)
  private _validateInternalBankAccountLicenseByRequestType<T>(requestType: number, oldLicenseId: string): Observable<T> {
    return this.http.post<T>(this.urlService.URLS.INTERNAL_BANK_ACCOUNT_APPROVAL + '/draft/validate', {
      requestType,
      oldLicenseId
    });
  }

  @CastResponse(() => ExternalOrgAffiliation)
  private _validateInternalExternalOrgAffiationsLicenseByRequestType<T>(requestType: number, oldLicenseId: string): Observable<T> {
    return this.http.post<T>(this.urlService.URLS.EXTERNAL_ORG_AFFILIATION_REQUEST + '/draft/validate', {
      requestType,
      oldLicenseId
    });
  }

  @CastResponse(() => ForeignCountriesProjects)
  private _validateForeignCountriesProjectsLicenseByRequestType<T>(requestType: number, oldLicenseId: string): Observable<T> {
    return this.http.post<T>(this.urlService.URLS.FOREIGN_COUNTRIES_PROJECTS + '/draft/validate', {
      requestType,
      oldLicenseId
    });
  }

  @CastResponse(() => UrgentInterventionLicense)
  private _loadUrgentInterventionLicenseByLicenseId(licenseId: string): Observable<UrgentInterventionLicense> {
    return this.http.get<UrgentInterventionLicense>(this.getServiceUrlByCaseType(CaseTypes.URGENT_INTERVENTION_LICENSING) + '/license/' + licenseId + '/details');
  }

  loadUrgentInterventionLicenseByLicenseId(licenseId: string): Observable<UrgentInterventionLicense> {
    return this._loadUrgentInterventionLicenseByLicenseId(licenseId);
  }

  @CastResponse(() => UrgentInterventionAnnouncement)
  private _loadUrgentInterventionAnnouncementByLicenseId(licenseId: string): Observable<UrgentInterventionAnnouncement> {
    return this.http.get<UrgentInterventionAnnouncement>(this.getServiceUrlByCaseType(CaseTypes.URGENT_INTERVENTION_ANNOUNCEMENT) + '/license/' + licenseId + '/details');
  }

  loadUrgentInterventionAnnouncementByLicenseId(licenseId: string): Observable<UrgentInterventionAnnouncement> {
    return this._loadUrgentInterventionAnnouncementByLicenseId(licenseId);
  }

  @CastResponse(() => UrgentInterventionAnnouncement)
  private _loadUrgentInterventionAnnouncementByLicenseVsId(licenseVsId: string): Observable<UrgentInterventionAnnouncement> {
    return this.http.get<UrgentInterventionAnnouncement>(this.getServiceUrlByCaseType(CaseTypes.URGENT_INTERVENTION_ANNOUNCEMENT) + '/document/latest/' + licenseVsId + '/details');
  }

  loadUrgentInterventionAnnouncementByLicenseVsId(licenseVsId: string): Observable<UrgentInterventionAnnouncement> {
    return this._loadUrgentInterventionAnnouncementByLicenseVsId(licenseVsId);
  }

  loadUrgentInterventionInterventionLicense() {
    return this.http.get<any>(this.getServiceUrlByCaseType(CaseTypes.URGENT_INTERVENTION_ANNOUNCEMENT) + '/intervention-license')
  }

  @CastResponse(() => OrganizationsEntitiesSupport)
  private _loadOrganizationsEntitiesSupportByLicenseId(licenseId: string): Observable<OrganizationsEntitiesSupport> {
    return this.http.get<OrganizationsEntitiesSupport>(this.getServiceUrlByCaseType(CaseTypes.ORGANIZATION_ENTITIES_SUPPORT) + '/license/' + licenseId + '/details');
  }

  loadOrganizationsEntitiesSupportByLicenseId(licenseId: string): Observable<OrganizationsEntitiesSupport> {
    return this._loadOrganizationsEntitiesSupportByLicenseId(licenseId);
  }

  @CastResponse(() => FinancialTransferLicensing)
  private _loadFinancialTransferLicensingByLicenseId(licenseId: string): Observable<FinancialTransferLicensing> {
    return this.http.get<FinancialTransferLicensing>(this.getServiceUrlByCaseType(CaseTypes.FINANCIAL_TRANSFERS_LICENSING) + '/license/' + licenseId + '/details');
  }

  loadFinancialTransferLicensingByLicenseId(licenseId: string): Observable<FinancialTransferLicensing> {
    return this._loadFinancialTransferLicensingByLicenseId(licenseId);
  }
  @CastResponse(() => FinancialTransferLicensing)
  private _loadFinancialAnalysisByLicenseId(licenseId: string): Observable<FinancialAnalysis> {
    return this.http.get<FinancialAnalysis>(this.getServiceUrlByCaseType(CaseTypes.FINANCIAL_ANALYSIS) + '/license/' + licenseId + '/details');
  }

  loadFinancialAnalysisByLicenseId(licenseId: string): Observable<FinancialAnalysis> {
    return this._loadFinancialAnalysisByLicenseId(licenseId);
  }

  @CastResponse(() => InitialExternalOfficeApproval)
  _validateInitialApprovalLicenseByRequestType(requestType: number, oldLicenseId: string): Observable<InitialExternalOfficeApproval> {
    return this.http.post<InitialExternalOfficeApproval>(this.getServiceUrlByCaseType(CaseTypes.INITIAL_EXTERNAL_OFFICE_APPROVAL) + '/draft/validate', {
      requestType,
      oldLicenseId
    });
  }

  @CastResponse(() => PartnerApproval)
  _validatePartnerApprovalLicenseByRequestType(requestType: number, oldLicenseId: string): Observable<PartnerApproval> {
    return this.http.post<PartnerApproval>(this.getServiceUrlByCaseType(CaseTypes.PARTNER_APPROVAL) + '/draft/validate', {
      requestType,
      oldLicenseId
    });
  }

  _validateFinalExternalOfficeLicenseByRequestType(requestType: number, oldLicenseId: string): Observable<InitialExternalOfficeApproval | FinalExternalOfficeApproval> {
    let data: any = {
      requestType,
      oldLicenseId
    };
    if (requestType === ServiceRequestTypes.NEW) {
      data.initialLicenseId = oldLicenseId;
      delete data.oldLicenseId;
    }
    return this.http.post<IDefaultResponse<InitialExternalOfficeApproval | FinalExternalOfficeApproval>>(this.getServiceUrlByCaseType(CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL) + '/draft/validate', data)
      .pipe(
        map((response) => {
          let finalResponse, receiveInterceptor;
          if (requestType === ServiceRequestTypes.NEW) {
            receiveInterceptor = (new InitialExternalOfficeApprovalInterceptor()).receive;
            finalResponse = response.rs as InitialExternalOfficeApproval;
            finalResponse = new InitialExternalOfficeApproval().clone({ ...finalResponse });
          } else {
            receiveInterceptor = (new FinalExternalOfficeApprovalInterceptor()).receive;
            finalResponse = response.rs as FinalExternalOfficeApproval;
            finalResponse = new FinalExternalOfficeApproval().clone({ ...finalResponse });
          }
          finalResponse = GeneralInterceptor.receive(finalResponse);
          finalResponse = receiveInterceptor(finalResponse);
          return finalResponse;
        })
      );
  }

  @CastResponse(() => InternalProjectLicense)
  _validateInternalProjectLicenseByRequestType(requestType: number, oldLicenseId: string): Observable<InternalProjectLicense> {
    return this.http.post<InternalProjectLicense>(this.getServiceUrlByCaseType(CaseTypes.INTERNAL_PROJECT_LICENSE) + '/draft/validate', {
      requestType,
      oldLicenseId
    });
  }

  @CastResponse(() => Fundraising)
  _validateFundraisingLicenseByRequestType(requestType: number, oldLicenseId: string): Observable<Fundraising> {
    return this.http.post<Fundraising>(this.getServiceUrlByCaseType(CaseTypes.FUNDRAISING_LICENSING) + '/draft/validate', {
      requestType,
      oldLicenseId
    });
  }

  @CastResponse(() => UrgentInterventionLicense)
  _validateUrgentInterventionLicenseByRequestType(requestType: number, oldLicenseId: string): Observable<UrgentInterventionLicense> {
    return this.http.post<UrgentInterventionLicense>(this.getServiceUrlByCaseType(CaseTypes.URGENT_INTERVENTION_LICENSING) + '/draft/validate', {
      requestType,
      oldLicenseId
    });
  }

  @CastResponse(() => UrgentInterventionAnnouncementResult)
  _validateUrgentInterventionAnnouncementByRequestType<T>(requestType: number, oldLicenseId: string): Observable<T> {
    return this.http.post<T>(this.getServiceUrlByCaseType(CaseTypes.URGENT_INTERVENTION_ANNOUNCEMENT) + '/draft/validate', {
      requestType,
      oldLicenseId
    });
  }

  @CastResponse(() => UrgentInterventionClosure)
  _validateUrgentInterventionClosureByRequestType<T>(requestType: number, oldLicenseId: string): Observable<T> {
    return this.http.post<T>(this.getServiceUrlByCaseType(CaseTypes.URGENT_INTERVENTION_CLOSURE) + '/draft/validate', {
      requestType,
      oldLicenseId
    });
  }

  @CastResponse(() => UrgentInterventionClosure)
  _validateUrgentInterventionFinancialNotificationByRequestType<T>(requestType: number, oldLicenseId: string): Observable<T> {
    return this.http.post<T>(this.getServiceUrlByCaseType(CaseTypes.URGENT_INTERVENTION_FINANCIAL_NOTIFICATION) + '/draft/validate', {
      requestType,
      oldLicenseId
    });
  }

  @CastResponse(() => TransferringIndividualFundsAbroad)
  _validateTransferIndividualFundsAbroadByRequestType<T>(requestType: number, oldLicenseId: string): Observable<T> {
    return this.http.post<T>(this.getServiceUrlByCaseType(CaseTypes.TRANSFERRING_INDIVIDUAL_FUNDS_ABROAD) + '/draft/validate', {
      requestType,
      oldLicenseId
    });
  }

  @CastResponse(() => AwarenessActivitySuggestion)
  _validateAwarenessActivitySuggestionByRequestType<T>(requestType: number, oldLicenseId: string): Observable<T> {
    return this.http.post<T>(this.getServiceUrlByCaseType(CaseTypes.AWARENESS_ACTIVITY_SUGGESTION) + '/draft/validate', {
      requestType,
      oldLicenseId
    });
  }

  @CastResponse(() => OrganizationsEntitiesSupport)
  _validateOrganizationsEntitiesSupportByRequestType<T>(requestType: number, oldLicenseId: string): Observable<T> {
    return this.http.post<T>(this.getServiceUrlByCaseType(CaseTypes.ORGANIZATION_ENTITIES_SUPPORT) + '/draft/validate', {
      requestType,
      oldLicenseId
    });
  }
  @CastResponse(() => UrgentInterventionAnnouncement)
  _validateUrgentInterventionLicenseFollowupByVsId<T>(vsId:string): Observable<T> {
    return this.http.get<T>(this.getServiceUrlByCaseType(CaseTypes.URGENT_INTERVENTION_LICENSE_FOLLOWUP) + '/validate/closure/'+vsId, );
  }
  @CastResponse(() => FinancialTransferLicensing)
  _validateFinancialTransferLicensingByRequestType<T>(requestType: number, oldLicenseId: string): Observable<T> {
    return this.http.post<T>(this.getServiceUrlByCaseType(CaseTypes.FINANCIAL_TRANSFERS_LICENSING) + '/draft/validate', {
      requestType,
      oldLicenseId
    });
  }

  @CastResponse(() => GeneralProcessNotification)
  _validateGeneralProcessNotificationByRequestType<T>(requestType: number, oldFullSerial: string): Observable<T> {
    return this.http.post<T>(this.getServiceUrlByCaseType(CaseTypes.GENERAL_PROCESS_NOTIFICATION) + '/draft/validate', {
      requestType,
      oldFullSerial
    });
  }

  @CastResponse(() => GeneralAssociationMeetingAttendance)
  _validateGeneralAssociationMeetingAttendanceByRequestType<T>(requestType: number, oldLicenseId: string): Observable<T> {
    return this.http.post<T>(this.getServiceUrlByCaseType(CaseTypes.GENERAL_ASSOCIATION_MEETING_ATTENDANCE) + '/draft/validate', {
      requestType,
      oldLicenseId
    });
  }

  @CastResponse(() => CollectionLicense)
  private _validateCollectionLicenseByRequestType<T>(requestType: number, oldLicenseId: string): Observable<T> {
    return this.http.post<T>(this.getServiceUrlByCaseType(CaseTypes.COLLECTION_APPROVAL) + '/draft/validate', {
      requestType,
      collectionItemList: [{
        oldLicenseId
      }]
    });
  }

  validateLicenseByRequestType<T>(caseType: CaseTypes, requestType: number, licenseId: string): Observable<InitialExternalOfficeApproval | PartnerApproval | FinalExternalOfficeApproval | InternalProjectLicense | UrgentInterventionLicense | T | undefined | Fundraising> {
    if (caseType === CaseTypes.INITIAL_EXTERNAL_OFFICE_APPROVAL) {
      return this._validateInitialApprovalLicenseByRequestType(requestType, licenseId);
    } else if (caseType === CaseTypes.PARTNER_APPROVAL) {
      return this._validatePartnerApprovalLicenseByRequestType(requestType, licenseId);
    } else if (caseType === CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL) {
      return this._validateFinalExternalOfficeLicenseByRequestType(requestType, licenseId);
    } else if (caseType === CaseTypes.INTERNAL_PROJECT_LICENSE) {
      return this._validateInternalProjectLicenseByRequestType(requestType, licenseId);
    } else if (caseType === CaseTypes.URGENT_INTERVENTION_LICENSING) {
      return this._validateUrgentInterventionLicenseByRequestType(requestType, licenseId);
    } else if (caseType === CaseTypes.URGENT_INTERVENTION_ANNOUNCEMENT) {
      return this._validateUrgentInterventionAnnouncementByRequestType(requestType, licenseId);
    } else if (caseType === CaseTypes.COLLECTION_APPROVAL) {
      return this._validateCollectionLicenseByRequestType<T>(requestType, licenseId);
    } else if (caseType === CaseTypes.COLLECTOR_LICENSING) {
      return this._validateCollectorLicenseByRequestType<T>(requestType, licenseId);
    } else if (caseType === CaseTypes.FUNDRAISING_LICENSING) {
      return this._validateFundraisingLicenseByRequestType(requestType, licenseId);
    } else if (caseType === CaseTypes.INTERNAL_BANK_ACCOUNT_APPROVAL) {
      return this._validateInternalBankAccountLicenseByRequestType<T>(requestType, licenseId);
    } else if (caseType === CaseTypes.EXTERNAL_ORG_AFFILIATION_REQUEST) {
      return this._validateInternalExternalOrgAffiationsLicenseByRequestType<T>(requestType, licenseId);
    } else if (caseType === CaseTypes.URGENT_INTERVENTION_CLOSURE) {
      return this._validateUrgentInterventionClosureByRequestType<T>(requestType, licenseId);
    } else if (caseType === CaseTypes.URGENT_INTERVENTION_FINANCIAL_NOTIFICATION) {
      return this._validateUrgentInterventionFinancialNotificationByRequestType<T>(requestType, licenseId);
    } else if (caseType === CaseTypes.TRANSFERRING_INDIVIDUAL_FUNDS_ABROAD) {
      return this._validateTransferIndividualFundsAbroadByRequestType<T>(requestType, licenseId);
    } else if (caseType === CaseTypes.FOREIGN_COUNTRIES_PROJECTS) {
      return this._validateForeignCountriesProjectsLicenseByRequestType<T>(requestType, licenseId);
    } else if (caseType === CaseTypes.GENERAL_ASSOCIATION_MEETING_ATTENDANCE) {
      return this._validateGeneralAssociationMeetingAttendanceByRequestType<T>(requestType, licenseId);
    } else if (caseType === CaseTypes.AWARENESS_ACTIVITY_SUGGESTION) {
      return this._validateAwarenessActivitySuggestionByRequestType<T>(requestType, licenseId);
    } else if (caseType === CaseTypes.GENERAL_PROCESS_NOTIFICATION) {
      return this._validateGeneralProcessNotificationByRequestType<T>(requestType, licenseId);
    } else if (caseType === CaseTypes.PROJECT_FUNDRAISING) {
      return this._validateProjectFundraisingRequestType<T>(requestType, licenseId);
    } else if (caseType === CaseTypes.ORGANIZATION_ENTITIES_SUPPORT) {
      return this._validateOrganizationsEntitiesSupportByRequestType<T>(requestType, licenseId);
    } else if (caseType === CaseTypes.PROJECT_IMPLEMENTATION) {
      return this._validateProjectImplementationRequestType<T>(requestType, licenseId);
    } else if (caseType === CaseTypes.FINANCIAL_TRANSFERS_LICENSING) {
      return this._validateFinancialTransferLicensingByRequestType<T>(requestType, licenseId);
    } else if (caseType === CaseTypes.URGENT_INTERVENTION_LICENSE_FOLLOWUP) {
      return this._validateUrgentInterventionLicenseFollowupByVsId<T>(licenseId);
    }
    return of(undefined);
  }

  openSelectLicenseDialog<T>(licenses: (GeneralProcessNotification[] | AwarenessActivitySuggestion[] | UrgentInterventionAnnouncementResult[] | InitialExternalOfficeApprovalResult[] | PartnerApproval[] | ExternalOrgAffiliationResult[] | FinalExternalOfficeApprovalResult[] | InternalProjectLicenseResult[] | UrgentInterventionLicenseResult[] | T[]), caseRecord: any | undefined, select = true, displayedColumns: string[] = [], oldFullSerial?: string, isNotLicense: boolean = false, withoutValidate = false): DialogRef {
    return this.dialog.show(SelectLicensePopupComponent, {
      licenses,
      select,
      caseRecord,
      displayedColumns,
      oldFullSerial,
      isNotLicense,
      withoutValidate
    });
  }

  openNewSelectLicenseDialog<T>(licenses: T[], caseRecord: Partial<T> | undefined, select: boolean = true, displayedColumns: string[] = [], oldFullSerial?: string, isNotLicense: boolean = false): DialogRef {
    return this.dialog.show(SelectLicensePopupComponent, {
      licenses,
      select,
      caseRecord,
      displayedColumns,
      oldFullSerial,
      isNotLicense
    });
  }

  showLicenseContent<T extends { id: string }>(license: T, caseType: number): Observable<BlobModel> {
    let url: string = this.getServiceUrlByCaseType(caseType);
    if (!url) {
      return of();
    }
    if (caseType === CaseTypes.URGENT_INTERVENTION_CLOSURE) {
      url += '/license/latest/' + license.id + '/content';
    } else {
      url += '/license/' + license.id + '/content';
    }

    return this.http.get(url, {
      responseType: 'blob'
    }).pipe(
      map(blob => new BlobModel(blob, this.domSanitizer),
        catchError(_ => {
          return of(new BlobModel(new Blob([], { type: 'error' }), this.domSanitizer));
        })));
  }

  @CastResponse(() => CollectionLicense)
  private _collectionSearch<C>(model: Partial<C>): Observable<CollectionLicense[]> {
    return this.http.post<CollectionLicense[]>(this.getServiceUrlByCaseType(CaseTypes.COLLECTION_APPROVAL) + '/license/search', model)
  }

  collectionSearch<C>(model: Partial<C>): Observable<CollectionLicense[]> {
    return this._collectionSearch(model);
  }

  @CastResponse(() => CollectorLicense)
  private _collectorSearch<C>(model: Partial<C>): Observable<CollectorLicense[]> {
    return this.http.post<CollectorLicense[]>(this.getServiceUrlByCaseType(CaseTypes.COLLECTOR_LICENSING) + '/license/search', model)
  }

  collectorSearch<C>(model: Partial<C>): Observable<CollectorLicense[]> {
    return this._collectorSearch(model);
  }

  @CastResponse(() => InternalBankAccountLicense)
  private _internalBankAccountSearch<C>(model: Partial<C>): Observable<InternalBankAccountLicense[]> {
    return this.http.post<InternalBankAccountLicense[]>(this.urlService.URLS.INTERNAL_BANK_ACCOUNT_APPROVAL + '/license/search', model)
  }

  internalBankAccountSearch<C>(model: Partial<C>): Observable<InternalBankAccountLicense[]> {
    return this._internalBankAccountSearch(model);
  }

  @HasInterception
  validateMultiLicenseCollection<T>(caseType: number, @InterceptParam() model: T): Observable<any> {
    return this.http.post(this.getServiceUrlByCaseType(caseType) + '/draft/validate', model)
  }

  @HasInterception
  validateMultiLicenseCollector<T>(caseType: number, @InterceptParam() model: T): Observable<any> {
    return this.http.post(this.getServiceUrlByCaseType(caseType) + '/draft/validate', model)
  }

  @CastResponse(() => TransferringIndividualFundsAbroad)
  private _transferringIndividualFundsAbroadSearch<C>(model: Partial<C>): Observable<TransferringIndividualFundsAbroad[]> {
    return this.http.post<TransferringIndividualFundsAbroad[]>(this.urlService.URLS.TRANSFERRING_INDIVIDUAL_FUNDS_ABROAD + '/license/search', model)
  }

  transferringIndividualFundsAbroadSearch<C>(model: Partial<C>): Observable<TransferringIndividualFundsAbroad[]> {
    return this._transferringIndividualFundsAbroadSearch(model);
  }

  @CastResponse(() => GeneralAssociationMeetingAttendance)
  private _generalAssociationMeetingAttendanceSearch<C>(model: Partial<C>): Observable<GeneralAssociationMeetingAttendance[]> {
    return this.http.post<GeneralAssociationMeetingAttendance[]>(this.urlService.URLS.GENERAL_ASSOCIATION_MEETING_ATTENDANCE + '/search', model)
  }

  generalAssociationMeetingAttendanceSearch<C>(model: Partial<C>): Observable<GeneralAssociationMeetingAttendance[]> {
    return this._generalAssociationMeetingAttendanceSearch(model);
  }

  @CastResponse(() => ProjectFundraising)
  projectFundraisingLicenseSearch(criteria: Partial<ProjectFundraising>): Observable<ProjectFundraising[]> {
    const orgId = { organizationId: this.employeeService.isExternalUser() ? this.employeeService.getProfile()?.id : undefined }
    return this.http.post<ProjectFundraising[]>(this.urlService.URLS.PROJECT_FUNDRAISING + '/license/search', { ...criteria, ...orgId });
  }

  @CastResponse(() => ProjectFundraising)
  private _validateProjectFundraisingRequestType<T>(requestType: number, oldLicenseId: string) {
    return this.http.post<T>(this.getServiceUrlByCaseType(CaseTypes.PROJECT_FUNDRAISING) + '/draft/validate', {
      requestType,
      oldLicenseId
    });
  }

  @CastResponse(() => ProjectImplementation)
  private _validateProjectImplementationRequestType<T>(requestType: number, oldLicenseId: string) {
    return this.http.post<T>(this.getServiceUrlByCaseType(CaseTypes.PROJECT_IMPLEMENTATION) + '/draft/validate', {
      requestType,
      oldLicenseId
    });
  }

  @CastResponse(() => ProjectFundraising)
  loadProjectFundraisingLicenseById(licenseId: string): Observable<ProjectFundraising> {
    return this.http.get<ProjectFundraising>(this.getServiceUrlByCaseType(CaseTypes.PROJECT_FUNDRAISING) + '/license/' + licenseId + '/details')
  }

  @CastResponse(() => ProjectImplementation)
  projectImplementationLicenseSearch(criteria: Partial<ProjectImplementation>): Observable<ProjectImplementation[]> {
    const orgId = { organizationId: this.employeeService.isExternalUser() ? this.employeeService.getProfile()?.id : undefined }
    return this.http.post<ProjectImplementation[]>(this.urlService.URLS.PROJECT_IMPLEMENTATION + '/license/search', { ...criteria, ...orgId });
  }

  @CastResponse(() => ProjectImplementation)
  loadProjectImplementationLicenseById(licenseId: string): Observable<ProjectImplementation> {
    return this.http.get<ProjectImplementation>(this.getServiceUrlByCaseType(CaseTypes.PROJECT_IMPLEMENTATION) + '/license/' + licenseId + '/details')
  }

  @CastResponse(() => FinancialAnalysis)
  loadFinancialAnalysisById(serialNumber: string): Observable<FinancialAnalysis> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('serialNumber', serialNumber);

    return this.http.get<FinancialAnalysis>(this.getServiceUrlByCaseType(CaseTypes.FINANCIAL_ANALYSIS) + '/search/details',{
      params :queryParams
    }).pipe(
      map((result:FinancialAnalysis)=> {
        result.fullSerial = serialNumber
        return result;
      })
    )
  }
}
