import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BackendGenericService} from '../generics/backend-generic-service';
import {SubventionRequest} from '../models/subvention-request';
import {UrlService} from './url.service';
import {FactoryService} from './factory.service';
import {Generator} from '../decorators/generator';
import {SubventionRequestAid} from '../models/subvention-request-aid';
import {SubventionRequestAidService} from './subvention-request-aid.service';
import {Observable} from 'rxjs';
import {SubventionAidService} from './subvention-aid.service';
import {SubventionRequestInterceptor} from '../model-interceptors/subvention-request-interceptor';
import {SubventionAid} from '../models/subvention-aid';
import {ISubventionRequestCriteria} from '../interfaces/i-subvention-request-criteria';

@Injectable({
  providedIn: 'root'
})
export class SubventionRequestService extends BackendGenericService<SubventionRequest> {
  list!: SubventionRequest[];
  private interceptor: SubventionRequestInterceptor = new SubventionRequestInterceptor();

  constructor(private urlService: UrlService,
              public http: HttpClient,
              private subventionAidService: SubventionAidService,
              private subventionRequestAidService: SubventionRequestAidService) {
    super();
    FactoryService.registerService('SubventionRequestService', this);
  }

  @Generator(SubventionRequestAid, true)
  loadSubventionAidByBeneficiaryId(beneficiaryId: number) {
    return this.http.get(this.urlService.URLS.SUBVENTION_REQUEST + '/sub-aids/beneficiary/' + beneficiaryId);
  }

  _getModel() {
    return SubventionRequest;
  }

  _getSendInterceptor() {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.SUBVENTION_REQUEST;
  }

  _getReceiveInterceptor() {
    return this.interceptor.receive;
  }

  loadByCriteriaAsBlob(criteria: any): Observable<Blob> {
    return this.http.get(this._getServiceURL() + '/criteria/export?' + this._parseObjectToQueryString(criteria), {responseType: 'blob'});
  }

  loadByRequestIdAsBlob(requestId: number): Observable<Blob> {
    return this.http.get(this._getServiceURL() + '/' + requestId + '/export', {responseType: 'blob'});
  }

  loadSubventionAidByCriteria(criteria: { benId?: any, requestId?: any }): Observable<SubventionAid[]> {
    return this.subventionAidService.loadByCriteria(criteria);
  }

  loadByCriteria(criteria: Partial<ISubventionRequestCriteria>): Observable<SubventionRequestAid[]> {
    return this.subventionRequestAidService.loadByCriteria(criteria);
  }
}
