import { ComponentType } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CastResponseContainer } from '@app/decorators/decorators/cast-response';
import { CrudWithDialogGenericService } from '@app/generics/crud-with-dialog-generic-service';
import { MemberRole } from '@app/models/member-role';
import { Pagination } from '@app/models/pagination';
import { DialogService } from './dialog.service';
import { FactoryService } from './factory.service';
import { UrlService } from './url.service';

@CastResponseContainer({
  $default: {
    model: () => MemberRole,
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => MemberRole },
  },
})
@Injectable({
  providedIn: 'root',
})
export class MemberRoleService extends CrudWithDialogGenericService<MemberRole> {
  list: MemberRole[] = [];
  constructor(public dialog: DialogService, public http: HttpClient, private urlService: UrlService) {
    super();
    FactoryService.registerService('MemberRoleService', this);
  }
  _getDialogComponent(): ComponentType<any> {
    throw new Error('Method not implemented.');
  }
  _getModel(): new () => MemberRole {
    return MemberRole;
  }
  _getServiceURL(): string {
    return this.urlService.URLS.MEMBER_ROLES;
  }
  getMembersOfCharity(id: number) {
    return this.http.get(this._getServiceURL() + '/charity/' + id + '/members');
  }

}
