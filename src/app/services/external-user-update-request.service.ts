import {ExternalUserUpdateRequestTypeEnum} from '@app/enums/external-user-update-request-type.enum';
import {Injectable} from '@angular/core';
import {ExternalUserUpdateRequest} from '@app/models/external-user-update-request';
import {HttpClient} from '@angular/common/http';
import {UrlService} from '@services/url.service';
import {FactoryService} from '@services/factory.service';
import {HasInterception, InterceptParam} from '@decorators/intercept-model';
import {CastResponse, CastResponseContainer} from '@decorators/cast-response';
import {forkJoin, Observable, of} from 'rxjs';
import {EmployeeService} from '@services/employee.service';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {Pagination} from '@app/models/pagination';
import {CrudWithDialogGenericService} from '@app/generics/crud-with-dialog-generic-service';
import {DialogService} from '@services/dialog.service';
import {ComponentType} from '@angular/cdk/portal';
import {
  ExternalUserUpdateApprovalPopupComponent
} from '@app/administration/popups/external-user-update-approval-popup/external-user-update-approval-popup.component';
import {ExternalUserUpdateRequestStatusEnum} from '@app/enums/external-user-update-request-status.enum';
import {ReasonContract} from '@contracts/reason-contract';
import {ReasonPopupComponent} from '@app/shared/popups/reason-popup/reason-popup.component';
import {exhaustMap, switchMap} from 'rxjs/operators';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {LangService} from '@services/lang.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {IDialogData} from '@contracts/i-dialog-data';
import {
  ExternalUserUpdateChangesPopupComponent
} from '@app/administration/popups/external-user-update-changes-popup/external-user-update-changes-popup.component';
import {ExternalUserService} from '@services/external-user.service';
import {CustomMenuService} from '@services/custom-menu.service';
import {UserTypes} from '@app/enums/user-types.enum';
import {PermissionService} from '@services/permission.service';
import {UserSecurityConfigurationService} from '@services/user-security-configuration.service';
import {ServiceDataService} from '@services/service-data.service';
import {ExternalUserCustomRoleService} from '@services/external-user-custom-role.service';
import {ExternalUser} from '@app/models/external-user';

@CastResponseContainer({
  $default: {
    model: () => ExternalUserUpdateRequest
  },
  $pagination: {
    model: () => Pagination,
    shape: {'rs.*': () => ExternalUserUpdateRequest}
  }
})
@Injectable({
  providedIn: 'root'
})
export class ExternalUserUpdateRequestService extends CrudWithDialogGenericService<ExternalUserUpdateRequest> {
  list!: ExternalUserUpdateRequest[];
  userRolesManageUser = this.employeeService.userRolesManageUser;

  constructor(public http: HttpClient,
              private urlService: UrlService,
              private lang: LangService,
              public dialog: DialogService,
              private employeeService: EmployeeService,
              private userSecurityConfigurationService: UserSecurityConfigurationService, // used when making instance of UserSecurityConfiguration
              private externalUserService: ExternalUserService,
              private permissionService: PermissionService,
              private serviceDataService: ServiceDataService,
              private customRoleService: ExternalUserCustomRoleService,
              private customMenuService: CustomMenuService) {
    super();
    FactoryService.registerService('ExternalUserUpdateRequestService', this);
  }

  _getModel(): { new(): ExternalUserUpdateRequest } {
    return ExternalUserUpdateRequest;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.EXTERNAL_USER_UPDATE_REQUEST;
  }

  _getDialogComponent(): ComponentType<any> {
    return ExternalUserUpdateApprovalPopupComponent;
  }

  canSaveDirectly(operation: OperationTypes): boolean {
    return (this.userRolesManageUser.isSuperAdmin(operation) || this.userRolesManageUser.isActingSuperAdmin());
  }

  canAddUser(): boolean {
    return (this.userRolesManageUser.isSuperAdmin(OperationTypes.CREATE) || this.userRolesManageUser.isSubAdmin());
  }

  canEditUser(): boolean {
    return (this.userRolesManageUser.isSuperAdmin(OperationTypes.UPDATE) || this.userRolesManageUser.isSubAdmin());
  }

  canEditUserRequest(): boolean {
    return (this.userRolesManageUser.isSuperAdmin(OperationTypes.UPDATE) || this.userRolesManageUser.isSubAdmin());
  }

  canAcceptUserRequest(): boolean {
    return (this.userRolesManageUser.isSuperAdmin(OperationTypes.UPDATE) || this.userRolesManageUser.isApprovalAdmin());
  }

  canRejectUserRequest(): boolean {
    return (this.userRolesManageUser.isSuperAdmin(OperationTypes.UPDATE) || this.userRolesManageUser.isApprovalAdmin());
  }

  @HasInterception
  @CastResponse(undefined)
  private _addUserRequest(@InterceptParam() model: ExternalUserUpdateRequest): Observable<ExternalUserUpdateRequest> {
    return this.http.post<ExternalUserUpdateRequest>(this._getServiceURL(), model);
  }

  @HasInterception
  @CastResponse(undefined)
  private _addUser(@InterceptParam() model: ExternalUserUpdateRequest): Observable<ExternalUserUpdateRequest> {
    return this.http.post<ExternalUserUpdateRequest>(this._getServiceURL() + '/external-user', model);
  }

  create(model: ExternalUserUpdateRequest): Observable<ExternalUserUpdateRequest> {
    if (this.canSaveDirectly(OperationTypes.CREATE)) {
      return this._addUser(model);
    } else {
      return this._addUserRequest(model);
    }
  }

  update(model: ExternalUserUpdateRequest): Observable<ExternalUserUpdateRequest> {
    if (this.canSaveDirectly(OperationTypes.UPDATE) && model.requestSaveType !== 'SAVE_REQUEST') {
      // @ts-ignore
      delete model.id; // deleted in service because it was ignored while prepare model due to limitation mentioned in component
      return this._updateUser(model);
    } else {
      return this._updateUserRequest(model);
    }
  }

  @HasInterception
  @CastResponse(undefined)
  private _updateUserRequest(@InterceptParam() model: ExternalUserUpdateRequest): Observable<ExternalUserUpdateRequest> {
    return this.http.put<ExternalUserUpdateRequest>(this._getServiceURL(), model);
  }

  @HasInterception
  @CastResponse(undefined)
  private _updateUser(@InterceptParam() model: ExternalUserUpdateRequest): Observable<ExternalUserUpdateRequest> {
    return this.http.put<ExternalUserUpdateRequest>(this._getServiceURL() + '/external-user', model);
  }

  acceptRequest(model: ExternalUserUpdateRequest): Observable<ExternalUserUpdateRequest> {
    return this.http.put<ExternalUserUpdateRequest>(this._getServiceURL() + '/' + model.id + '/approve', {});
  }

  rejectRequestWithReason(model: ExternalUserUpdateRequest): Observable<any> {
    return this.dialog.show<ReasonContract>(ReasonPopupComponent, {
      saveBtn: this.lang.map.lbl_reject,
      required: true,
      reasonLabel: this.lang.map.comment,
      title: this.lang.map.reject_reason,
    }).onAfterClose$
      .pipe(switchMap((result: { click: UserClickOn, comment: string }) => {
        return result.click === UserClickOn.YES ? this._rejectRequest(model, result.comment) : of('');
      }));
  }

  private _rejectRequest(model: ExternalUserUpdateRequest, reason: string) {
    return this.http.put<ExternalUserUpdateRequest>(this._getServiceURL() + '/' + model.id + '/reject', {
      notes: reason
    });
  }

  rejectBulkRequestWithReason(models: ExternalUserUpdateRequest[]): Observable<any> {
    return this.dialog.show<ReasonContract>(ReasonPopupComponent, {
      saveBtn: this.lang.map.lbl_reject,
      required: true,
      reasonLabel: this.lang.map.comment,
      title: this.lang.map.reject_reason,
    }).onAfterClose$
      .pipe(switchMap((result: { click: UserClickOn, comment: string }) => {
        return result.click === UserClickOn.YES ? this._rejectBulkRequest(models, result.comment) : of('');
      }));
  }

  private _rejectBulkRequest(selectedModels: ExternalUserUpdateRequest[], reason: string) {
    const models = selectedModels.map((item) => {
      return new ExternalUserUpdateRequest().clone({
        ...item,
        requestStatus: ExternalUserUpdateRequestStatusEnum.REJECTED,
        notes: reason
      });
    });
    return this.updateBulk(models);
  }

  openUpdateRequestDialog(request: ExternalUserUpdateRequest): Observable<DialogRef> {
    return this.getByIdComposite(request.id)
      .pipe(switchMap((model) => {
        const value = new ExternalUserUpdateRequest().clone({
          ...model,
          requestType: ExternalUserUpdateRequestTypeEnum.UPDATE
        });
        return this.externalUserService.openUpdateUserRequest(value);
      }));
  }

  viewChangesDialog(request: ExternalUserUpdateRequest): Observable<DialogRef> {
    return forkJoin({
      userRequest: this.getByIdComposite(request.id),
      user: request.externalUserID ? this.externalUserService.getByIdComposite(request.externalUserID) : of(new ExternalUser()),
      allPermissions: this.permissionService.loadAsLookups(),
      allCustomMenus: this.customMenuService.loadPrivateMenusByUserType(UserTypes.EXTERNAL),
      allServices: this.serviceDataService.loadAsLookups()
    }).pipe(
      switchMap((data: any) => {
        return of(this.dialog.show<IDialogData<ExternalUserUpdateRequest>>(ExternalUserUpdateChangesPopupComponent, {
          model: data.userRequest,
          operation: OperationTypes.VIEW,
          externalUser: data.user,
          allPermissions: data.allPermissions,
          allCustomMenus: data.allCustomMenus,
          allServices: data.allServices
        }));
      })
    );

  }
}
