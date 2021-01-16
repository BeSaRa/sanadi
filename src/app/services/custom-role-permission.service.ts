import {Injectable} from '@angular/core';
import {FactoryService} from './factory.service';
import {BackendGenericService} from '../generics/backend-generic-service';
import {CustomRolePermission} from '../models/custom-role-permission';
import {HttpClient, HttpParams} from '@angular/common/http';
import {UrlService} from './url.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomRolePermissionService extends BackendGenericService<CustomRolePermission> {
  list!: CustomRolePermission[];

  constructor(public http: HttpClient, private urlService: UrlService) {
    super();
    FactoryService.registerService('CustomRolePermissionService', this);
  }

  _getModel(): any {
    return CustomRolePermission;
  }

  _getSendInterceptor(): any {
  }

  _getServiceURL(): string {
    return this.urlService.URLS.CUSTOM_ROLE_PERMISSIONS;
  }

  getByCustomRoleId(customRoleId: any | number): Observable<CustomRolePermission[]> {
    return this.http.get<CustomRolePermission[]>(this.urlService.URLS.CUSTOM_ROLE_PERMISSIONS, {
      params: new HttpParams({
        fromObject: {customRoleId}
      })
    });
  }
}
