import {Injectable} from '@angular/core';
import {BackendGenericService} from '../generics/backend-generic-service';
import {Permission} from '../models/permission';
import {HttpClient} from '@angular/common/http';
import {UrlService} from './url.service';
import {FactoryService} from './factory.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionService extends BackendGenericService<Permission> {
  list!: Permission[];

  constructor(public http: HttpClient, private urlService: UrlService) {
    super();
    FactoryService.registerService('PermissionService', this);
  }

  _getModel(): any {
    return Permission;
  }

  _getSendInterceptor(): any {
  }

  _getServiceURL(): string {
    return this.urlService.URLS.PERMISSIONS;
  }

  _getReceiveInterceptor(): any {
  }
}
