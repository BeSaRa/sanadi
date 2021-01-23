import {Injectable} from '@angular/core';
import {BackendGenericService} from '../generics/backend-generic-service';
import {OrgUser} from '../models/org-user';
import {HttpClient} from '@angular/common/http';
import {UrlService} from './url.service';
import {FactoryService} from './factory.service';
import {interceptOrganizationUser} from '../model-interceptors/org-user-interceptor';
import {DialogRef} from '../shared/models/dialog-ref';
import {IDialogData} from '../interfaces/i-dialog-data';
import {OperationTypes} from '../enums/operation-types.enum';
import {forkJoin, Observable, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {DialogService} from './dialog.service';
import {OrganizationUserPopupComponent} from '../administration/popups/organization-user-popup/organization-user-popup.component';
import {CustomRoleService} from './custom-role.service';
import {OrganizationUnitService} from './organization-unit.service';
import {CustomRole} from '../models/custom-role';
import {OrgUnit} from '../models/org-unit';

@Injectable({
  providedIn: 'root'
})
export class OrganizationUserService extends BackendGenericService<OrgUser> {
  list!: OrgUser[];

  constructor(public http: HttpClient, private urlService: UrlService, private dialogService: DialogService) {
    super();
    FactoryService.registerService('OrganizationUserService', this);
  }

  openCreateDialog(): Observable<DialogRef> {
    return this._loadCustomRolesAndOrgUnits()
      .pipe(
        switchMap((res: [CustomRole[], OrgUnit[]]) => {
          return of(this.dialogService.show<IDialogData<OrgUser>>(OrganizationUserPopupComponent, {
            model: new OrgUser(),
            operation: OperationTypes.CREATE,
            customRoleList: res[0],
            orgUnitList: res[1]
          }));
        })
      );
  }

  openUpdateDialog(modelId: number): Observable<DialogRef> {
    return this._loadCustomRolesAndOrgUnits()
      .pipe(
        switchMap((res: [CustomRole[], OrgUnit[]]) => {
          return this.getById(modelId).pipe(
            switchMap((orgUser: OrgUser) => {
              return of(this.dialogService.show<IDialogData<OrgUser>>(OrganizationUserPopupComponent, {
                model: orgUser,
                operation: OperationTypes.UPDATE,
                customRoleList: res[0],
                orgUnitList: res[1]
              }));
            })
          );
        })
      );
  }

  _getModel(): any {
    return OrgUser;
  }

  _getSendInterceptor(): any {
    return interceptOrganizationUser;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.ORG_USER;
  }

  _getReceiveInterceptor(): any {
  }

  private _loadCustomRolesAndOrgUnits(): Observable<[CustomRole[], OrgUnit[]]> {
    const customRoleService = FactoryService.getService<CustomRoleService>('CustomRoleService');
    const organizationUnitService = FactoryService.getService<OrganizationUnitService>('OrganizationUnitService');
    return forkJoin([customRoleService.load(), organizationUnitService.load()]);
  }
}
