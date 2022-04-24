import {Injectable} from '@angular/core';
import {BackendGenericService} from '../generics/backend-generic-service';
import {SubventionRequestAid} from '../models/subvention-request-aid';
import {HttpClient, HttpParams} from '@angular/common/http';
import {UrlService} from './url.service';
import {Observable} from 'rxjs';
import {Generator} from '../decorators/generator';
import {FactoryService} from './factory.service';
import {ISubventionRequestCriteria} from '../interfaces/i-subvention-request-criteria';
import {SubventionRequestAidInterceptor} from '../model-interceptors/subvention-request-aid-interceptor';
import {InterceptParam, SendInterceptor} from '@app/decorators/model-interceptor';

@Injectable({
  providedIn: 'root'
})
export class SubventionRequestAidService extends BackendGenericService<SubventionRequestAid> {
  list!: SubventionRequestAid[];

  constructor(public http: HttpClient, private urlService: UrlService) {
    super();
    FactoryService.registerService('SubventionRequestAidService', this);
  }

  @Generator(undefined, true)
  private _loadByBeneficiaryId(id: number): Observable<SubventionRequestAid[]> {
    return this.http.get<SubventionRequestAid[]>(this.urlService.URLS.SUBVENTION_REQUEST_AID + '/beneficiary/' + id);
  }

  loadByBeneficiaryId(id: number): Observable<SubventionRequestAid[]> {
    return this._loadByBeneficiaryId(id);
  }

  @SendInterceptor()
  @Generator(undefined, true)
  private _loadByCriteria(@InterceptParam() criteria: Partial<ISubventionRequestCriteria>): Observable<SubventionRequestAid[]> {
    return this.http.post<SubventionRequestAid[]>(this.urlService.URLS.SUBVENTION_REQUEST + '/criteria', criteria);
  }

  loadByCriteria(criteria: Partial<ISubventionRequestCriteria>): Observable<SubventionRequestAid[]> {
    return this._loadByCriteria(criteria);
  }

  @SendInterceptor()
  private _loadByCriteriaAsBlob(@InterceptParam() criteria: Partial<ISubventionRequestCriteria>): Observable<Blob> {
    return this.http.post(this.urlService.URLS.SUBVENTION_REQUEST + '/criteria/export', criteria, {responseType: 'blob'})
  }

  loadByCriteriaAsBlob(criteria: Partial<ISubventionRequestCriteria>): Observable<Blob> {
    return this._loadByCriteriaAsBlob(criteria);
  }

  _getModel() {
    return SubventionRequestAid;
  }

  _getSendInterceptor() {
    return SubventionRequestAidInterceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.SUBVENTION_REQUEST_AID;
  }

  _getReceiveInterceptor() {
    return SubventionRequestAidInterceptor.receive;
  }
}
