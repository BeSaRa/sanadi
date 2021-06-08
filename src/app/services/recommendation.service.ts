import {HttpClient} from '@angular/common/http';
import {BackendServiceModelInterface} from '../interfaces/backend-service-model-interface';
import {Recommendation} from '../models/recommendation';
import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {InterceptParam, SendInterceptor} from '../decorators/model-interceptor';
import {Generator} from '../decorators/generator';
import {Observable} from 'rxjs';
import {RecommendationInterceptor} from '../model-interceptors/recommendation-interceptor';

export class RecommendationService implements Pick<BackendServiceModelInterface<Recommendation>, '_getInterceptor' | '_getModel'> {
  interceptor: RecommendationInterceptor = new RecommendationInterceptor();

  constructor(private service: { http: HttpClient, _getServiceURL(): string }) {
  }


  _getInterceptor(): Partial<IModelInterceptor<Recommendation>> {
    return this.interceptor;
  }

  _getModel(): any {
    return Recommendation;
  }


  @SendInterceptor()
  @Generator(undefined, false, {property: 'rs'})
  private _create(caseId: string, @InterceptParam() model: Partial<Recommendation>): Observable<Recommendation> {
    return this.service.http.post<Recommendation>(this.service._getServiceURL() + '/' + caseId + '/recommendation', model);
  }

  create(caseId: string, model: Partial<Recommendation>): Observable<Recommendation> {
    return this._create(caseId, model);
  }

  @SendInterceptor()
  @Generator(undefined, false, {property: 'rs'})
  private _update(caseId: string, @InterceptParam() model: Partial<Recommendation>): Observable<Recommendation> {
    return this.service.http.put<Recommendation>(this.service._getServiceURL() + '/' + caseId + '/recommendation', model);
  }

  update(caseId: string, model: Partial<Recommendation>): Observable<Recommendation> {
    return this._update(caseId, model);
  }

  @Generator(undefined, true, {property: 'rs'})
  private _load(caseId: string): Observable<Recommendation[]> {
    return this.service.http.get<Recommendation[]>(this.service._getServiceURL() + '/' + caseId + '/recommendations');
  }

  load(caseId: string): Observable<Recommendation[]> {
    return this._load(caseId);
  }
}

