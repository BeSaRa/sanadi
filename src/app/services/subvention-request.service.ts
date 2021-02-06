import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BackendGenericService} from '../generics/backend-generic-service';
import {SubventionRequest} from '../models/subvention-request';
import {UrlService} from './url.service';
import {FactoryService} from './factory.service';
import {Generator} from '../decorators/generator';
import {SubventionRequestAid} from '../models/subvention-request-aid';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubventionRequestService extends BackendGenericService<SubventionRequest> {
  list!: SubventionRequest[];

  constructor(private urlService: UrlService, public http: HttpClient) {
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

  }

  _getServiceURL(): string {
    return this.urlService.URLS.SUBVENTION_REQUEST;
  }

  _getReceiveInterceptor() {

  }


  loadByCriteriaAsBlob(criteria: any): Observable<Blob> {
    return this.http.get(this._getServiceURL() + '/criteria/export?' + this._parseObjectToQueryString(criteria), {responseType: 'blob'});
  }
}
