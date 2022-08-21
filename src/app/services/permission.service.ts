import { Injectable } from '@angular/core';
import { Permission } from '../models/permission';
import { HttpClient } from '@angular/common/http';
import { UrlService } from './url.service';
import { FactoryService } from './factory.service';
import { CrudGenericService } from "@app/generics/crud-generic-service";
import { Pagination } from '@app/models/pagination';
import { CastResponseContainer } from "@decorators/cast-response";

@CastResponseContainer({
  $default: {
    model: () => Permission
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => Permission }
  }
})
@Injectable({
  providedIn: 'root'
})
export class PermissionService extends CrudGenericService<Permission> {
  list!: Permission[];

  constructor(public http: HttpClient, private urlService: UrlService) {
    super();
    FactoryService.registerService('PermissionService', this);
  }

  _getModel(): any {
    return Permission;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.PERMISSIONS;
  }
}
