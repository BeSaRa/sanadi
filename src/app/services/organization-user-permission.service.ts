import {Injectable} from '@angular/core';
import {Generator} from '../decorators/generator';
import {Observable} from 'rxjs';
import {OrgUserPermission} from '../models/org-user-permission';
import {BackendGenericService} from '../generics/backend-generic-service';
import {HttpClient} from '@angular/common/http';
import {interceptReceiveOrgUserPermission} from '../model-interceptors/org-user-permission-interceptor';
import {FactoryService} from './factory.service';
import {UrlService} from './url.service';

@Injectable({
  providedIn: 'root'
})
export class OrganizationUserPermissionService extends BackendGenericService<OrgUserPermission> {
  list!: OrgUserPermission[];

  constructor(public http: HttpClient,
              private urlService: UrlService) {
    super();
    FactoryService.registerService('OrganizationUserPermissionService', this);
  }

  @Generator(undefined, true, {property: 'rs'})
  loadByUserId(userId: number): Observable<OrgUserPermission[]> {
    return this.http.get<OrgUserPermission[]>(this._getServiceURL() + '/org-user-id/' + userId);
  }

  saveBulkUserPermissions(userId: number, permissions: number[]): Observable<any> {
    return this.http.post(this._getServiceURL() + '/org-user-id/' + userId + '/bulk', permissions);
  }

  _getModel(): any {
    return OrgUserPermission;
  }

  _getReceiveInterceptor(): any {
    return interceptReceiveOrgUserPermission;
  }

  _getSendInterceptor(): any {
  }

  _getServiceURL(): string {
    return this.urlService.URLS.ORG_USER_PERMISSION;
  }
}
