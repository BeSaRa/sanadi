import {FinancialTransferLicensingService} from '@app/services/financial-transfer-licensing.service';
import {
  ReturnToOrganizationWithCommentPopupComponent
} from './../shared/popups/return-to-organization-with-comment-popup/return-to-organization-with-comment-popup.component';
import {OrganizationsEntitiesSupportService} from './organizations-entities-support.service';
import {GeneralProcessNotificationService} from './general-process-notification.service';
import {AwarenessActivitySuggestionService} from './awareness-activity-suggestion.service';
import {GeneralAssociationMeetingAttendanceService} from '@services/general-association-meeting-attendance.service';
import {
  CoordinationWithOrganizationsRequestService
} from '@app/services/coordination-with-organizations-request.service';
import {Injectable} from '@angular/core';
import {
  UrgentInterventionFinancialNotificationService
} from '@services/urgent-intervention-financial-notification.service';
import {NpoManagementService} from './npo-management.service';
import {HttpClient, HttpParams} from '@angular/common/http';
import {UrlService} from './url.service';
import {Observable, of} from 'rxjs';
import {QueryResultSet} from '@models/query-result-set';
import {FactoryService} from './factory.service';
import {IBulkResult} from '@contracts/ibulk-result';
import {InquiryService} from './inquiry.service';
import {DialogService} from './dialog.service';
import {DialogRef} from '../shared/models/dialog-ref';
import {BlobModel} from '@models/blob-model';
import {SendToComponent} from '../shared/popups/send-to-user-popup/send-to.component';
import {IWFResponse} from '@contracts/i-w-f-response';
import {IDefaultResponse} from '@contracts/idefault-response';
import {map} from 'rxjs/operators';
import {WFResponseType} from '../enums/wfresponse-type.enum';
import {
  ActionWithCommentPopupComponent
} from '../shared/popups/action-with-comment-popup/action-with-comment-popup.component';
import {QueryResult} from '@models/query-result';
import {ConsultationService} from './consultation.service';
import {InternationalCooperationService} from './international-cooperation.service';
import {CaseTypes} from '../enums/case-types.enum';
import {ExceptionHandlerService} from './exception-handler.service';
import {InitialExternalOfficeApprovalService} from '@app/services/initial-external-office-approval.service';
import {PartnerApprovalService} from '@app/services/partner-approval.service';
import {FinalExternalOfficeApprovalService} from './final-external-office-approval.service';
import {IInboxCriteria} from '@app/interfaces/i-inbox-criteria';
import {
  FilterInboxRequestPopupComponent
} from '@app/modules/e-services-main/popups/filter-inbox-request-popup/filter-inbox-request-popup.component';
import {DateUtils} from '@app/helpers/date-utils';
import {CommonUtils} from '@app/helpers/common-utils';
import {InternalProjectLicenseService} from '@app/services/internal-project-license.service';
import {SendToMultipleComponent} from '@app/shared/popups/send-to-multiple/send-to-multiple.component';
import {ProjectModelService} from '@app/services/project-model.service';
import {Memoize} from 'typescript-memoize';
import {CaseModel} from '@app/models/case-model';
import {CollectionApprovalService} from '@app/services/collection-approval.service';
import {FundraisingService} from './fundraising.service';
import {CollectorApprovalService} from '@app/services/collector-approval.service';
import {UrgentInterventionLicensingService} from '@app/services/urgent-intervention-licensing.service';
import {InternalBankAccountApprovalService} from '@app/services/internal-bank-account-approval.service';
import {CustomsExemptionRemittanceService} from './customs-exemption-remittance.service';
import {BaseGenericEService} from '@app/generics/base-generic-e-service';
import {UrgentJointReliefCampaignService} from '@services/urgent-joint-relief-campaign.service';
import {UrgentInterventionAnnouncementService} from '@services/urgent-intervention-announcement.service';
import {ExternalOrgAffiliationService} from './external-org-affiliation.service';
import {EmploymentService} from '@app/services/employment.service';
import {
  ReturnToOrganizationPopupComponent
} from '@app/shared/popups/return-to-organization-popup/return-to-organization-popup.component';
import {UrgentInterventionClosureService} from '@services/urgent-intervention-closure.service';
import {TransferringIndividualFundsAbroadService} from '@services/transferring-individual-funds-abroad.service';
import {ForeignCountriesProjectsService} from './foreign-countries-projects.service';
import {CastResponse} from '@decorators/cast-response';
import {UrgentInterventionLicenseFollowupService} from '@services/urgent-intervention-license-followup.service';
import {CharityOrganizationUpdateService} from './charity-organization-update.service';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {ProjectFundraisingService} from '@services/project-fundraising.service';
import {ProjectImplementationService} from '@services/project-implementation.service';

@Injectable({
  providedIn: 'root'
})
export class InboxService {
  services: Map<number, any> = new Map<number, any>();

  constructor(private http: HttpClient,
              private dialog: DialogService,
              private inquiryService: InquiryService,
              private consultationService: ConsultationService,
              private internationalCooperationService: InternationalCooperationService,
              private initialExternalOfficeApprovalService: InitialExternalOfficeApprovalService,
              private finalExternalOfficeApprovalService: FinalExternalOfficeApprovalService,
              private internalProjectLicenseService: InternalProjectLicenseService,
              private projectModelService: ProjectModelService,
              private exceptionHandlerService: ExceptionHandlerService,
              private partnerApprovalService: PartnerApprovalService,
              private collectionApprovalService: CollectionApprovalService,
              private fundraisingService: FundraisingService,
              private collectorApprovalService: CollectorApprovalService,
              private urgentInterventionLicensingService: UrgentInterventionLicensingService,
              private internalBankAccountApprovalService: InternalBankAccountApprovalService,
              private urgentJointReliefCampaignService: UrgentJointReliefCampaignService,
              private urgentInterventionAnnouncementService: UrgentInterventionAnnouncementService,
              private urgentInterventionClosureService: UrgentInterventionClosureService,
              private urgentInterventionFinancialNotificationService: UrgentInterventionFinancialNotificationService,
              private urgentInterventionLicenseFollowupService: UrgentInterventionLicenseFollowupService,
              private npoManagementService: NpoManagementService,
              private urlService: UrlService,
              private employmentService: EmploymentService,
              private externalOrgAffiliationService: ExternalOrgAffiliationService,
              private customsExemptionRemittanceService: CustomsExemptionRemittanceService,
              private foreignCountriesProjectService: ForeignCountriesProjectsService,
              private transferringIndividualsFundsAbroadService: TransferringIndividualFundsAbroadService,
              private coordinationWithOrganizationsRequestService: CoordinationWithOrganizationsRequestService,
              private charityUpdateService: CharityOrganizationUpdateService,
              private awarenessActivitySuggestionService: AwarenessActivitySuggestionService,
              private generalProcessNotificationService: GeneralProcessNotificationService,
              private projectFundraisingService: ProjectFundraisingService,
              private generalAssociationMeetingAttendanceService: GeneralAssociationMeetingAttendanceService,
              private organizationsEntitiesSupportService: OrganizationsEntitiesSupportService,
              private financialTransferLicensingService: FinancialTransferLicensingService,
              private projectImplementationService: ProjectImplementationService) {
    FactoryService.registerService('InboxService', this);
    // register all e-services that we need.
    this.services.set(CaseTypes.INQUIRY, this.inquiryService);
    this.services.set(CaseTypes.CONSULTATION, this.consultationService);
    this.services.set(CaseTypes.INTERNATIONAL_COOPERATION, this.internationalCooperationService);
    this.services.set(CaseTypes.INITIAL_EXTERNAL_OFFICE_APPROVAL, this.initialExternalOfficeApprovalService);
    this.services.set(CaseTypes.PARTNER_APPROVAL, this.partnerApprovalService);
    this.services.set(CaseTypes.FINAL_EXTERNAL_OFFICE_APPROVAL, this.finalExternalOfficeApprovalService);
    this.services.set(CaseTypes.INTERNAL_PROJECT_LICENSE, this.internalProjectLicenseService);
    this.services.set(CaseTypes.EXTERNAL_PROJECT_MODELS, this.projectModelService);
    this.services.set(CaseTypes.COLLECTION_APPROVAL, this.collectionApprovalService);
    this.services.set(CaseTypes.FUNDRAISING_LICENSING, this.fundraisingService);
    this.services.set(CaseTypes.COLLECTOR_LICENSING, this.collectorApprovalService);
    this.services.set(CaseTypes.URGENT_INTERVENTION_LICENSING, this.urgentInterventionLicensingService);
    this.services.set(CaseTypes.INTERNAL_BANK_ACCOUNT_APPROVAL, this.internalBankAccountApprovalService);
    this.services.set(CaseTypes.URGENT_JOINT_RELIEF_CAMPAIGN, this.urgentJointReliefCampaignService);
    this.services.set(CaseTypes.EMPLOYMENT, this.employmentService);
    this.services.set(CaseTypes.CUSTOMS_EXEMPTION_REMITTANCE, this.customsExemptionRemittanceService);
    this.services.set(CaseTypes.URGENT_INTERVENTION_ANNOUNCEMENT, this.urgentInterventionAnnouncementService);
    this.services.set(CaseTypes.EXTERNAL_ORG_AFFILIATION_REQUEST, this.externalOrgAffiliationService);
    this.services.set(CaseTypes.URGENT_INTERVENTION_CLOSURE, this.urgentInterventionClosureService);
    this.services.set(CaseTypes.URGENT_INTERVENTION_FINANCIAL_NOTIFICATION, this.urgentInterventionFinancialNotificationService);
    this.services.set(CaseTypes.FOREIGN_COUNTRIES_PROJECTS, this.foreignCountriesProjectService);
    this.services.set(CaseTypes.TRANSFERRING_INDIVIDUAL_FUNDS_ABROAD, this.transferringIndividualsFundsAbroadService);
    this.services.set(CaseTypes.GENERAL_ASSOCIATION_MEETING_ATTENDANCE, this.generalAssociationMeetingAttendanceService);
    this.services.set(CaseTypes.COORDINATION_WITH_ORGANIZATION_REQUEST, this.coordinationWithOrganizationsRequestService);
    this.services.set(CaseTypes.URGENT_INTERVENTION_LICENSE_FOLLOWUP, this.urgentInterventionLicenseFollowupService);
    this.services.set(CaseTypes.NPO_MANAGEMENT, this.npoManagementService);
    this.services.set(CaseTypes.GENERAL_PROCESS_NOTIFICATION, this.generalProcessNotificationService);
    this.services.set(CaseTypes.CHARITY_ORGANIZATION_UPDATE, this.charityUpdateService);
    this.services.set(CaseTypes.AWARENESS_ACTIVITY_SUGGESTION, this.awarenessActivitySuggestionService);
    this.services.set(CaseTypes.PROJECT_FUNDRAISING, this.projectFundraisingService);
    this.services.set(CaseTypes.ORGANIZATION_ENTITIES_SUPPORT, this.organizationsEntitiesSupportService);
    this.services.set(CaseTypes.FINANCIAL_TRANSFERS_LICENSING, this.financialTransferLicensingService);
    this.services.set(CaseTypes.PROJECT_IMPLEMENTATION, this.projectImplementationService);
  }

  @CastResponse(() => QueryResultSet)
  private _loadUserInbox(options?: any): Observable<QueryResultSet> {
    let objOptions;
    if (!CommonUtils.isEmptyObject(options) && CommonUtils.objectHasValue(options)) {
      objOptions = {...options};

      if (objOptions.hasOwnProperty('createdDateFrom') && objOptions.createdDateFrom) {
        objOptions.createdDateFrom = DateUtils.setStartOfDay(objOptions.createdDateFrom)?.toISOString();
      }
      if (objOptions.hasOwnProperty('createdDateTo') && objOptions.createdDateTo) {
        objOptions.createdDateTo = DateUtils.setEndOfDay(objOptions.createdDateTo)?.toISOString();
      }
    }

    return this.http.get<QueryResultSet>(this.urlService.URLS.USER_INBOX, {
      params: (new HttpParams({fromObject: objOptions || options}))
    });
  }

  loadUserInbox(options?: any): Observable<QueryResultSet> {
    return this._loadUserInbox(options);
  }

  @CastResponse(() => QueryResultSet)
  private _loadTeamInbox(teamId: number, options?: any): Observable<QueryResultSet> {
    let objOptions;
    if (!CommonUtils.isEmptyObject(options) && CommonUtils.objectHasValue(options)) {
      objOptions = {...options};

      if (objOptions.hasOwnProperty('createdDateFrom') && objOptions.createdDateFrom) {
        objOptions.createdDateFrom = DateUtils.setStartOfDay(objOptions.createdDateFrom)?.toISOString();
      }
      if (objOptions.hasOwnProperty('createdDateTo') && objOptions.createdDateTo) {
        objOptions.createdDateTo = DateUtils.setEndOfDay(objOptions.createdDateTo)?.toISOString();
      }
    }
    return this.http.get<QueryResultSet>(this.urlService.URLS.TEAMS_INBOX + '/' + teamId, {
      params: (new HttpParams({fromObject: objOptions || options}))
    });
  }

  loadTeamInbox(teamId: number, options?: any): Observable<QueryResultSet> {
    return this._loadTeamInbox(teamId, options);
  }

  getService(serviceNumber: number): BaseGenericEService<any> {
    if (!this.services.has(serviceNumber)) {
      console.log('Service number ' + serviceNumber + ' not registered in InboxServices');
    }
    return (this.services.get(serviceNumber) as BaseGenericEService<any>);
  }

  claimBulk(taskIds: string[], caseType: number): Observable<IBulkResult> {
    const service = this.getService(caseType);
    return service.claimBulk(taskIds);
  }

  releaseBulk(taskIds: string[], caseType: number): Observable<IBulkResult> {
    const service = this.getService(caseType);
    return service.releaseBulk(taskIds);
  }

  markAsReadUnreadBulk(taskIds: string[], caseType: number, markAsRead: boolean): Observable<IBulkResult> {
    const service = this.getService(caseType);
    return service.markAsReadUnreadBulk(taskIds, markAsRead);
  }

  openDocumentDialog(caseId: string, caseType: number, model: QueryResult | CaseModel<any, any>): DialogRef {
    const service = this.getService(caseType);
    return service.openDocumentDialog(caseId, caseType, model);
  }

  openRecommendationDialog(caseId: string, caseType: number): DialogRef {
    const service = this.getService(caseType);
    return service.openRecommendationDialog(caseId);
  }

  openCommentsDialog(caseId: string, caseType: number): DialogRef {
    const service = this.getService(caseType);
    return service.openCommentsDialog(caseId);
  }


  openActionLogs(caseId: string, caseType: number, isMainRequest: boolean): DialogRef {
    const service = this.getService(caseType);
    return service.openActionLogs(caseId, caseType, isMainRequest);
  }

  exportActions(caseId: string, caseType: number): Observable<BlobModel> {
    const service = this.getService(caseType);
    return service.exportActions(caseId);
  }

  exportModel(caseId: string, caseType: number): Observable<BlobModel> {
    const service = this.getService(caseType);
    return service.exportModel(caseId);
  }

  takeActionOnTask(taskId: string, info: Partial<IWFResponse>, service: BaseGenericEService<any>): Observable<boolean> {
    return this.http.post<IDefaultResponse<boolean>>(service._getURLSegment() + '/task/' + taskId + '/complete', info)
      .pipe(map(response => response.rs));
  }

  terminateTask(taskId: string, caseType: number): Observable<boolean> {
    const service = this.getService(caseType);
    return service.terminateTask(taskId);
  }

  sendTaskTo(taskId: string, info: Partial<IWFResponse>, service: BaseGenericEService<any>): Observable<boolean> {
    return this.takeActionOnTask(taskId, info, service);
  }

  sendTaskToMultiple(taskId: string, info: {
    taskName: string,
    departments?: number[],
    users?: number[]
  }, service: BaseGenericEService<any>): Observable<boolean> {
    return this.startTaskToMultiple(taskId, info, service);
  }

  startTaskToMultiple(taskId: string, info: {
    taskName: string,
    departments?: number[],
    users?: number[]
  }, service: BaseGenericEService<any>): Observable<boolean> {
    return this.http.post<IDefaultResponse<boolean>>(service._getURLSegment() + '/task/' + taskId + '/start', info)
      .pipe(map(response => response.rs));
  }

  private openSendToDialog(taskId: string,
                           sendToResponse: WFResponseType,
                           service: BaseGenericEService<any>,
                           claimBefore: boolean = false,
                           task?: QueryResult | CaseModel<any, any>): DialogRef {

    return this.dialog.show(SendToComponent,
      {
        inboxService: this,
        taskId,
        sendToResponse,
        service,
        claimBefore,
        task
      });
  }

  private openSendToMultipleDialog(taskId: string,
                                   sendToResponse: WFResponseType,
                                   service: BaseGenericEService<any>,
                                   claimBefore: boolean = false,
                                   task?: QueryResult | CaseModel<any, any>,
                                   extraInfo?: any): DialogRef {

    return this.dialog.show(SendToMultipleComponent,
      {
        inboxService: this,
        taskId,
        sendToResponse,
        service,
        claimBefore,
        task,
        extraInfo
      });
  }

  sendToUser(taskId: string, caseType: number, claimBefore: boolean = false, task?: QueryResult | CaseModel<any, any>): DialogRef {
    const service = this.getService(caseType);
    return this.openSendToDialog(taskId, WFResponseType.TO_USER, service, claimBefore, task);
  }

  sendToStructureExpert(taskId: string, caseType: number, claimBefore: boolean = false, task?: QueryResult | CaseModel<any, any>): DialogRef {
    const service = this.getService(caseType);
    return this.openSendToDialog(taskId, WFResponseType.TO_CONSTRUCTION_EXPERT, service, claimBefore, task);
  }

  sendToDevelopmentExpert(taskId: string, caseType: number, claimBefore: boolean = false, task?: QueryResult | CaseModel<any, any>): DialogRef {
    const service = this.getService(caseType);
    return this.openSendToDialog(taskId, WFResponseType.TO_DEVELOPMENT_EXPERT, service, claimBefore, task);
  }

  seen(taskId: string, caseType: number, claimBefore: boolean = false, task?: QueryResult | CaseModel<any, any>): DialogRef {
    const service = this.getService(caseType);
    return this.openSendToDialog(taskId, WFResponseType.SEEN, service, claimBefore, task);
  }

  sendToDepartment(taskId: string, caseType: number, claimBefore: boolean = false, task?: QueryResult | CaseModel<any, any>): DialogRef {
    const service = this.getService(caseType);
    return this.openSendToDialog(taskId, WFResponseType.TO_COMPETENT_DEPARTMENT, service, claimBefore, task);
  }

  getAskWFResponseByCaseType(caseType: number): WFResponseType {
    let servicesMap = {
      [CaseTypes.INTERNAL_PROJECT_LICENSE]: WFResponseType.INTERNAL_PROJECT_SEND_TO_MULTI_DEPARTMENTS,
      [CaseTypes.FUNDRAISING_LICENSING]: WFResponseType.FUNDRAISING_LICENSE_SEND_TO_MULTI_DEPARTMENTS,
      [CaseTypes.URGENT_INTERVENTION_LICENSING]: WFResponseType.URGENT_INTERVENTION_LICENSE_SEND_TO_MULTI_DEPARTMENTS,
      [CaseTypes.INTERNAL_BANK_ACCOUNT_APPROVAL]: WFResponseType.INTERNAL_BANK_ACCOUNT_APPROVAL_SEND_TO_MULTI_DEPARTMENTS,
      [CaseTypes.TRANSFERRING_INDIVIDUAL_FUNDS_ABROAD]: WFResponseType.TRANSFERRING_INDIVIDUAL_FUNDS_ABROAD_SEND_TO_SINGLE_DEPARTMENT,
      [CaseTypes.NPO_MANAGEMENT]: WFResponseType.REVIEW_NPO_MANAGEMENT,
      [CaseTypes.AWARENESS_ACTIVITY_SUGGESTION]: WFResponseType.AWARENESS_ACTIVITY_SUGGESTION_SEND_TO_MULTI_DEPARTMENTS,
      [CaseTypes.CHARITY_ORGANIZATION_UPDATE]: WFResponseType.CHARITY_ORGANIZATION_UPDATE_SEND_TO_MULTI_DEPARTMENTS,
      [CaseTypes.FOREIGN_COUNTRIES_PROJECTS]: WFResponseType.FOREIGN_COUNTRIES_PROJECTS_LICENSING_SEND_TO_MULTI_DEPARTMENTS,
      [CaseTypes.PROJECT_FUNDRAISING]: WFResponseType.PROJECT_FUNDRAISING_SEND_TO_DEPARTMENTS,
      [CaseTypes.GENERAL_PROCESS_NOTIFICATION]: WFResponseType.GENERAL_NOTIFICATION_SEND_TO_SINGLE_DEPARTMENTS,
      [CaseTypes.ORGANIZATION_ENTITIES_SUPPORT]: WFResponseType.ORGANIZATION_ENTITIES_SUPPORT_TO_MULTI_DEPARTMENTS
    };

    // @ts-ignore
    return servicesMap[caseType];
  }

  sendToMultiDepartments(taskId: string, caseType: number, claimBefore: boolean = false, task?: QueryResult | CaseModel<any, any>): DialogRef {
    let service = this.getService(caseType),
      taskName: WFResponseType = this.getAskWFResponseByCaseType(caseType);

    return this.openSendToMultipleDialog(taskId, taskName, service, claimBefore, task, null);
  }

  sendToManager(taskId: string, caseType: number, claimBefore: boolean = false, task?: QueryResult | CaseModel<any, any>): DialogRef {
    const service = this.getService(caseType);
    return this.openSendToDialog(taskId, WFResponseType.TO_MANAGER, service, claimBefore, task);
  }

  sendToChief(taskId: string, caseType: number, claimBefore: boolean = false, task?: QueryResult | CaseModel<any, any>): DialogRef {
    const service = this.getService(caseType);
    return this.openSendToDialog(taskId, WFResponseType.TO_CHIEF, service, claimBefore, task);
  }

  sendToGeneralManager(taskId: string, caseType: number, claimBefore: boolean = false, task?: QueryResult | CaseModel<any, any>): DialogRef {
    const service = this.getService(caseType);
    return this.openSendToDialog(taskId, WFResponseType.SEND_TO_GM, service, claimBefore, task);
  }

  sendToGM(taskId: string, caseType: number, claimBefore: boolean = false, task?: QueryResult | CaseModel<any, any>): DialogRef {
    const service = this.getService(caseType);
    return this.openSendToDialog(taskId, WFResponseType.TO_GM, service, claimBefore, task);
  }

  complete(taskId: string, caseType: number): Observable<boolean> {
    const service = this.getService(caseType);
    return this.takeActionOnTask(taskId, {}, service);
  }

  takeActionWithComment(taskId: string, caseType: number, actionType: WFResponseType, claimBefore: boolean = false, task?: QueryResult | CaseModel<any, any>, commentLabel: keyof ILanguageKeys = 'comment'): DialogRef {
    const service = this.getService(caseType);
    return this.dialog.show(ActionWithCommentPopupComponent, {
      service,
      inboxService: this,
      taskId,
      actionType,
      claimBefore,
      task,
      commentLabel
    });
  }

  completeCanNotBeCompleted(): DialogRef {
    return this.dialog.error('Can/\'t Be Completed');
  }

  openReturnToSpecificOrganization(caseId: string, task?: QueryResult | CaseModel<any, any>): DialogRef {
    return this.dialog.show(ReturnToOrganizationPopupComponent,
      {
        caseId,
        task
      });
  }

  openReturnToSpecificOrganizationWithComment(caseId: string, model: CaseModel<any, any>, commentRequired = false): DialogRef {
    return this.dialog.show(ReturnToOrganizationWithCommentPopupComponent,
      {
        caseId,
        model,
        inboxService: this,
        commentRequired

      });
  }

  openFilterTeamInboxDialog(filterCriteria: Partial<IInboxCriteria>): Observable<DialogRef> {
    return of(this.dialog.show(FilterInboxRequestPopupComponent, {
      criteria: filterCriteria
    }, {
      escToClose: true
    }));
  }

  @Memoize()
  getServiceRoute(caseType: number): string {
    return this.getService(caseType).getMenuItem().path;
  }

  @CastResponse(() => QueryResultSet)
  loadUserInboxByDomainName(domainName: string): Observable<QueryResultSet> {
    return this.http.get<QueryResultSet>(this.urlService.URLS.USER_INBOX + '/' + domainName);
  }

  @CastResponse(() => QueryResultSet)
  reassignBulk(queryResults: Partial<QueryResult>[], domainName: string): Observable<QueryResultSet> {
    return this.http.post<QueryResultSet>(this.urlService.URLS.REASSIGN_BULK, this.prepareQueryResults(queryResults), {
      params: new HttpParams({
        fromObject: {
          toUser: domainName,
        }
      })
    });
  }

  private prepareQueryResults(queryResults: Partial<QueryResult>[]) {
    return queryResults.map(e => {
      return {
        TKIID: e.TKIID,
        BD_CASE_TYPE: e.BD_CASE_TYPE,
        PI_PARENT_CASE_ID: e.PI_PARENT_CASE_ID
      }
    });
  }
}
