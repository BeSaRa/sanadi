import {Injectable} from '@angular/core';
import {FactoryService} from './factory.service';
import {BackendGenericService} from '../generics/backend-generic-service';
import {SubventionRequestPartialLog} from '../models/subvention-request-partial-log';
import {UrlService} from './url.service';
import {HttpClient} from '@angular/common/http';
import {LangService} from './lang.service';
import {SubventionRequestPartialLogInterceptor} from '../model-interceptors/subvention-request-partial-log.interceptor';
import {Generator} from '../decorators/generator';
import {Observable} from 'rxjs';
import {ISubventionRequestPartialLogCriteria} from '../interfaces/i-subvention-request-partial-log-criteria';

@Injectable({
  providedIn: 'root'
})
export class SubventionRequestPartialLogService extends BackendGenericService<SubventionRequestPartialLog> {
  list!: SubventionRequestPartialLog[];

  constructor(private urlService: UrlService,
              public http: HttpClient,
              private langService: LangService) {
    super();
    FactoryService.registerService('SubventionRequestPartialLogService', this);
  }

  _getModel(): any {
    return SubventionRequestPartialLog;
  }

  _getReceiveInterceptor(): any {
    return SubventionRequestPartialLogInterceptor.receive;
  }

  _getSendInterceptor(): any {
    return SubventionRequestPartialLogInterceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.SUBVENTION_REQUEST_PARTIAL_LOG;
  }

  @Generator(undefined, true, {property: 'rs'})
  loadByCriteria(criteria: Partial<ISubventionRequestPartialLogCriteria>): Observable<SubventionRequestPartialLog[]> {
    return this.http.post<SubventionRequestPartialLog[]>(this._getServiceURL() + '/search', criteria);
  }

  loadByCriteriaAsBlob(criteria: Partial<ISubventionRequestPartialLogCriteria>): Observable<Blob> {
    return this.http.post(this._getServiceURL() + '/search/export?lang=' + this.langService.getPrintingLanguage(), criteria, {responseType: 'blob'});
  }
}
