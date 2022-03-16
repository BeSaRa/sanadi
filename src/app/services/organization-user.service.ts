import {Injectable} from '@angular/core';
import {OrgUser} from '../models/org-user';
import {HttpClient, HttpParams} from '@angular/common/http';
import {UrlService} from './url.service';
import {FactoryService} from './factory.service';
import {OrgUserInterceptor} from '../model-interceptors/org-user-interceptor';
import {DialogRef} from '../shared/models/dialog-ref';
import {IDialogData} from '../interfaces/i-dialog-data';
import {OperationTypes} from '../enums/operation-types.enum';
import {forkJoin, Observable, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {DialogService} from './dialog.service';
import {
  OrganizationUserPopupComponent
} from '../administration/popups/organization-user-popup/organization-user-popup.component';
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
import {AuditLogService} from './audit-log.service';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {BackendWithDialogOperationsGenericService} from '@app/generics/backend-with-dialog-operations-generic-service';
import {ComponentType} from '@angular/cdk/portal';
import {OrgUserStatusEnum} from '@app/enums/status.enum';

@Injectable({
  providedIn: 'root'
})
export class OrganizationUserService extends BackendWithDialogOperationsGenericService<OrgUser> {
  list!: OrgUser[];
  interceptor: OrgUserInterceptor = new OrgUserInterceptor();

  constructor(public http: HttpClient,
              private urlService: UrlService,
              public dialog: DialogService,
              private customRoleService: CustomRoleService,
              private organizationUnitService: OrganizationUnitService,
              private permissionService: PermissionService,
              private orgUserPermissionService: OrganizationUserPermissionService,
              private auditLogService: AuditLogService) {
    super();
    FactoryService.registerService('OrganizationUserService', this);
  }

  _getDialogComponent(): ComponentType<any> {
    return OrganizationUserPopupComponent;
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

  addDialog(): Observable<DialogRef> {
    return this._loadInitData()
      .pipe(
        switchMap((result) => {
          return of(this.dialog.show<IDialogData<OrgUser>>(OrganizationUserPopupComponent, {
            model: new OrgUser(),
            operation: OperationTypes.CREATE,
            customRoleList: result.customRoles,
            orgUnitList: result.orgUnits,
            orgUserPermissions: result.orgUserPermissions,
            list: this.list
          }));
        })
      );
  }

  private _openUpdateDialog(orgUserId: number, isCompositeLoad: boolean): Observable<DialogRef> {
    return this._loadInitData(orgUserId).pipe(
      switchMap((result) => {
        let request = isCompositeLoad  ? this.getByIdComposite(orgUserId) : this.getById(orgUserId);
        return request.pipe(
          switchMap((orgUser: OrgUser) => {
            return of(this.dialog.show<IDialogData<OrgUser>>(OrganizationUserPopupComponent, {
              model: orgUser,
              operation: OperationTypes.UPDATE,
              customRoleList: result.customRoles,
              orgUnitList: result.orgUnits,
              orgUserPermissions: result.orgUserPermissions,
              list: this.list
            }));
          })
        );
      })
    );
  }

  editDialog(model: OrgUser): Observable<DialogRef> {
    return this._openUpdateDialog(model.id, false);
  }

  editDialogComposite(model: OrgUser): Observable<DialogRef> {
    return this._openUpdateDialog(model.id, true);
  }

  updateStatus(id: number, newStatus: OrgUserStatusEnum) {
    return newStatus === OrgUserStatusEnum.ACTIVE ? this.activate(id) : this.deactivate(id);
  }

  private activate(id: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + id + '/activate', {});
  }

  deactivate(id: number): Observable<boolean> {
    return this.http.put<boolean>(this._getServiceURL() + '/' + id + '/de-activate', {});
  }

  deactivateBulk(ids: number[]): Observable<{ [key: number]: boolean }> {
    return this.http.put<{ [key: number]: boolean }>(this._getServiceURL() + '/bulk/de-activate', ids);
  }

  _getModel(): any {
    return OrgUser;
  }

  _getSendInterceptor(): any {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.ORG_USER;
  }

  _getReceiveInterceptor(): any {
    return this.interceptor.receive;
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
   * @description Loads the organization users list by criteria
   * @param criteria: IOrgUserCriteria
   */
  @Generator(undefined, true)
  getByCriteria(criteria: IOrgUserCriteria): Observable<OrgUser[]> {
    const queryParams = this._buildCriteriaQueryParams(criteria);

    return this.http.get<OrgUser[]>(this._getServiceURL() + '/criteria', {
      params: queryParams
    });
  }

  openAuditLogsById(id: number): Observable<DialogRef> {
    return this.auditLogService.openAuditLogsDialog(id, this._getServiceURL());
  }
}
