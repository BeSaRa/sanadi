import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OrgUserPermission } from '../models/org-user-permission';
import { HttpClient } from '@angular/common/http';
import { FactoryService } from './factory.service';
import { UrlService } from './url.service';
import { CrudGenericService } from "@app/generics/crud-generic-service";
import { Pagination } from "@app/models/pagination";
import { CastResponse, CastResponseContainer } from "@decorators/cast-response";

@CastResponseContainer({
  $default: {
    model: () => OrgUserPermission
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => OrgUserPermission }
  }
})
@Injectable({
  providedIn: 'root'
})
export class OrganizationUserPermissionService extends CrudGenericService<OrgUserPermission> {
  list!: OrgUserPermission[];

  constructor(public http: HttpClient,
              private urlService: UrlService) {
    super();
    FactoryService.registerService('OrganizationUserPermissionService', this);
  }
  @CastResponse(undefined)
  loadByUserId(userId: number): Observable<OrgUserPermission[]> {
    return this.http.get<OrgUserPermission[]>(this._getServiceURL() + '/org-user-id/' + userId);
  }

  saveBulkUserPermissions(userId: number, permissions: number[]): Observable<any> {
    return this.http.post(this._getServiceURL() + '/org-user-id/' + userId + '/bulk', permissions);
  }

  _getModel(): any {
    return OrgUserPermission;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.ORG_USER_PERMISSION;
  }
}
