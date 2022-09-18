import { Injectable } from '@angular/core';
import { OrgUser } from '../models/org-user';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UrlService } from './url.service';
import { FactoryService } from './factory.service';
import { DialogRef } from '../shared/models/dialog-ref';
import { IDialogData } from '@contracts/i-dialog-data';
import { OperationTypes } from '../enums/operation-types.enum';
import { forkJoin, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DialogService } from './dialog.service';
import { OrganizationUserPopupComponent } from '../administration/popups/organization-user-popup/organization-user-popup.component';
import { CustomRoleService } from './custom-role.service';
import { IOrgUserCriteria } from '@contracts/i-org-user-criteria';
import { OrganizationUnitService } from './organization-unit.service';
import { CustomRole } from '../models/custom-role';
import { OrgUnit } from '../models/org-unit';
import { PermissionService } from './permission.service';
import { OrganizationUserPermissionService } from './organization-user-permission.service';
import { OrgUserPermission } from '../models/org-user-permission';
import { AuditLogService } from './audit-log.service';
import { ComponentType } from '@angular/cdk/portal';
import { CastResponse, CastResponseContainer } from '@decorators/cast-response';
import { CrudWithDialogGenericService } from '@app/generics/crud-with-dialog-generic-service';
import { Pagination } from '@app/models/pagination';
import { PaginationContract } from '@contracts/pagination-contract';
import { CommonUtils } from '@helpers/common-utils';
import { CommonStatusEnum } from '@app/enums/common-status.enum';

@CastResponseContainer({
  $default: {
    model: () => OrgUser
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => OrgUser }
  }
})
@Injectable({
  providedIn: 'root'
})
export class OrganizationUserService extends CrudWithDialogGenericService<OrgUser> {
  list!: OrgUser[];

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
      customRoles: this.customRoleService.loadAsLookups(),
      orgUnits: this.organizationUnitService.loadAsLookups(),
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
            orgUserPermissions: result.orgUserPermissions
          }));
        })
      );
  }

  openViewDialog(orgUserId: number): Observable<DialogRef> {
    return this._loadInitData(orgUserId).pipe(
      switchMap((result) => {
        let request = this.getById(orgUserId);
        return request.pipe(
          switchMap((orgUser: OrgUser) => {
            return of(this.dialog.show<IDialogData<OrgUser>>(OrganizationUserPopupComponent, {
              model: orgUser,
              operation: OperationTypes.VIEW,
              customRoleList: result.customRoles,
              orgUnitList: result.orgUnits,
              orgUserPermissions: result.orgUserPermissions
            }));
          })
        );
      })
    );
  }

  private _openUpdateDialog(orgUserId: number, isCompositeLoad: boolean): Observable<DialogRef> {
    return this._loadInitData(orgUserId).pipe(
      switchMap((result) => {
        let request = isCompositeLoad ? this.getByIdComposite(orgUserId) : this.getById(orgUserId);
        return request.pipe(
          switchMap((orgUser: OrgUser) => {
            return of(this.dialog.show<IDialogData<OrgUser>>(OrganizationUserPopupComponent, {
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

  editDialog(model: OrgUser): Observable<DialogRef> {
    return this._openUpdateDialog(model.id, false);
  }

  editDialogComposite(model: OrgUser): Observable<DialogRef> {
    return this._openUpdateDialog(model.id, true);
  }

  updateStatus(id: number, newStatus: CommonStatusEnum) {
    return newStatus === CommonStatusEnum.ACTIVATED ? this.activate(id) : this.deactivate(id);
  }
  @CastResponse('')
  activate(id: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + id + '/activate', {});
  }
  @CastResponse('')
  deactivate(id: number): Observable<boolean> {
    return this.http.put<boolean>(this._getServiceURL() + '/' + id + '/de-activate', {});
  }
  @CastResponse('')
  deactivateBulk(ids: number[]): Observable<{ [key: number]: boolean }> {
    return this.http.put<{ [key: number]: boolean }>(this._getServiceURL() + '/bulk/de-activate', ids);
  }

  _getModel(): any {
    return OrgUser;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.ORG_USER;
  }


  private _buildCriteriaQueryParams(criteria: IOrgUserCriteria, pagingOptions?: Partial<PaginationContract>): HttpParams {
    let queryParams = new HttpParams();

    if (CommonUtils.isValidValue(criteria.status)) {
      queryParams = queryParams.append('status', Number(criteria.status).toString());
    }
    if (CommonUtils.isValidValue(criteria['org-id'])) {
      // @ts-ignore
      queryParams = queryParams.append('org-id', criteria['org-id'].toString());
    }
    if (CommonUtils.isValidValue(criteria['org-branch-id'])) {
      // @ts-ignore
      queryParams = queryParams.append('org-branch-id', criteria['org-branch-id'].toString());
    }
    if (pagingOptions) {
      queryParams = queryParams.appendAll(pagingOptions);
    }
    return queryParams;
  }

  /**
   * @description Loads the organization users list by criteria
   * @param criteria: IOrgUserCriteria
   */
  @CastResponse(undefined, { fallback: '$default', unwrap: 'rs' })
  getByCriteria(criteria: IOrgUserCriteria): Observable<OrgUser[]> {
    const queryParams = this._buildCriteriaQueryParams(criteria);

    return this.http.get<OrgUser[]>(this._getServiceURL() + '/criteria', {
      params: queryParams
    });
  }

  @CastResponse(undefined, {
    fallback: '$pagination'
  })
  private _getByCriteriaPaging(options: Partial<PaginationContract>, criteria: IOrgUserCriteria): Observable<Pagination<OrgUser[]>> {
    const queryParams = this._buildCriteriaQueryParams(criteria, options);

    return this.http.get<Pagination<OrgUser[]>>(this._getServiceURL() + '/criteria', {
      params: queryParams
    });
  }

  /**
   * @description Loads the organization users list by criteria and paging
   * @param options: Partial<PaginationContract>
   * @param criteria: IOrgUserCriteria
   */
  getByCriteriaPaging(options: Partial<PaginationContract>, criteria: IOrgUserCriteria): Observable<Pagination<OrgUser[]>> {
    return this._getByCriteriaPaging(options, criteria);
  }

  openAuditLogsById(id: number): Observable<DialogRef> {
    return this.auditLogService.openAuditLogsDialog(id, this._getServiceURL());
  }
}
