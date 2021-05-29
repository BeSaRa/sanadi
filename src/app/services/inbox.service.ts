import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {UrlService} from './url.service';
import {Observable} from 'rxjs';
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
import {ActionWithCommentPopupComponent} from '../shared/popups/action-with-comment-popup/action-with-comment-popup.component';
import {QueryResult} from '../models/query-result';

@Injectable({
  providedIn: 'root'
})
export class InboxService {
  services: Map<number, any> = new Map<number, any>();

  constructor(private http: HttpClient,
              private dialog: DialogService,
              private inquiryService: InquiryService,
              private urlService: UrlService) {
    FactoryService.registerService('InboxService', this);

    // register all e-services that we need.
    this.services.set(1, this.inquiryService);
  }

  @Generator(QueryResultSet, false, {property: 'rs', interceptReceive: (new QueryResultSetInterceptor().receive)})
  private _loadUserInbox(options?: any): Observable<QueryResultSet> {
    return this.http.get<QueryResultSet>(this.urlService.URLS.USER_INBOX, {
      params: (new HttpParams({fromObject: options}))
    });
  }

  loadUserInbox(options?: any): Observable<QueryResultSet> {
    return this._loadUserInbox(options);
  }

  @Generator(QueryResultSet, false, {property: 'rs', interceptReceive: (new QueryResultSetInterceptor().receive)})
  private _loadTeamInbox(teamId: number, options?: any): Observable<QueryResultSet> {
    return this.http.get<QueryResultSet>(this.urlService.URLS.TEAMS_INBOX + '/' + teamId, {
      params: (new HttpParams({fromObject: options}))
    });
  }

  loadTeamInbox(teamId: number, options?: any): Observable<QueryResultSet> {
    return this._loadTeamInbox(teamId, options);
  }

  @Generator(undefined, false, {property: 'rs'})
  private _claimBulk(taskIds: string[]): Observable<IBulkResult> {
    return this.http.post<IBulkResult>(this.urlService.URLS.CLAIM_BULK, taskIds);
  }

  private getService(serviceNumber: number): EServiceGenericService<any, any> {
    return this.services.get(serviceNumber) as EServiceGenericService<any, any>;
  }

  claimBulk(taskIds: string[]): Observable<IBulkResult> {
    return this._claimBulk(taskIds);
  }

  openDocumentDialog(caseId: string, caseType: number): DialogRef {
    const service = this.getService(caseType);
    return service.openDocumentDialog(caseId);
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

  takeActionOnTask(taskId: string, info: Partial<IWFResponse>, service: EServiceGenericService<any, any>): Observable<boolean> {
    return this.http.post<IDefaultResponse<boolean>>(service._getServiceURL() + '/task/' + taskId + '/complete', info)
      .pipe(map(response => response.rs));
  }

  sendTaskTo(taskId: string, info: Partial<IWFResponse>, service: EServiceGenericService<any, any>): Observable<boolean> {
    return this.takeActionOnTask(taskId, info, service);
  }

  private openSendToDialog(taskId: string, sendToUser: boolean = true,
                           service: EServiceGenericService<any, any>,
                           claimBefore: boolean = false,
                           task?: QueryResult): DialogRef {

    return this.dialog.show(SendToComponent,
      {
        inboxService: this,
        taskId: taskId,
        sendToUser,
        service,
        claimBefore,
        task
      });
  }

  sendToUser(taskId: string, caseType: number, claimBefore: boolean = false, task?: QueryResult): DialogRef {
    const service = this.getService(caseType);
    return this.openSendToDialog(taskId, true, service, claimBefore, task);
  }

  sendToDepartment(taskId: string, caseType: number, claimBefore: boolean = false, task?: QueryResult): DialogRef {
    const service = this.getService(caseType);
    return this.openSendToDialog(taskId, false, service, claimBefore, task);
  }

  complete(taskId: string, caseType: number): Observable<boolean> {
    const service = this.getService(caseType);
    return this.takeActionOnTask(taskId, {}, service);
  }

  takeActionWithComment(taskId: string, caseType: number, actionType: WFResponseType, claimBefore: boolean = false, task?: QueryResult): DialogRef {
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
}
