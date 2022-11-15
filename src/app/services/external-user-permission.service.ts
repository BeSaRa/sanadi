import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ExternalUserPermission } from '../models/external-user-permission';
import { HttpClient } from '@angular/common/http';
import { FactoryService } from './factory.service';
import { UrlService } from './url.service';
import { CrudGenericService } from "@app/generics/crud-generic-service";
import { Pagination } from "@app/models/pagination";
import { CastResponse, CastResponseContainer } from "@decorators/cast-response";

@CastResponseContainer({
  $default: {
    model: () => ExternalUserPermission
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => ExternalUserPermission }
  }
})
@Injectable({
  providedIn: 'root'
})
export class ExternalUserPermissionService extends CrudGenericService<ExternalUserPermission> {
  list!: ExternalUserPermission[];

  constructor(public http: HttpClient,
              private urlService: UrlService) {
    super();
    FactoryService.registerService('ExternalUserPermissionService', this);
  }
  @CastResponse(undefined)
  loadByUserId(userId: number): Observable<ExternalUserPermission[]> {
    return this.http.get<ExternalUserPermission[]>(this._getServiceURL() + '/external-user-id/' + userId);
  }

  saveBulkUserPermissions(userId: number, permissions: number[]): Observable<any> {
    return this.http.post(this._getServiceURL() + '/external-user-id/' + userId + '/bulk', permissions);
  }

  _getModel(): any {
    return ExternalUserPermission;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.EXTERNAL_USER_PERMISSION;
  }
}
