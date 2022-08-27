import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { InternalUserDepartment } from "@app/models/internal-user-department";
import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { InternalUserDepartmentInterceptor } from "@app/model-interceptors/internal-user-department-interceptor";
import { UrlService } from "@app/services/url.service";
import { Observable } from "rxjs";
import { FactoryService } from "@app/services/factory.service";
import { CastResponse, CastResponseContainer } from "@decorators/cast-response";
import { Pagination } from '@app/models/pagination';
import { CrudGenericService } from "@app/generics/crud-generic-service";

@CastResponseContainer({
  $default: {
    model: () => InternalUserDepartment
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => InternalUserDepartment }
  }
})
@Injectable({
  providedIn: 'root'
})
export class InternalUserDepartmentService extends CrudGenericService<InternalUserDepartment> {
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

  @CastResponse(undefined)
  criteria(criteria: Partial<InternalUserDepartment>): Observable<InternalUserDepartment[]> {
    return this.http.get<InternalUserDepartment[]>(this._getServiceURL() + '/criteria', {
      params: new HttpParams({ fromObject: criteria as any })
    })
  }
}
