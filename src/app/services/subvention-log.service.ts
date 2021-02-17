import {Injectable} from '@angular/core';
import {FactoryService} from './factory.service';
import {BackendGenericService} from '../generics/backend-generic-service';
import {SubventionLog} from '../models/subvention-log';
import {HttpClient} from '@angular/common/http';
import {SubventionLogInterceptor} from '../model-interceptors/subvention-log-interceptor';
import {UrlService} from './url.service';
import {Observable} from 'rxjs';
import {Generator} from '../decorators/generator';

@Injectable({
  providedIn: 'root'
})
export class SubventionLogService extends BackendGenericService<SubventionLog> {
  list!: SubventionLog[];
  private interceptor: SubventionLogInterceptor = new SubventionLogInterceptor();

  constructor(public http: HttpClient,
              private urlService: UrlService) {
    super();
    FactoryService.registerService('SubventionLogService', this);
  }

  _getModel(): any {
    return SubventionLog;
  }

  _getSendInterceptor(): any {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.SUBVENTION_LOG;
  }

  _getReceiveInterceptor(): any {
    return this.interceptor.receive;
  }

  @Generator(undefined, true)
  loadByRequestId(requestId: number): Observable<SubventionLog[]> {
    return this.http.get<SubventionLog[]>(this._getServiceURL() + '/request-id/' + requestId);
  }
}
