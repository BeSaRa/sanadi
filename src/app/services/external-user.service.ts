import {Injectable} from '@angular/core';
import {ExternalUser} from '@models/external-user';
import {HttpClient, HttpParams} from '@angular/common/http';
import {UrlService} from './url.service';
import {FactoryService} from './factory.service';
import {DialogRef} from '../shared/models/dialog-ref';
import {IDialogData} from '@contracts/i-dialog-data';
import {OperationTypes} from '@enums/operation-types.enum';
import {forkJoin, Observable, of} from 'rxjs';
import {catchError, switchMap} from 'rxjs/operators';
import {DialogService} from './dialog.service';
import {ExternalUserPopupComponent} from '../administration/popups/external-user-popup/external-user-popup.component';
import {ExternalUserCustomRoleService} from './external-user-custom-role.service';
import {IExternalUserCriteria} from '@contracts/i-external-user-criteria';
import {CustomRole} from '@models/custom-role';
import {PermissionService} from './permission.service';
import {ExternalUserPermissionService} from './external-user-permission.service';
import {ExternalUserPermission} from '@models/external-user-permission';
import {ComponentType} from '@angular/cdk/portal';
import {CastResponse, CastResponseContainer} from '@decorators/cast-response';
import {CrudWithDialogGenericService} from '@app/generics/crud-with-dialog-generic-service';
import {Pagination} from '@app/models/pagination';
import {PaginationContract} from '@contracts/pagination-contract';
import {CommonUtils} from '@helpers/common-utils';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {EmployeeService} from '@services/employee.service';
import {ProfileService} from '@services/profile.service';
import {ExternalUserUpdateRequest} from '@app/models/external-user-update-request';

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
              private externalUserPermissionService: ExternalUserPermissionService,
              private employeeService: EmployeeService) {
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

  private _loadInitData(userId?: number): Observable<{ customRoles: CustomRole[], externalUserPermissions: ExternalUserPermission[] }> {
    return forkJoin({
      customRoles: this.customRoleService.loadAsLookups(),
      externalUserPermissions: !userId ? of([]) : this.externalUserPermissionService.loadByUserId(userId)
    });
  }

  addDialog(selectedProfile?: number): Observable<DialogRef> {
    return this._loadInitData()
      .pipe(
        switchMap((result) => {
          let model = new ExternalUser().clone({
            status: CommonStatusEnum.ACTIVATED,
            profileId: selectedProfile
          });

          return of(this.dialog.show<IDialogData<ExternalUser>>(ExternalUserPopupComponent, {
            model: model,
            operation: OperationTypes.CREATE,
            customRoleList: result.customRoles,
            externalUserPermissions: result.externalUserPermissions,
            userRequest: undefined
          }));
        })
      );
  }

  viewDialog(model: ExternalUser): Observable<DialogRef> {
    return this._openViewDialog(model.id, false);
  }

  viewDialogComposite(model: ExternalUser): Observable<DialogRef> {
    return this._openViewDialog(model.id, false);
  }

  private _openViewDialog(orgUserId: number, isCompositeLoad: boolean): Observable<DialogRef> {
    return this._loadInitData(orgUserId).pipe(
      switchMap((result) => {
        let request = this.getById(orgUserId);
        return request.pipe(
          switchMap((orgUser: ExternalUser) => {
            return of(this.dialog.show<IDialogData<ExternalUser>>(ExternalUserPopupComponent, {
              model: orgUser,
              operation: OperationTypes.VIEW,
              customRoleList: result.customRoles,
              externalUserPermissions: result.externalUserPermissions,
              userRequest: undefined
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
              externalUserPermissions: result.externalUserPermissions,
              userRequest: undefined
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
    return newStatus === CommonStatusEnum.ACTIVATED ? this.deactivate(id) : this.activate(id);
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
  @CastResponse(undefined, {fallback: '$default', unwrap: 'rs'})
  getByProfileCriteria(criteria: Partial<IExternalUserCriteria>): Observable<ExternalUser[]> {
    const queryParams = this._buildCriteriaQueryParams(criteria);
    return this.http.get<ExternalUser[]>(this._getServiceURL() + '/profile-id' ,{
      params: queryParams
    });
  }

  private _buildCriteriaQueryParams(criteria: Partial<IExternalUserCriteria>, pagingOptions?: Partial<PaginationContract>): HttpParams {
    let queryParams = new HttpParams();

    if (CommonUtils.isValidValue(criteria.status)) {
      queryParams = queryParams.append('status', Number(criteria.status).toString());
    }
    if (CommonUtils.isValidValue(criteria['profile-id'])) {
      queryParams = queryParams.append('profile-id', (criteria['profile-id']!).toString());
    }
    if (pagingOptions) {
      queryParams = queryParams.appendAll(pagingOptions);
    }
    return queryParams;
  }

  /**
   * @description Loads the external users list by criteria
   * @param criteria: Partial<IExternalUserCriteria>
   */
  @CastResponse(undefined, {fallback: '$default', unwrap: 'rs'})
  getByCriteria(criteria: Partial<IExternalUserCriteria>): Observable<ExternalUser[]> {
    const queryParams = this._buildCriteriaQueryParams(criteria);

    return this.http.get<ExternalUser[]>(this._getServiceURL() + '/criteria', {
      params: queryParams
    });
  }

  @CastResponse(undefined, {
    fallback: '$pagination'
  })
  private _getByCriteriaPaging(options: Partial<PaginationContract>, criteria: Partial<IExternalUserCriteria>): Observable<Pagination<ExternalUser[]>> {
    const queryParams = this._buildCriteriaQueryParams(criteria, options);

    return this.http.get<Pagination<ExternalUser[]>>(this._getServiceURL() + '/criteria', {
      params: queryParams,
    });
  }

  /**
   * @description Loads the external users list by criteria and paging
   * @param options: Partial<PaginationContract>
   * @param criteria: Partial<IExternalUserCriteria>
   */
  getByCriteriaPaging(options: Partial<PaginationContract>, criteria: Partial<IExternalUserCriteria>): Observable<Pagination<ExternalUser[]>> {
    return this._getByCriteriaPaging(options, criteria);
  }

  /**
   * @description Load the external users by profile and paging
   * NOTE: this response contains full response. So, use it only to load external users inside admin screen, otherwise use load by criteria
   * @param options
   * @param profileId
   */
  @CastResponse(undefined, {
    fallback: '$pagination'
  })
  loadByProfilePaging(options: Partial<PaginationContract>, profileId: number): Observable<Pagination<ExternalUser[]>> {
    const queryParams = this._buildCriteriaQueryParams({'profile-id': profileId} as Partial<IExternalUserCriteria>, options);
    return this.http.get<Pagination<ExternalUser[]>>(this._getServiceURL() + '/profile-id', {
      params: queryParams,
    }).pipe(catchError(() => of(this._emptyPaginationListResponse)));
  }

  openUpdateUserRequest(userUpdateRequest: ExternalUserUpdateRequest): Observable<DialogRef> {
    return this._loadInitData(userUpdateRequest.externalUserID).pipe(
      switchMap((result) => {
        return of(this.dialog.show<IDialogData<ExternalUser>>(ExternalUserPopupComponent, {
          model: userUpdateRequest.convertToExternalUser(),
          operation: OperationTypes.UPDATE,
          customRoleList: result.customRoles,
          externalUserPermissions: result.externalUserPermissions,
          userRequest: userUpdateRequest
        }));
      })
    );
  }
}
