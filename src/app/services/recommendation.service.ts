import { HttpClient } from '@angular/common/http';
import { BackendServiceModelInterface } from '@contracts/backend-service-model-interface';
import { Recommendation } from '../models/recommendation';
import { IModelInterceptor } from '@contracts/i-model-interceptor';
import { Observable } from 'rxjs';
import { RecommendationInterceptor } from '../model-interceptors/recommendation-interceptor';
import { CastResponse, CastResponseContainer } from "@decorators/cast-response";
import { HasInterception, InterceptParam } from "@decorators/intercept-model";

@CastResponseContainer({
  $default: {
    model: () => Recommendation
  }
})
export class RecommendationService implements Pick<BackendServiceModelInterface<Recommendation>, '_getInterceptor' | '_getModel'> {
  interceptor: RecommendationInterceptor = new RecommendationInterceptor();

  constructor(private service: { http: HttpClient, _getURLSegment(): string }) {
  }


  _getInterceptor(): Partial<IModelInterceptor<Recommendation>> {
    return this.interceptor;
  }

  _getModel(): any {
    return Recommendation;
  }

  @HasInterception
  @CastResponse(undefined)
  private _create(caseId: string, @InterceptParam() model: Partial<Recommendation>): Observable<Recommendation> {
    return this.service.http.post<Recommendation>(this.service._getURLSegment() + '/' + caseId + '/recommendation', model);
  }

  create(caseId: string, model: Partial<Recommendation>): Observable<Recommendation> {
    return this._create(caseId, model);
  }

  @HasInterception
  @CastResponse(undefined)
  private _update(caseId: string, @InterceptParam() model: Partial<Recommendation>): Observable<Recommendation> {
    return this.service.http.put<Recommendation>(this.service._getURLSegment() + '/' + caseId + '/recommendation', model);
  }

  update(caseId: string, model: Partial<Recommendation>): Observable<Recommendation> {
    return this._update(caseId, model);
  }

  @CastResponse(undefined)
  private _load(caseId: string): Observable<Recommendation[]> {
    return this.service.http.get<Recommendation[]>(this.service._getURLSegment() + '/' + caseId + '/recommendations');
  }

  load(caseId: string): Observable<Recommendation[]> {
    return this._load(caseId);
  }
}

