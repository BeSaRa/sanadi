import {Injectable} from '@angular/core';
import {ExternalUser} from '../models/external-user';
import {HttpClient, HttpParams} from '@angular/common/http';
import {UrlService} from './url.service';
import {FactoryService} from './factory.service';
import {DialogRef} from '../shared/models/dialog-ref';
import {IDialogData} from '@contracts/i-dialog-data';
import {OperationTypes} from '../enums/operation-types.enum';
import {forkJoin, Observable, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {DialogService} from './dialog.service';
import {ExternalUserPopupComponent} from '../administration/popups/external-user-popup/external-user-popup.component';
import {ExternalUserCustomRoleService} from './external-user-custom-role.service';
import {IOrgUserCriteria} from '@contracts/i-org-user-criteria';
import {CustomRole} from '../models/custom-role';
import {PermissionService} from './permission.service';
import {ExternalUserPermissionService} from './external-user-permission.service';
import {ExternalUserPermission} from '../models/external-user-permission';
import {AuditLogService} from './audit-log.service';
import {ComponentType} from '@angular/cdk/portal';
import {CastResponse, CastResponseContainer} from '@decorators/cast-response';
import {CrudWithDialogGenericService} from '@app/generics/crud-with-dialog-generic-service';
import {Pagination} from '@app/models/pagination';
import {PaginationContract} from '@contracts/pagination-contract';
import {CommonUtils} from '@helpers/common-utils';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {EmployeeService} from '@services/employee.service';
import {ProfileService} from '@services/profile.service';

@CastResponseContainer({
  $default: {
    model: () => ExternalUser
  },
  $pagination: {
    model: () => Pagination,
    shape: {'rs.*': () => ExternalUser}
  }
})
@Injectable({
  providedIn: 'root'
})
export class ExternalUserService extends CrudWithDialogGenericService<ExternalUser> {
  list!: ExternalUser[];

  constructor(public http: HttpClient,
              private urlService: UrlService,
              public dialog: DialogService,
              private customRoleService: ExternalUserCustomRoleService,
              private profileService: ProfileService,
              private permissionService: PermissionService,
              private orgUserPermissionService: ExternalUserPermissionService,
              private employeeService: EmployeeService,
              private auditLogService: AuditLogService) {
    super();
    FactoryService.registerService('ExternalUserService', this);
  }

  _getModel(): any {
    return ExternalUser;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.EXTERNAL_USER;
  }

  _getDialogComponent(): ComponentType<any> {
    return ExternalUserPopupComponent;
  }

  private _loadInitData(userId?: number): Observable<{ customRoles: CustomRole[], orgUserPermissions: ExternalUserPermission[] }> {
    return forkJoin({
      customRoles: this.customRoleService.loadAsLookups(),
      orgUserPermissions: !userId ? of([]) : this.orgUserPermissionService.loadByUserId(userId)
    });
  }

  addDialog(): Observable<DialogRef> {
    return this._loadInitData()
      .pipe(
        switchMap((result) => {
          let model = new ExternalUser().clone();
          if (this.employeeService.isExternalUser()){
            model.profileId = this.employeeService.getProfile()!.id;
            model.status = CommonStatusEnum.ACTIVATED;
          }
          return of(this.dialog.show<IDialogData<ExternalUser>>(ExternalUserPopupComponent, {
            model: model,
            operation: OperationTypes.CREATE,
            customRoleList: result.customRoles,
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
          switchMap((orgUser: ExternalUser) => {
            return of(this.dialog.show<IDialogData<ExternalUser>>(ExternalUserPopupComponent, {
              model: orgUser,
              operation: OperationTypes.VIEW,
              customRoleList: result.customRoles,
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
          switchMap((orgUser: ExternalUser) => {
            return of(this.dialog.show<IDialogData<ExternalUser>>(ExternalUserPopupComponent, {
              model: orgUser,
              operation: OperationTypes.UPDATE,
              customRoleList: result.customRoles,
              orgUserPermissions: result.orgUserPermissions
            }));
          })
        );
      })
    );
  }

  editDialog(model: ExternalUser): Observable<DialogRef> {
    return this._openUpdateDialog(model.id, false);
  }

  editDialogComposite(model: ExternalUser): Observable<DialogRef> {
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


  private _buildCriteriaQueryParams(criteria: IOrgUserCriteria, pagingOptions?: Partial<PaginationContract>): HttpParams {
    let queryParams = new HttpParams();

    if (CommonUtils.isValidValue(criteria.status)) {
      queryParams = queryParams.append('status', Number(criteria.status).toString());
    }
    if (CommonUtils.isValidValue(criteria['profile-id'])) {
      // @ts-ignore
      queryParams = queryParams.append('profile-id', criteria['profile-id'].toString());
    }
    /*if (CommonUtils.isValidValue(criteria['org-id'])) {
      // @ts-ignore
      queryParams = queryParams.append('org-id', criteria['org-id'].toString());
    }
    if (CommonUtils.isValidValue(criteria['org-branch-id'])) {
      // @ts-ignore
      queryParams = queryParams.append('org-branch-id', criteria['org-branch-id'].toString());
    }*/
    if (pagingOptions) {
      queryParams = queryParams.appendAll(pagingOptions);
    }
    return queryParams;
  }

  /**
   * @description Loads the organization users list by criteria
   * @param criteria: IOrgUserCriteria
   */
  @CastResponse(undefined, {fallback: '$default', unwrap: 'rs'})
  getByCriteria(criteria: IOrgUserCriteria): Observable<ExternalUser[]> {
    const queryParams = this._buildCriteriaQueryParams(criteria);

    return this.http.get<ExternalUser[]>(this._getServiceURL() + '/criteria', {
      params: queryParams
    });
  }

  @CastResponse(undefined, {
    fallback: '$pagination'
  })
  private _getByCriteriaPaging(options: Partial<PaginationContract>, criteria: IOrgUserCriteria): Observable<Pagination<ExternalUser[]>> {
    const queryParams = this._buildCriteriaQueryParams(criteria, options);

    return this.http.get<Pagination<ExternalUser[]>>(this._getServiceURL() + '/criteria', {
      params: queryParams
    });
  }

  /**
   * @description Loads the organization users list by criteria and paging
   * @param options: Partial<PaginationContract>
   * @param criteria: IOrgUserCriteria
   */
  getByCriteriaPaging(options: Partial<PaginationContract>, criteria: IOrgUserCriteria): Observable<Pagination<ExternalUser[]>> {
    return this._getByCriteriaPaging(options, criteria);
  }

  openAuditLogsById(id: number): Observable<DialogRef> {
    return this.auditLogService.openAuditLogsDialog(id, this._getServiceURL());
  }
}
