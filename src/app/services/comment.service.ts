import {Observable} from 'rxjs';
import {CaseComment} from '../models/case-comment';
import {HttpClient} from '@angular/common/http';
import {Generator} from '../decorators/generator';
import {BackendServiceModelInterface} from '../interfaces/backend-service-model-interface';
import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {CaseCommentInterceptor} from '../model-interceptors/case-comment-interceptor';
import {InterceptParam, SendInterceptor} from '../decorators/model-interceptor';

export class CommentService implements Pick<BackendServiceModelInterface<CaseComment>, '_getInterceptor' | '_getModel'> {
  interceptor: CaseCommentInterceptor = new CaseCommentInterceptor();

  constructor(private service: { http: HttpClient, _getServiceURL(): string }) {
  }


  _getInterceptor(): Partial<IModelInterceptor<CaseComment>> {
    return this.interceptor;
  }

  _getModel(): any {
    return CaseComment;
  }


  @SendInterceptor()
  @Generator(undefined, false, {property: 'rs'})
  private _create(caseId: string, @InterceptParam() model: Partial<CaseComment>): Observable<CaseComment> {
    return this.service.http.post<CaseComment>(this.service._getServiceURL() + '/' + caseId + '/comment', model);
  }

  create(caseId: string, model: Partial<CaseComment>): Observable<CaseComment> {
    return this._create(caseId, model);
  }

  @SendInterceptor()
  @Generator(undefined, false, {property: 'rs'})
  private _update(caseId: string, @InterceptParam() model: Partial<CaseComment>): Observable<CaseComment> {
    return this.service.http.put<CaseComment>(this.service._getServiceURL() + '/' + caseId + '/comment', model);
  }

  update(caseId: string, model: Partial<CaseComment>): Observable<CaseComment> {
    return this._update(caseId, model);
  }

  @Generator(undefined, true, {property: 'rs'})
  private _load(caseId: string): Observable<CaseComment[]> {
    return this.service.http.get<CaseComment[]>(this.service._getServiceURL() + '/' + caseId + '/comments');
  }

  load(caseId: string): Observable<CaseComment[]> {
    return this._load(caseId);
  }
}
