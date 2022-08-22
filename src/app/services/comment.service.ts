import { Observable } from 'rxjs';
import { CaseComment } from '../models/case-comment';
import { HttpClient } from '@angular/common/http';
import { BackendServiceModelInterface } from '@contracts/backend-service-model-interface';
import { IModelInterceptor } from '@contracts/i-model-interceptor';
import { CaseCommentInterceptor } from '../model-interceptors/case-comment-interceptor';
import { CastResponse, CastResponseContainer } from "@decorators/cast-response";
import { HasInterception, InterceptParam } from "@decorators/intercept-model";

@CastResponseContainer({
  $default: {
    model: () => CaseComment
  }
})
export class CommentService implements Pick<BackendServiceModelInterface<CaseComment>, '_getInterceptor' | '_getModel'> {
  interceptor: CaseCommentInterceptor = new CaseCommentInterceptor();

  constructor(private service: { http: HttpClient, _getURLSegment(): string }) {
  }


  _getInterceptor(): Partial<IModelInterceptor<CaseComment>> {
    return this.interceptor;
  }

  _getModel(): any {
    return CaseComment;
  }


  @HasInterception
  @CastResponse(undefined)
  private _create(caseId: string, @InterceptParam() model: Partial<CaseComment>): Observable<CaseComment> {
    return this.service.http.post<CaseComment>(this.service._getURLSegment() + '/' + caseId + '/comment', model);
  }

  create(caseId: string, model: Partial<CaseComment>): Observable<CaseComment> {
    return this._create(caseId, model);
  }

  @HasInterception
  @CastResponse(undefined)
  private _update(_caseId: string, @InterceptParam() model: Partial<CaseComment>): Observable<CaseComment> {
    return this.service.http.put<CaseComment>(this.service._getURLSegment() + '/comment/', model);
  }

  update(caseId: string, model: Partial<CaseComment>): Observable<CaseComment> {
    return this._update(caseId, model);
  }

  @CastResponse(undefined)
  private _load(caseId: string): Observable<CaseComment[]> {
    return this.service.http.get<CaseComment[]>(this.service._getURLSegment() + '/' + caseId + '/comments');
  }

  load(caseId: string): Observable<CaseComment[]> {
    return this._load(caseId);
  }
}
