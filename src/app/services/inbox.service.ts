import { JobApplicationService } from './job-application.service';
import {ComponentFactoryResolver, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {UrlService} from './url.service';
import {Observable, of} from 'rxjs';
import {QueryResultSet} from '../models/query-result-set';
import {Generator} from '../decorators/generator';
import {QueryResultSetInterceptor} from '../model-interceptors/query-result-set-interceptor';
import {FactoryService} from './factory.service';
import {IBulkResult} from '../interfaces/ibulk-result';
import {InquiryService} from './inquiry.service';
import {EServiceGenericService} from '../generics/e-service-generic-service';
import {DialogService} from './dialog.service';
import {DialogRef} from '../shared/models/dialog-ref';
import {BlobModel} from '../models/blob-model';
import {SendToComponent} from '../shared/popups/send-to-user-popup/send-to.component';
import {IWFResponse} from '../interfaces/i-w-f-response';
import {IDefaultResponse} from '../interfaces/idefault-response';
import {map} from 'rxjs/operators';
import {WFResponseType} from '../enums/wfresponse-type.enum';
import {
  ActionWithCommentPopupComponent
} from '../shared/popups/action-with-comment-popup/action-with-comment-popup.component';
import {QueryResult} from '../models/query-result';
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
} from '@app/e-services/poups/filter-inbox-request-popup/filter-inbox-request-popup.component';
import {DateUtils} from '@app/helpers/date-utils';
import {CommonUtils} from '@app/helpers/common-utils';
import {InternalProjectLicenseService} from '@app/services/internal-project-license.service';
import {SendToMultipleComponent} from '@app/shared/popups/send-to-multiple/send-to-multiple.component';
import {ProjectModelService} from '@app/services/project-model.service';
import {Memoize} from "typescript-memoize";
import {CaseModel} from "@app/models/case-model";
import {CollectionApprovalService} from "@app/services/collection-approval.service";
import { FundraisingService } from './fundraising.service';
import {CollectorApprovalService} from '@app/services/collector-approval.service';
import {UrgentInterventionLicensingService} from '@app/services/urgent-intervention-licensing.service';
import {InternalBankAccountApprovalService} from '@app/services/internal-bank-account-approval.service';
import { ShippingApprovalService } from './shipping-approval.service';

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
              private cfr: ComponentFactoryResolver,
              private exceptionHandlerService: ExceptionHandlerService,
              private partnerApprovalService: PartnerApprovalService,
              private collectionApprovalService: CollectionApprovalService,
              private fundraisingService: FundraisingService,
              private collectorApprovalService: CollectorApprovalService,
              private urgentInterventionLicensingService: UrgentInterventionLicensingService,
              private internalBankAccountApprovalService: InternalBankAccountApprovalService,
              private urlService: UrlService,
              private shippingApprovalService:ShippingApprovalService,
              private jobApplicationService: JobApplicationService) {
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
    this.services.set(CaseTypes.SHIPPING_APPROVAL, this.shippingApprovalService);
    this.services.set(CaseTypes.JOB_APPLICATION, this.jobApplicationService);
  }

  @Generator(QueryResultSet, false, {property: 'rs', interceptReceive: (new QueryResultSetInterceptor().receive)})
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

  @Generator(QueryResultSet, false, {property: 'rs', interceptReceive: (new QueryResultSetInterceptor().receive)})
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

  getService(serviceNumber: number): EServiceGenericService<any> {
    if (!this.services.has(serviceNumber)) {
      console.log('Service number' + serviceNumber + ' Not register in InboxServices');
    }
    return (this.services.get(serviceNumber) as EServiceGenericService<any>);
  }

  claimBulk(taskIds: string[], caseType: number): Observable<IBulkResult> {
    const service = this.getService(caseType);
    return service.claimBulk(taskIds);
  }

  releaseBulk(taskIds: string[], caseType: number): Observable<IBulkResult> {
    const service = this.getService(caseType);
    return service.releaseBulk(taskIds);
  }

  openDocumentDialog(caseId: string, caseType: number): DialogRef {
    const service = this.getService(caseType);
    return service.openDocumentDialog(caseId, caseType);
  }

  openRecommendationDialog(caseId: string, caseType: number): DialogRef {
    const service = this.getService(caseType);
    return service.openRecommendationDialog(caseId);
  }

  openCommentsDialog(caseId: string, caseType: number): DialogRef {
    const service = this.getService(caseType);
    return service.openCommentsDialog(caseId);
  }


  openActionLogs(caseId: string, caseType: number): DialogRef {
    const service = this.getService(caseType);
    return service.openActionLogs(caseId);
  }

  exportActions(caseId: string, caseType: number): Observable<BlobModel> {
    const service = this.getService(caseType);
    return service.exportActions(caseId);
  }

  exportModel(caseId: string, caseType: number): Observable<BlobModel> {
    const service = this.getService(caseType);
    return service.exportModel(caseId);
  }

  takeActionOnTask(taskId: string, info: Partial<IWFResponse>, service: EServiceGenericService<any>): Observable<boolean> {
    return this.http.post<IDefaultResponse<boolean>>(service._getURLSegment() + '/task/' + taskId + '/complete', info)
      .pipe(map(response => response.rs));
  }

  sendTaskTo(taskId: string, info: Partial<IWFResponse>, service: EServiceGenericService<any>): Observable<boolean> {
    return this.takeActionOnTask(taskId, info, service);
  }

  sendTaskToMultiple(taskId: string, info: { taskName: string, departments?: number[], users?: number[] }, service: EServiceGenericService<any>): Observable<boolean> {
    return this.startTaskToMultiple(taskId, info, service);
  }

  startTaskToMultiple(taskId: string, info: { taskName: string, departments?: number[], users?: number[] }, service: EServiceGenericService<any>): Observable<boolean> {
    return this.http.post<IDefaultResponse<boolean>>(service._getURLSegment() + '/task/' + taskId + '/start', info)
      .pipe(map(response => response.rs));
  }

  private openSendToDialog(taskId: string,
                           sendToResponse: WFResponseType,
                           service: EServiceGenericService<any>,
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
                                   service: EServiceGenericService<any>,
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

  sendToDepartment(taskId: string, caseType: number, claimBefore: boolean = false, task?: QueryResult | CaseModel<any, any>): DialogRef {
    const service = this.getService(caseType);
    return this.openSendToDialog(taskId, WFResponseType.TO_COMPETENT_DEPARTMENT, service, claimBefore, task);
  }

  sendToMultiDepartments(taskId: string, caseType: number, claimBefore: boolean = false, task?: QueryResult | CaseModel<any, any>): DialogRef {
    const service = this.getService(caseType);
    return this.openSendToMultipleDialog(taskId, WFResponseType.INTERNAL_PROJECT_SEND_TO_MULTI_DEPARTMENTS, service, claimBefore, task, null);
  }

  sendToManager(taskId: string, caseType: number, claimBefore: boolean = false, task?: QueryResult | CaseModel<any, any>): DialogRef {
    const service = this.getService(caseType);
    return this.openSendToDialog(taskId, WFResponseType.TO_MANAGER, service, claimBefore, task);
  }

  sendToGeneralManager(taskId: string, caseType: number, claimBefore: boolean = false, task?: QueryResult | CaseModel<any, any>): DialogRef {
    const service = this.getService(caseType);
    return this.openSendToDialog(taskId, WFResponseType.TO_GM, service, claimBefore, task);
  }


  complete(taskId: string, caseType: number): Observable<boolean> {
    const service = this.getService(caseType);
    return this.takeActionOnTask(taskId, {}, service);
  }

  getCFR(): ComponentFactoryResolver {
    return this.cfr;
  }

  takeActionWithComment(taskId: string, caseType: number, actionType: WFResponseType, claimBefore: boolean = false, task?: QueryResult | CaseModel<any, any>): DialogRef {
    const service = this.getService(caseType);
    return this.dialog.show(ActionWithCommentPopupComponent, {
      service,
      inboxService: this,
      taskId,
      actionType,
      claimBefore,
      task
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

}
