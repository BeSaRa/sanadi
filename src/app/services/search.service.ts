import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Generator} from '../decorators/generator';
import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {InterceptParam, SendInterceptor} from '../decorators/model-interceptor';
import {GeneralSearchCriteriaInterceptor} from '../model-interceptors/general-search-criteria-interceptor';

export class SearchService {
  constructor(private service: {
    http: HttpClient,
    _getServiceURL(): string,
    _getModel(): any,
    _getInterceptor(): Partial<IModelInterceptor<any>>
  }) {
  }

  @Generator(undefined, true, {property: 'rs'})
  @SendInterceptor((new GeneralSearchCriteriaInterceptor().send))
  private _search(@InterceptParam() criteria: Partial<any>): Observable<any> {
    return this.service.http.post<any>(this.service._getServiceURL() + '/search', criteria);
  }

  _getModel(): any {
    return this.service._getModel();
  }

  _getReceiveInterceptor(): any {
    return this.service._getInterceptor().receive;
  }


  search(criteria: Partial<any>): Observable<any> {
    return this._search(criteria);
  }

}
