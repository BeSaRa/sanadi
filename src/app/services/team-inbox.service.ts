import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {UrlService} from './url.service';
import {Generator} from '../decorators/generator';
import {QueryResultSet} from '../models/query-result-set';
import {QueryResultSetInterceptor} from '../model-interceptors/query-result-set-interceptor';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeamInboxService {

  constructor(private http: HttpClient, private urlService: UrlService) {

  }

  @Generator(QueryResultSet, false, {property: 'rs', interceptReceive: (new QueryResultSetInterceptor().receive)})
  private _load(teamId: number, options?: any): Observable<QueryResultSet> {
    return this.http.get<QueryResultSet>(this.urlService.URLS.TEAMS_INBOX + '/' + teamId, {
      params: (new HttpParams({fromObject: options}))
    });
  }

  load(teamId: number, options?: any): Observable<QueryResultSet> {
    return this._load(teamId, options);
  }
}
