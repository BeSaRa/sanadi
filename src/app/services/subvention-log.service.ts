import { Injectable } from '@angular/core';
import { FactoryService } from './factory.service';
import { SubventionLog } from '../models/subvention-log';
import { HttpClient } from '@angular/common/http';
import { UrlService } from './url.service';
import { Observable } from 'rxjs';
import { LangService } from './lang.service';
import { CastResponse, CastResponseContainer } from "@decorators/cast-response";
import { Pagination } from "@app/models/pagination";
import { CrudGenericService } from "@app/generics/crud-generic-service";

@CastResponseContainer({
  $default: {
    model: () => SubventionLog
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => SubventionLog }
  }
})

@Injectable({
  providedIn: 'root'
})
export class SubventionLogService extends CrudGenericService<SubventionLog> {
  list!: SubventionLog[];

  constructor(public http: HttpClient,
              private urlService: UrlService,
              private langService: LangService) {
    super();
    FactoryService.registerService('SubventionLogService', this);
  }

  _getModel(): any {
    return SubventionLog;
  }
  _getServiceURL(): string {
    return this.urlService.URLS.SUBVENTION_LOG;
  }

  loadByRequestIdAsBlob(requestId: number): Observable<Blob> {
    return this.http.get(this._getServiceURL() + '/export/' + requestId + '?lang=' + this.langService.getPrintingLanguage(), { responseType: 'blob' });
  }

  @CastResponse(undefined)
  loadByRequestId(requestId: number): Observable<SubventionLog[]> {
    return this.http.get<SubventionLog[]>(this._getServiceURL() + '/request-id/' + requestId);
  }
}
