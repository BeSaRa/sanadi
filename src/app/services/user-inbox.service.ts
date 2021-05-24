import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {UrlService} from './url.service';
import {Observable} from 'rxjs';
import {QueryResultSet} from '../models/query-result-set';
import {Generator} from '../decorators/generator';
import {QueryResultSetInterceptor} from '../model-interceptors/query-result-set-interceptor';

@Injectable({
  providedIn: 'root'
})
export class UserInboxService {

  constructor(private http: HttpClient, private urlService: UrlService) {
  }

  @Generator(QueryResultSet, false, {property: 'rs', interceptReceive: (new QueryResultSetInterceptor().receive)})
  private _load(options?: any): Observable<QueryResultSet> {
    return this.http.get<QueryResultSet>(this.urlService.URLS.USER_INBOX, {
      params: (new HttpParams({fromObject: options}))
    });
  }

  load(options?: any): Observable<QueryResultSet> {
    return this._load(options);
  }
}
