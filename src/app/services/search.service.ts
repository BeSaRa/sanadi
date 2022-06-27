import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Generator } from '@decorators/generator';
import { InterceptParam, SendInterceptor } from '@decorators/model-interceptor';
import { GeneralSearchCriteriaInterceptor } from '../model-interceptors/general-search-criteria-interceptor';
import { DomSanitizer } from '@angular/platform-browser';
import { map } from 'rxjs/operators';
import { BlobModel } from '../models/blob-model';

export class SearchService {
  constructor(private service: {
    http: HttpClient,
    _getURLSegment(): string,
    _getModel(): any,
    domSanitizer: DomSanitizer
  }) {
  }

  @Generator(undefined, true, {property: 'rs' , interceptReceive: new GeneralSearchCriteriaInterceptor().receive})
  @SendInterceptor((new GeneralSearchCriteriaInterceptor().send))
  private _search(@InterceptParam() criteria: Partial<any>): Observable<any> {
    return this.service.http.post<any>(this.service._getURLSegment() + '/search', criteria);
  }

  @SendInterceptor((new GeneralSearchCriteriaInterceptor().send))
  private _exportSearch(@InterceptParam() criteria: Partial<any>): Observable<BlobModel> {
    return this.service.http.post(this.service._getURLSegment() + '/search/export', criteria, {
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

  search(criteria: Partial<any>): Observable<any> {
    return this._search(criteria);
  }

}
