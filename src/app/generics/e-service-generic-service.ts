import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {FileNetDocument} from '../models/file-net-document';
import {CaseComment} from '../models/case-comment';
import {CommentService} from '../services/comment.service';
import {InterceptParam, SendInterceptor} from '../decorators/model-interceptor';
import {Generator} from '../decorators/generator';
import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {BackendServiceModelInterface} from '../interfaces/backend-service-model-interface';
import {DocumentService} from '../services/document.service';
import {DialogService} from '../services/dialog.service';
import {DomSanitizer} from '@angular/platform-browser';
import {ActionLogService} from '../services/action-log.service';
import {BlobModel} from '../models/blob-model';
import {map} from 'rxjs/operators';
import {RecommendationService} from '../services/recommendation.service';
import {DialogRef} from '../shared/models/dialog-ref';
import {ActionRegistryPopupComponent} from '../shared/popups/action-registry-popup/action-registry-popup.component';
import {ManageCommentPopupComponent} from '../shared/popups/manage-comment-popup/manage-comment-popup.component';
import {ManageRecommendationPopupComponent} from '../shared/popups/manage-recommendation-popup/manage-recommendation-popup.component';
import {DocumentsPopupComponent} from '../shared/popups/documents-popup/documents-popup.component';

export abstract class EServiceGenericService<T extends { id: string }, S extends EServiceGenericService<T, S>>
  implements Pick<BackendServiceModelInterface<T>, '_getModel' | '_getInterceptor'> {
  abstract _getModel(): any;

  abstract _getServiceURL(): string;

  abstract _getInterceptor(): Partial<IModelInterceptor<T>>;

  abstract http: HttpClient;
  abstract dialog: DialogService;
  abstract domSanitizer: DomSanitizer;
  abstract commentService: CommentService<S>;
  abstract recommendationService: RecommendationService<S>;
  abstract documentService: DocumentService<S>;
  abstract actionLogService: ActionLogService<S>;

  ping(): void {
    // just a dummy method to invoke it later to prevent webstorm from Blaming us that we inject service not used.
  }

  @SendInterceptor()
  @Generator(undefined, false, {property: 'rs'})
  private _create(@InterceptParam() model: Partial<T>): Observable<T> {
    return this.http.post<T>(this._getServiceURL(), model);
  }

  create(model: T): Observable<T> {
    return this._create(model);
  }

  @SendInterceptor()
  @Generator(undefined, false, {property: 'rs'})
  private _update(@InterceptParam() model: Partial<T>): Observable<T> {
    return this.http.put<T>(this._getServiceURL(), model);
  }

  update(model: T): Observable<T> {
    return this._update(model);
  }

  save(model: T): Observable<T> {
    return model.id ? this.update(model) : this.create(model);
  }

  @SendInterceptor()
  @Generator(undefined, false, {property: 'rs'})
  private _commit(@InterceptParam() model: Partial<T>): Observable<T> {
    return this.http.post<T>(this._getServiceURL() + '/commit', model);
  }

  commit(model: T): Observable<T> {
    return this._commit(model);
  }

  @SendInterceptor()
  @Generator(undefined, false, {property: 'rs'})
  private _draft(@InterceptParam() model: Partial<T>): Observable<T> {
    return this.http.post<T>(this._getServiceURL() + '/draft', model);
  }

  draft(model: T): Observable<T> {
    return this._draft(model);
  }

  private _start(caseId: string): Observable<boolean> {
    return this.http.request<boolean>('POST', this._getServiceURL() + '/' + caseId + '/start', {body: null});
  }

  start(caseId: string): Observable<boolean> {
    return this._start(caseId);
  }

  private _getById(caseId: string): Observable<T> {
    return this.http.get<T>(this._getServiceURL() + '/' + caseId + '/details');
  }

  getById(caseId: string): Observable<T> {
    return this._getById(caseId);
  }

  private _search(model: Partial<T>): Observable<T[]> {
    return this.http.post<T[]>(this._getServiceURL() + '/search', model);
  }

  search(model: Partial<T>): Observable<T[]> {
    return this._search(model);
  }

  addComment(caseId: string, comment: Partial<CaseComment>): Observable<CaseComment> {
    return this.commentService.create(caseId, comment);
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

  getCaseActions(): void {

  }

  getCaseLocations(): void {

  }

  getCaseDetails(): void {

  }

  getContainedDocument(): void {

  }

  addRecommendation(): void {
  }

  getCaseRecommendations(): void {
  }

  exportActions(caseId: string): Observable<BlobModel> {
    return this.actionLogService.exportActions(caseId);
  }

  openActionLogs(caseId: string): DialogRef {
    return this.dialog.show(ActionRegistryPopupComponent, {service: this, caseId});
  }

  openCommentsDialog(caseId: string): DialogRef {
    return this.dialog.show(ManageCommentPopupComponent, {service: this, caseId});
  }

  openRecommendationDialog(caseId: string): DialogRef {
    return this.dialog.show(ManageRecommendationPopupComponent, {service: this, caseId});
  }

  openDocumentDialog(caseId: string): DialogRef {
    return this.dialog.show(DocumentsPopupComponent, {service: this, caseId});
  }

  downloadDocument(): void {
    //inquiry/document/{docId}/download
    //Download document as PDF.
  }

  exportModel(caseId: string): Observable<BlobModel> {
    return this.http.get(this._getServiceURL() + '/model/' + caseId + '/export/', {
      responseType: 'blob',
      observe: 'body'
    }).pipe(map(blob => new BlobModel(blob, this.domSanitizer)));
  }

  exportSearch(): void {

  }

  getTask(): void {

  }

  claimTask(): void {

  }

  completeTask(): void {

  }

}
