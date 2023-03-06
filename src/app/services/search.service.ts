import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InterceptParam } from '@decorators/intercept-model';
import { DomSanitizer } from '@angular/platform-browser';
import { map } from 'rxjs/operators';
import { BlobModel } from '../models/blob-model';
import { GeneralSearchCriteriaInterceptor } from "@app/model-interceptors/general-search-criteria-interceptor";

export class SearchService {
  constructor(private service: {
    http: HttpClient,
    _getURLSegment(): string,
    _getModel(): any,
    domSanitizer: DomSanitizer
  }) {
  }


  private _search(@InterceptParam(new GeneralSearchCriteriaInterceptor().send) criteria: Partial<any>): Observable<any> {
    return this.service.http.post<any>(this.service._getURLSegment() + '/search', criteria);
  }
  private _licensesSearch(@InterceptParam(new GeneralSearchCriteriaInterceptor().send) criteria: Partial<any>): Observable<any> {
    return this.service.http.post<any>(this.service._getURLSegment() + '/license/search', criteria);
  }

  private _exportSearch(@InterceptParam(new GeneralSearchCriteriaInterceptor().send) criteria: Partial<any>): Observable<BlobModel> {
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
  licensesSearch(criteria: Partial<any>): Observable<any> {
    return this._licensesSearch(criteria);
  }

}
