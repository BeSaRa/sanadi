import { Injectable } from '@angular/core';
import { SubventionAid } from '../models/subvention-aid';
import { HttpClient } from '@angular/common/http';
import { UrlService } from './url.service';
import { FactoryService } from './factory.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GeneralInterceptor } from '@app/model-interceptors/general-interceptor';
import { IDefaultResponse } from '@app/interfaces/idefault-response';
import { SanadiAuditResult } from '@app/models/sanadi-audit-result';
import { SanadiAuditResultInterceptor } from '@app/model-interceptors/sanadi-audit-result-interceptor';
import { Pagination } from "@app/models/pagination";
import { CastResponse, CastResponseContainer } from "@decorators/cast-response";
import { CrudGenericService } from "@app/generics/crud-generic-service";

@CastResponseContainer({
  $default: {
    model: () => SubventionAid
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => SubventionAid }
  }
})
@Injectable({
  providedIn: 'root'
})
export class SubventionAidService extends CrudGenericService<SubventionAid> {
  list!: SubventionAid[];

  constructor(public http: HttpClient, private urlService: UrlService) {
    super();
    FactoryService.registerService('SubventionAidService', this);
  }

  _getModel(): any {
    return SubventionAid;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.SUBVENTION_AID;
  }

  @CastResponse(undefined)
  private _loadByCriteria(criteria: { benId?: any, requestId?: any }): Observable<SubventionAid[]> {
    return this.http.post<SubventionAid[]>(this._getServiceURL() + '/criteria', criteria);
  }

  loadByCriteria(criteria: { benId?: any, requestId?: any }): Observable<SubventionAid[]> {
    return this._loadByCriteria(criteria);
  }

  /**
   * @description Loads the subvention aid audit data by request id
   * @param requestId
   */
  loadSubventionAidAuditData(requestId: number): Observable<SanadiAuditResult[]> {
    return this.http.get<IDefaultResponse<SanadiAuditResult[]>>(this._getServiceURL() + '/audit/' + requestId)
      .pipe(
        map((result) => {
          return result.rs.map(data => {
            let item = Object.assign(new SanadiAuditResult(), data),
              interceptor = new SanadiAuditResultInterceptor();

            item = GeneralInterceptor.receive(item);
            item.auditEntity = 'SUBVENTION_AID';
            return interceptor.receive(item);
          })
        })
      );
  }

  @CastResponse(undefined)
  private _loadSubventionAidAuditDetails(auditId: number): Observable<SubventionAid> {
    return this.http.get<SubventionAid>(this._getServiceURL() + '/audit/updates/' + auditId);
  }

  loadSubventionAidAuditDetails(auditId: number): Observable<SubventionAid> {
    return this._loadSubventionAidAuditDetails(auditId);
  }
}
