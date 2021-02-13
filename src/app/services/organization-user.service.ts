import {Injectable} from '@angular/core';
import {BackendGenericService} from '../generics/backend-generic-service';
import {OrgUser} from '../models/org-user';
import {HttpClient, HttpParams} from '@angular/common/http';
import {UrlService} from './url.service';
import {FactoryService} from './factory.service';
import {interceptOrganizationUser, interceptReceiveOrganizationUser} from '../model-interceptors/org-user-interceptor';
import {DialogRef} from '../shared/models/dialog-ref';
import {IDialogData} from '../interfaces/i-dialog-data';
import {OperationTypes} from '../enums/operation-types.enum';
import {forkJoin, Observable, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {DialogService} from './dialog.service';
import {OrganizationUserPopupComponent} from '../administration/popups/organization-user-popup/organization-user-popup.component';
import {CustomRoleService} from './custom-role.service';
import {Generator} from '../decorators/generator';
import {IOrgUserCriteria} from '../interfaces/i-org-user-criteria';
import {isValidValue} from '../helpers/utils';
import {OrganizationUnitService} from './organization-unit.service';
import {CustomRole} from '../models/custom-role';
import {OrgUnit} from '../models/org-unit';
import {PermissionService} from './permission.service';
import {OrganizationUserPermissionService} from './organization-user-permission.service';
import {OrgUserPermission} from '../models/org-user-permission';

@Injectable({
  providedIn: 'root'
})
export class OrganizationUserService extends BackendGenericService<OrgUser> {
  list!: OrgUser[];

  constructor(public http: HttpClient,
              private urlService: UrlService,
              private dialogService: DialogService,
              private customRoleService: CustomRoleService,
              private organizationUnitService: OrganizationUnitService,
              private permissionService: PermissionService,
              private orgUserPermissionService: OrganizationUserPermissionService) {
    super();
    FactoryService.registerService('OrganizationUserService', this);
  }

  private _loadInitData(userId?: number): Observable<{
    customRoles: CustomRole[],
    orgUnits: OrgUnit[],
    orgUserPermissions: OrgUserPermission[]
  }> {
    return forkJoin({
      customRoles: this.customRoleService.load(),
      orgUnits: this.organizationUnitService.load(),
      orgUserPermissions: !userId ? of([]) : this.orgUserPermissionService.loadByUserId(userId)
    });
  }

  openCreateDialog(): Observable<DialogRef> {
    return this._loadInitData()
      .pipe(
        switchMap((result) => {
          return of(this.dialogService.show<IDialogData<OrgUser>>(OrganizationUserPopupComponent, {
            model: new OrgUser(),
            operation: OperationTypes.CREATE,
            customRoleList: result.customRoles,
            orgUnitList: result.orgUnits,
            orgUserPermissions: result.orgUserPermissions
          }));
        })
      );
  }

  openUpdateDialog(modelId: number): Observable<DialogRef> {
    return this._loadInitData(modelId).pipe(
      switchMap((result) => {
        return this.getById(modelId).pipe(
          switchMap((orgUser: OrgUser) => {
            return of(this.dialogService.show<IDialogData<OrgUser>>(OrganizationUserPopupComponent, {
              model: orgUser,
              operation: OperationTypes.UPDATE,
              customRoleList: result.customRoles,
              orgUnitList: result.orgUnits,
              orgUserPermissions: result.orgUserPermissions
            }));
          })
        );
      })
    );
  }

  deactivate(id: number): Observable<boolean> {
    return this.http.put<boolean>(this._getServiceURL() + '/' + id + '/de-activate', {});
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
    return interceptReceiveOrganizationUser;
  }


  private _buildCriteriaQueryParams(criteria: IOrgUserCriteria): HttpParams {
    let queryParams = new HttpParams();

    if (isValidValue(criteria.status)) {
      queryParams = queryParams.append('status', Number(criteria.status).toString());
    }
    if (isValidValue(criteria['org-id'])) {
      // @ts-ignore
      queryParams = queryParams.append('org-id', criteria['org-id'].toString());
    }
    if (isValidValue(criteria['org-branch-id'])) {
      // @ts-ignore
      queryParams = queryParams.append('org-branch-id', criteria['org-branch-id'].toString());
    }
    return queryParams;
  }

  /**
   * @description Loads the organization users list with composite(Info) properties
   */
  @Generator(OrgUser, true, {property: 'rs', interceptReceive: interceptReceiveOrganizationUser})
  loadComposite(): Observable<OrgUser[]> {
    return this.http.get<OrgUser[]>(this.urlService.URLS.ORG_USER + '/composite');
  }

  /**
   * @description Loads the organization users list by criteria
   * @param criteria: IOrgUserCriteria
   */
  @Generator(OrgUser, true)
  getByCriteria(criteria: IOrgUserCriteria): Observable<OrgUser[]> {
    const queryParams = this._buildCriteriaQueryParams(criteria);

    return this.http.get<OrgUser[]>(this.urlService.URLS.ORG_USER + '/criteria', {
      params: queryParams
    });
  }
}
