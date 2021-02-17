import {Injectable} from '@angular/core';
import {BackendGenericService} from '../generics/backend-generic-service';
import {SubventionRequestAid} from '../models/subvention-request-aid';
import {HttpClient, HttpParams} from '@angular/common/http';
import {UrlService} from './url.service';
import {Observable} from 'rxjs';
import {Generator} from '../decorators/generator';
import * as interceptor from '../model-interceptors/subvertion-request-aid-interceptor';
import {FactoryService} from './factory.service';
import {SubventionRequestType} from '../enums/subvention-request-type';
import {ISubventionRequestCriteria} from '../interfaces/i-subvention-request-criteria';
import {EmployeeService} from './employee.service';

@Injectable({
  providedIn: 'root'
})
export class SubventionRequestAidService extends BackendGenericService<SubventionRequestAid> {
  list!: SubventionRequestAid[];

  constructor(public http: HttpClient, private urlService: UrlService, private employeeService: EmployeeService) {
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


  loadUnderProcess(): Observable<SubventionRequestAid[]> {
    return this.loadByCriteria({
        status: SubventionRequestType.UNDER_PROCESSING,
        orgBranchId: this.employeeService.getBranch()?.id,
        orgId: this.employeeService.getOrgUnit()?.id,
        orgUserId: this.employeeService.getUser()?.id
      }
    );
  }

  @Generator(undefined, true)
  private _loadByCriteria(criteria: Partial<ISubventionRequestCriteria>): Observable<SubventionRequestAid[]> {
    return this.http.get<SubventionRequestAid[]>(this.urlService.URLS.SUBVENTION_REQUEST + '/criteria', {
      params: new HttpParams({
        fromString: this._parseObjectToQueryString(criteria)
      })
    });
  }

  loadByCriteria(criteria: Partial<ISubventionRequestCriteria>): Observable<SubventionRequestAid[]> {
    return this._loadByCriteria(criteria);
  }

  _getModel() {
    return SubventionRequestAid;
  }

  _getSendInterceptor() {
    return interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.SUBVENTION_REQUEST_AID;
  }

  _getReceiveInterceptor() {
    return interceptor.receive;
  }
}
