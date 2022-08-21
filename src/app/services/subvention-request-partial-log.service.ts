import { Injectable } from '@angular/core';
import { FactoryService } from './factory.service';
import { SubventionRequestPartialLog } from '../models/subvention-request-partial-log';
import { UrlService } from './url.service';
import { HttpClient } from '@angular/common/http';
import { LangService } from './lang.service';
import { Observable } from 'rxjs';
import { ISubventionRequestPartialLogCriteria } from '@contracts/i-subvention-request-partial-log-criteria';
import { CrudGenericService } from "@app/generics/crud-generic-service";
import { CastResponse, CastResponseContainer } from "@decorators/cast-response";
import { Pagination } from "@app/models/pagination";

@CastResponseContainer({
  $default: {
    model: () => SubventionRequestPartialLog
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => SubventionRequestPartialLog }
  }
})
@Injectable({
  providedIn: 'root'
})
export class SubventionRequestPartialLogService extends CrudGenericService<SubventionRequestPartialLog> {
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

  _getServiceURL(): string {
    return this.urlService.URLS.SUBVENTION_REQUEST_PARTIAL_LOG;
  }

  @CastResponse(undefined)
  loadByCriteria(criteria: Partial<ISubventionRequestPartialLogCriteria>): Observable<SubventionRequestPartialLog[]> {
    return this.http.post<SubventionRequestPartialLog[]>(this._getServiceURL() + '/search', criteria);
  }

  loadByCriteriaAsBlob(criteria: Partial<ISubventionRequestPartialLogCriteria>): Observable<Blob> {
    return this.http.post(this._getServiceURL() + '/search/export?lang=' + this.langService.getPrintingLanguage(), criteria, { responseType: 'blob' });
  }
}
