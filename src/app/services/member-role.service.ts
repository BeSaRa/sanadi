import { ComponentType } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CastResponseContainer } from '@decorators/decorators/cast-response';
import { CrudWithDialogGenericService } from '@app/generics/crud-with-dialog-generic-service';
import { MemberRole } from '@models/member-role';
import { OrgMember } from '@models/org-member';
import { Pagination } from '@models/pagination';
import { OrgExecutiveMember } from '@models/org-executive-member';
import { DialogService } from '@services/dialog.service';
import { FactoryService } from '@services/factory.service';
import { UrlService } from '@services/url.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
@CastResponseContainer({
  $default: {
    model: () => MemberRole,
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => MemberRole },
  }
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

  getMembersOfCharity(id: number): Observable<{ [key: string]: OrgMember[] | OrgExecutiveMember[] }> {
    return this.http.get<{ [key: string]: { orgMember: OrgMember | OrgExecutiveMember }[] }>(this._getServiceURL() + '/charity/' + id + '/members').pipe(
      map(x =>
        Object.entries(x.rs).reduce((pv, [key, value]) => {
          if (!Array.isArray(value)) {
            return pv;
          }
          return {
            ...pv,
            [key]: value.map(e => e.orgMember)
          }
        }, {})
      )
    );
  }

}
