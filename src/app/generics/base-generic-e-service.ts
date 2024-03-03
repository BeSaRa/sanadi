import {Observable, interval, of} from 'rxjs';
import {CastPagination, CastResponse} from '@decorators/cast-response';
import {FactoryService} from '@services/factory.service';
import {HttpClient, HttpParams} from '@angular/common/http';
import {DialogService} from '@services/dialog.service';
import {DomSanitizer} from '@angular/platform-browser';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {DynamicOptionsService} from '@services/dynamic-options.service';
import {MenuItemService} from '@services/menu-item.service';
import {EmployeeService} from '@services/employee.service';
import {CommentService} from '@services/comment.service';
import {RecommendationService} from '@services/recommendation.service';
import {DocumentService} from '@services/document.service';
import {ActionLogService} from '@services/action-log.service';
import {SearchService} from '@services/search.service';
import {CaseComment} from '../models/case-comment';
import {FormlyFieldConfig} from '@ngx-formly/core/lib/components/formly.field.config';
import {IFormRowGroup} from '@contracts/iform-row-group';
import {map, switchMap, tap} from 'rxjs/operators';
import {FBuilder} from '@helpers/FBuilder';
import {FileNetDocument} from '../models/file-net-document';
import {BlobModel} from '../models/blob-model';
import {DialogRef} from '../shared/models/dialog-ref';
import {ActionRegistryPopupComponent} from '../shared/popups/action-registry-popup/action-registry-popup.component';
import {ManageCommentPopupComponent} from '../shared/popups/manage-comment-popup/manage-comment-popup.component';
import {ManageRecommendationPopupComponent} from '../shared/popups/manage-recommendation-popup/manage-recommendation-popup.component';
import {DocumentsPopupComponent} from '../shared/popups/documents-popup/documents-popup.component';
import {IBulkResult} from '@contracts/ibulk-result';
import {IDefaultResponse} from '@contracts/idefault-response';
import {MenuItem} from '../models/menu-item';
import {UrlService} from '@services/url.service';
import {HasInterception, InterceptParam} from '@decorators/intercept-model';
import {CaseModel} from '@app/models/case-model';
import {FollowupComponent} from '@app/shared/popups/followup/followup.component';
import {QueryResult} from '@app/models/query-result';
import {CaseTypes} from '@app/enums/case-types.enum';
import { Pagination } from '@app/models/pagination';

export abstract class BaseGenericEService<T extends { id: string }> {
  protected constructor() {
    this.employeeService = FactoryService.getService('EmployeeService');
    this.menuItemService = FactoryService.getService('MenuItemService');
  }


  abstract _getURLSegment(): string;

  abstract _getModel(): any;

  abstract getSearchCriteriaModel<S extends T>(): T;

  abstract getCaseComponentName(): string;

  abstract jsonSearchFile: string;

  abstract http: HttpClient;
  abstract dialog: DialogService;
  abstract domSanitizer: DomSanitizer;
  abstract serviceKey: keyof ILanguageKeys;
  abstract caseStatusIconMap: Map<number, string>;
  abstract searchColumns: string[];
  abstract dynamicService: DynamicOptionsService;
  menuItemService: MenuItemService;
  employeeService: EmployeeService;
  commentService: CommentService = new CommentService(this);
  recommendationService: RecommendationService = new RecommendationService(this);
  documentService: DocumentService = new DocumentService(this);
  actionLogService: ActionLogService = new ActionLogService(this);
  searchService: SearchService = new SearchService(this);
  selectLicenseDisplayColumns = ['licenseNumber', 'ouInfo', 'status', 'actions'];

  ping(): void {
    // just a dummy method to invoke it later to prevent webstorm from Blaming us that we inject service not used.
  }

  @HasInterception
  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  private _create(@InterceptParam() model: Partial<T>): Observable<T> {
    return this.http.post<T>(this._getURLSegment(), model);
  }

  create(model: T): Observable<T> {
    return this._create(model);
  }

  @HasInterception
  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  private _update(@InterceptParam() model: Partial<T>): Observable<T> {
    return this.http.put<T>(this._getURLSegment(), model);
  }

  update(model: T): Observable<T> {
    return this._update(model);
  }

  save(model: T): Observable<T> {
    return model.id ? this.update(model) : this.create(model);
  }

  @HasInterception
  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  private _commit(@InterceptParam() model: Partial<T>): Observable<T> {
    return this.http.post<T>(this._getURLSegment() + '/commit', model);
  }

  commit(model: T): Observable<T> {
    return this._commit(model);
  }

  @HasInterception
  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  private _draft(@InterceptParam() model: Partial<T>): Observable<T> {
    return this.http.post<T>(this._getURLSegment() + '/draft', model);
  }

  draft(model: T): Observable<T> {
    return this._draft(model);
  }

  private _start(caseId: string): Observable<boolean> {
    return this.http.request<boolean>('POST', this._getURLSegment() + '/' + caseId + '/start', { body: null });
  }

  start(caseId: string): Observable<boolean> {
    return this._start(caseId);
  }

  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  private _getById(caseId: string): Observable<T> {
    return this.http.get<T>(this._getURLSegment() + '/' + caseId + '/details');
  }

  getById(caseId: string): Observable<T> {
    return this._getById(caseId);
  }
  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  search(model: Partial<T>): Observable<T[]> {
    return this.searchService.search(model);
  }
 
  @CastPagination(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  paginateSearch(model: Partial<T>): Observable<Pagination<T[]>> {
    return this.searchService.search(model)
    
  }
  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  licensesSearch(model: Partial<T>): Observable<T[]> {
    return this.searchService.licensesSearch(model);
  }
  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  reGenerateLicense(licenseId:string): Observable<boolean> {
    return this.http.get<boolean>(this._getURLSegment() + '/license/' + licenseId + '/regenerate')
    
  }
  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  private _getLicenseById(licenseId: string): Observable<T> {
    return this.http.get<T>(this._getURLSegment() + '/license/' + licenseId + '/details');
  }

  getLicenseById(licenseId: string): Observable<T> {
    return this._getLicenseById(licenseId);
  }
  addComment(caseId: string, comment: Partial<CaseComment>): Observable<CaseComment> {
    return this.commentService.create(caseId, comment);
  }

  loadSearchFields(): Observable<FormlyFieldConfig[]> {
    return this.jsonSearchFile ? this.http.get<IFormRowGroup[]>('assets/search/' + this.jsonSearchFile)
      .pipe(
        map((rows: IFormRowGroup[]) => {
          for (const row of rows) {
            if (!row.fields) {
              row.fields = [];
            }

            row.fields = row.fields.filter(x => {
              return !((x.key === 'organizationId' || x.key === 'competentDepartmentID') && this.employeeService.isExternalUser());
            });
          }
          rows = rows.filter(x => x.fields && x.fields.length > 0);
          return FBuilder.castFormlyFields(rows)
        })) : of([]);
  }

  getComments(caseId: string): Observable<CaseComment[]> {
    return this.commentService.load(caseId);
  }

  addDocument(caseId: string,
              document: FileNetDocument,
              progressCallback?: (percentage: number) => void): Observable<any> {
    return this.documentService.addSingleDocument(caseId, document, progressCallback);
  }

  addBulkDocuments(caseId: string, document: FileNetDocument, progressCallback?: (percentage: number) => void): Observable<any> {
    return this.documentService.addSingleDocument(caseId, document, progressCallback);
  }

  exportActions(caseId: string): Observable<BlobModel> {
    return this.actionLogService.exportActions(caseId);
  }

  openActionLogs(caseId: string, caseType: CaseTypes, isMainRequest: boolean): DialogRef {
    return this.dialog.show(ActionRegistryPopupComponent, { service: this, caseId, caseType, isMainRequest });
  }

  openCommentsDialog(caseId: string): DialogRef {
    return this.dialog.show(ManageCommentPopupComponent, { service: this, caseId });
  }

  openFollowupsDialog(model: CaseModel<any, any>): DialogRef {
    return this.dialog.show(FollowupComponent, model);
  }

  openRecommendationDialog(caseId: string, onlyLogs: boolean = false): DialogRef {
    return this.dialog.show(ManageRecommendationPopupComponent, { service: this, caseId, onlyLogs });
  }

  openDocumentDialog(caseId: string, caseType: number, model: QueryResult | CaseModel<any, any>): DialogRef {
    return this.dialog.show(DocumentsPopupComponent, { service: this, caseId, caseType, model });
  }

  exportModel(caseId: string): Observable<BlobModel> {
    return this.http.get(this._getURLSegment() + '/model/' + caseId + '/export/', {
      responseType: 'blob',
      observe: 'body'
    }).pipe(map(blob => new BlobModel(blob, this.domSanitizer)));
  }

  exportSearch(criteria: Partial<T>): Observable<BlobModel> {
    return this.searchService.exportSearch(criteria);
  }

  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  private _getTask(taskId: string): Observable<T> {
    return this.http.get<T>(this._getURLSegment() + '/task/' + taskId);
  }


  claimBulk(taskIds: string[]): Observable<IBulkResult> {
    return this.http.post<IDefaultResponse<IBulkResult>>(this._getUrlService().URLS.CLAIM_BULK, taskIds).pipe(map(res => res.rs));
  }

  markAsReadUnreadBulk(taskIds: string[], markAsRead: boolean): Observable<IBulkResult> {
    return this.http.post<IDefaultResponse<IBulkResult>>(this._getUrlService().URLS.READ_BULK, taskIds, {
      params: new HttpParams().set('isRead', markAsRead)
    }).pipe(map(res => res.rs));
  }

  releaseBulk(taskIds: string[]): Observable<IBulkResult> {
    return this.http.post<IDefaultResponse<IBulkResult>>(this._getUrlService().URLS.RELEASE_BULK, taskIds).pipe(map(res => res.rs));
  }

  terminateTask(taskId: string): Observable<boolean> {
    return this.http.post<IDefaultResponse<boolean>>(this._getURLSegment() + '/task/terminate', {}, {
      params: new HttpParams().set('tkiid', taskId)
    }).pipe(map(response => response.rs));
  }

  getTask(taskId: string): Observable<T> {
    return this._getTask(taskId);
  }

  getStatusIcon(caseStatus: number): string {
    return this.caseStatusIconMap.has(caseStatus) ? this.caseStatusIconMap.get(caseStatus)! : '';
  }

  getMenuItem(): MenuItem {
    return this.menuItemService.getMenuItemByLangKey(this.serviceKey)!
  }

  abstract _getUrlService(): UrlService

  checkFinalApproveNotificationByMatrix(caseId: string): Observable<boolean> {
    return this.http.get<IDefaultResponse<boolean>>(this._getURLSegment() + '/matrix-approval/' + caseId)
      .pipe(map(response => response.rs));
  }
}
