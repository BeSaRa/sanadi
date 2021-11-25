import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BackendGenericService} from "@app/generics/backend-generic-service";
import {InternalUserDepartment} from "@app/models/internal-user-department";
import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {InternalUserDepartmentInterceptor} from "@app/model-interceptors/internal-user-department-interceptor";
import {UrlService} from "@app/services/url.service";
import {Observable} from "rxjs";
import {Generator} from "@app/decorators/generator";
import {FactoryService} from "@app/services/factory.service";

@Injectable({
  providedIn: 'root'
})
export class InternalUserDepartmentService extends BackendGenericService<InternalUserDepartment> {
  list: InternalUserDepartment[] = [];
  interceptor: IModelInterceptor<InternalUserDepartment> = new InternalUserDepartmentInterceptor();

  _getModel() {
    return InternalUserDepartment;
  }

  _getSendInterceptor() {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.INTERNAL_USER_DEPARTMENT;
  }

  _getReceiveInterceptor() {
    return this.interceptor.receive;
  }

  constructor(public http: HttpClient, public urlService: UrlService) {
    super();
    FactoryService.registerService('InternalUserDepartmentService', this);
  }

  @Generator(undefined, true)
  criteria(criteria: Partial<InternalUserDepartment>): Observable<InternalUserDepartment[]> {
    return this.http.get<InternalUserDepartment[]>(this._getServiceURL() + '/criteria', {
      params: new HttpParams({fromObject: criteria as any})
    })
  }
}
