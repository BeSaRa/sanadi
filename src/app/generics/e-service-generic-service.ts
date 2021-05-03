import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {FileNetDocument} from '../models/file-net-document';
import {Comment} from '../models/comment';
import {CommentService} from '../services/comment.service';
import {InterceptParam, SendInterceptor} from '../decorators/model-interceptor';
import {Generator} from '../decorators/generator';
import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {BackendServiceModelInterface} from '../interfaces/backend-service-model-interface';
import {DocumentService} from '../services/document.service';
import {DialogService} from '../services/dialog.service';
import {DomSanitizer} from '@angular/platform-browser';

export abstract class EServiceGenericService<T extends { id: string }, S extends EServiceGenericService<T, S>>
  implements Pick<BackendServiceModelInterface, '_getModel' | '_getInterceptor'> {
  abstract _getModel(): any;

  abstract _getServiceURL(): string;

  abstract _getInterceptor(): Partial<IModelInterceptor<T>>;

  abstract http: HttpClient;
  abstract dialog: DialogService;
  abstract domSanitizer: DomSanitizer;
  abstract commentService: CommentService<S>;
  abstract documentService: DocumentService<S>;

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

  addComment(caseId: string, comment: Partial<Comment>): Observable<boolean> {
    return this.commentService.create(caseId, comment);
  }

  getComments(caseId: string): Observable<Comment[]> {
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

  exportCaseActions(): void {

  }

  downloadDocument(): void {
    //inquiry/document/{docId}/download
    //Download document as PDF.
  }

  exportModel(): void {
    //GET/inquiry/model/export/{caseId}
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
