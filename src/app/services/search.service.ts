import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Generator} from '../decorators/generator';
import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {InterceptParam, SendInterceptor} from '../decorators/model-interceptor';
import {GeneralSearchCriteriaInterceptor} from '../model-interceptors/general-search-criteria-interceptor';
import {DomSanitizer} from '@angular/platform-browser';
import {map} from 'rxjs/operators';
import {BlobModel} from '../models/blob-model';

export class SearchService {
  constructor(private service: {
    http: HttpClient,
    _getServiceURL(): string,
    _getModel(): any,
    _getInterceptor(): Partial<IModelInterceptor<any>>,
    domSanitizer: DomSanitizer
  }) {
  }

  @Generator(undefined, true, {property: 'rs'})
  @SendInterceptor((new GeneralSearchCriteriaInterceptor().send))
  private _search(@InterceptParam() criteria: Partial<any>): Observable<any> {
    return this.service.http.post<any>(this.service._getServiceURL() + '/search', criteria);
  }

  @SendInterceptor((new GeneralSearchCriteriaInterceptor().send))
  private _exportSearch(@InterceptParam() criteria: Partial<any>): Observable<BlobModel> {
    return this.service.http.post(this.service._getServiceURL() + '/search/export', criteria, {
      responseType: 'blob',
      observe: 'body'
    }).pipe(map(blob => new BlobModel(blob, this.service.domSanitizer)));
  }

  exportSearch(criteria: Partial<any>): Observable<BlobModel> {
    return this._exportSearch(criteria);
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
