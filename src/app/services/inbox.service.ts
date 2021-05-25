import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {UrlService} from './url.service';
import {Observable} from 'rxjs';
import {QueryResultSet} from '../models/query-result-set';
import {Generator} from '../decorators/generator';
import {QueryResultSetInterceptor} from '../model-interceptors/query-result-set-interceptor';
import {FactoryService} from './factory.service';
import {IBulkResult} from '../interfaces/ibulk-result';

@Injectable({
  providedIn: 'root'
})
export class InboxService {

  constructor(private http: HttpClient, private urlService: UrlService) {
    FactoryService.registerService('InboxService', this);
  }

  @Generator(QueryResultSet, false, {property: 'rs', interceptReceive: (new QueryResultSetInterceptor().receive)})
  private _loadUserInbox(options?: any): Observable<QueryResultSet> {
    return this.http.get<QueryResultSet>(this.urlService.URLS.USER_INBOX, {
      params: (new HttpParams({fromObject: options}))
    });
  }

  loadUserInbox(options?: any): Observable<QueryResultSet> {
    return this._loadUserInbox(options);
  }

  @Generator(QueryResultSet, false, {property: 'rs', interceptReceive: (new QueryResultSetInterceptor().receive)})
  private _loadTeamInbox(teamId: number, options?: any): Observable<QueryResultSet> {
    return this.http.get<QueryResultSet>(this.urlService.URLS.TEAMS_INBOX + '/' + teamId, {
      params: (new HttpParams({fromObject: options}))
    });
  }

  loadTeamInbox(teamId: number, options?: any): Observable<QueryResultSet> {
    return this._loadTeamInbox(teamId, options);
  }

  @Generator(undefined, false, {property: 'rs'})
  private _claimBulk(taskIds: string[]): Observable<IBulkResult> {
    return this.http.post<IBulkResult>(this.urlService.URLS.CLAIM_BULK, taskIds);
  }

  claimBulk(taskIds: string[]): Observable<IBulkResult> {
    return this._claimBulk(taskIds);
  }
}
