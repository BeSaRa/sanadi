import {Injectable} from '@angular/core';
import {BackendGenericService} from '../generics/backend-generic-service';
import {SubventionAid} from '../models/subvention-aid';
import {HttpClient, HttpParams} from '@angular/common/http';
import {UrlService} from './url.service';
import {FactoryService} from './factory.service';
import {SubventionAidInterceptor} from '../model-interceptors/subvention-aid-interceptor';
import {Generator} from '../decorators/generator';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {GeneralInterceptor} from '@app/model-interceptors/general-interceptor';
import {IDefaultResponse} from '@app/interfaces/idefault-response';
import {SanadiAuditResult} from '@app/models/sanadi-audit-result';
import {SanadiAuditResultInterceptor} from '@app/model-interceptors/sanadi-audit-result-interceptor';

@Injectable({
  providedIn: 'root'
})
export class SubventionAidService extends BackendGenericService<SubventionAid> {
  list!: SubventionAid[];

  constructor(public http: HttpClient, private urlService: UrlService) {
    super();
    FactoryService.registerService('SubventionAidService', this);
  }

  _getModel(): any {
    return SubventionAid;
  }

  _getReceiveInterceptor(): any {
    return SubventionAidInterceptor.receive;
  }

  _getSendInterceptor(): any {
    return SubventionAidInterceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.SUBVENTION_AID;
  }

  @Generator(undefined, true)
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

  @Generator(undefined, false)
  private _loadSubventionAidAuditDetails(auditId: number): Observable<SubventionAid> {
    return this.http.get<SubventionAid>(this._getServiceURL() + '/audit/updates/' + auditId);
  }

  loadSubventionAidAuditDetails(auditId: number): Observable<SubventionAid> {
    return this._loadSubventionAidAuditDetails(auditId);
  }
}
