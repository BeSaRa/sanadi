import { Injectable } from '@angular/core';
import { SubventionRequestAid } from '../models/subvention-request-aid';
import { HttpClient } from '@angular/common/http';
import { UrlService } from './url.service';
import { Observable } from 'rxjs';
import { FactoryService } from './factory.service';
import { ISubventionRequestCriteria } from '@contracts/i-subvention-request-criteria';
import { CrudGenericService } from "@app/generics/crud-generic-service";
import { HasInterception, InterceptParam } from "@decorators/intercept-model";
import { Pagination } from "@app/models/pagination";
import { CastResponse, CastResponseContainer } from "@decorators/cast-response";

@CastResponseContainer({
  $default: {
    model: () => SubventionRequestAid
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => SubventionRequestAid }
  }
})
@Injectable({
  providedIn: 'root'
})
export class SubventionRequestAidService extends CrudGenericService<SubventionRequestAid> {
  list!: SubventionRequestAid[];

  constructor(public http: HttpClient, private urlService: UrlService) {
    super();
    FactoryService.registerService('SubventionRequestAidService', this);
  }

  @CastResponse(undefined)
  private _loadByBeneficiaryId(id: number): Observable<SubventionRequestAid[]> {
    return this.http.get<SubventionRequestAid[]>(this.urlService.URLS.SUBVENTION_REQUEST_AID + '/beneficiary/' + id);
  }

  loadByBeneficiaryId(id: number): Observable<SubventionRequestAid[]> {
    return this._loadByBeneficiaryId(id);
  }

  @HasInterception
  @CastResponse(undefined)
  private _loadByCriteria(@InterceptParam() criteria: Partial<ISubventionRequestCriteria>): Observable<SubventionRequestAid[]> {
    return this.http.post<SubventionRequestAid[]>(this.urlService.URLS.SUBVENTION_REQUEST + '/criteria', criteria);
  }

  loadByCriteria(criteria: Partial<ISubventionRequestCriteria>): Observable<SubventionRequestAid[]> {
    return this._loadByCriteria(criteria);
  }

  @HasInterception
  private _loadByCriteriaAsBlob(@InterceptParam() criteria: Partial<ISubventionRequestCriteria>): Observable<Blob> {
    return this.http.post(this.urlService.URLS.SUBVENTION_REQUEST + '/criteria/export', criteria, { responseType: 'blob' })
  }

  loadByCriteriaAsBlob(criteria: Partial<ISubventionRequestCriteria>): Observable<Blob> {
    return this._loadByCriteriaAsBlob(criteria);
  }

  _getModel() {
    return SubventionRequestAid;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.SUBVENTION_REQUEST_AID;
  }
}
