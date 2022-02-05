import {Injectable} from '@angular/core';
import {InternalUser} from "@app/models/internal-user";
import {HttpClient} from "@angular/common/http";
import {InternalUserInterceptor} from "@app/model-interceptors/internal-user-interceptor";
import {UrlService} from "@app/services/url.service";
import {BackendWithDialogOperationsGenericService} from "@app/generics/backend-with-dialog-operations-generic-service";
import {DialogService} from "@app/services/dialog.service";
import {ComponentType} from "@angular/cdk/overlay";
import {InternalUserPopupComponent} from "@app/administration/popups/internal-user-popup/internal-user-popup.component";
import {FactoryService} from "@app/services/factory.service";
import {Observable, of} from "rxjs";
import {IDefaultResponse} from "@app/interfaces/idefault-response";
import {catchError, map, switchMap} from 'rxjs/operators';
import {BlobModel} from '@app/models/blob-model';
import {DomSanitizer} from '@angular/platform-browser';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {OperationTypes} from '@app/enums/operation-types.enum';

@Injectable({
  providedIn: 'root'
})
export class InternalUserService extends BackendWithDialogOperationsGenericService<InternalUser> {
  list: InternalUser[] = [];
  interceptor: InternalUserInterceptor = new InternalUserInterceptor();

  constructor(public http: HttpClient,
              private urlService: UrlService,
              private domSanitizer: DomSanitizer,
              public dialog: DialogService) {
    super()
    FactoryService.registerService('InternalUserService', this);
  }

  _getModel() {
    return InternalUser;
  }

  _getSendInterceptor() {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.INTERNAL_USER;
  }

  _getReceiveInterceptor() {
    return this.interceptor.receive;
  }

  _getDialogComponent(): ComponentType<any> {
    return InternalUserPopupComponent
  }

  updateDefaultDepartment(data: { id: number, defaultDepartmentId: number }): Observable<boolean> {
    return this.http.put<IDefaultResponse<boolean>>(this._getServiceURL() + '/default-department/update', data)
      .pipe(map(res => res.rs));
  }

  updateStatus(id: number, newStatus: CommonStatusEnum) {
    return newStatus === CommonStatusEnum.ACTIVATED ? this._activate(id) : this._deactivate(id);
  }

  private _activate(id: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + id + '/activate', {});
  }

  private _deactivate(id: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + id + '/de-activate', {});
  }

  loadSignatureByGeneralUserId(generalUserId: number) {
    return this.http.get(this._getServiceURL() + '/signature/content?generalUserId=' + generalUserId, {
      responseType: 'blob',
      observe: 'body'
    }).pipe(
      map(blob => new BlobModel(blob, this.domSanitizer),
        catchError(_ => {
          return of(new BlobModel(new Blob([], {type: 'error'}), this.domSanitizer));
        })));
  }

  private _addSignature(generalUserId: number, file: File): Observable<boolean> {
    let form = new FormData();
    form.append('content', file);
    return this.http.post<boolean>(this._getServiceURL() + '/signature?generalUserId=' + generalUserId, form);
  }

  private _updateSignature(generalUserId: number, file: File): Observable<boolean> {
    let form = new FormData();
    form.append('content', file);
    return this.http.post<boolean>(this._getServiceURL() + '/signature/update?generalUserId=' + generalUserId, form);
  }

  saveSignature(generalUserId: number, file: File, isNewSignature: boolean = true): Observable<boolean> {
    if (!isNewSignature) {
      return this._updateSignature(generalUserId, file);
    } else {
      return this._addSignature(generalUserId, file);
    }
  }

  openCreateDialog(list: InternalUser[]): Observable<DialogRef> {
    return of(this.dialog.show<IDialogData<InternalUser>>(InternalUserPopupComponent, {
      model: new InternalUser(),
      operation: OperationTypes.CREATE,
      list: list
    }));
  }

  openUpdateDialog(modelId: number, list: InternalUser[]): Observable<DialogRef> {
    return this.getById(modelId).pipe(
        switchMap((internalUser: InternalUser) => {
          return of(this.dialog.show<IDialogData<InternalUser>>(InternalUserPopupComponent, {
            model: internalUser,
            operation: OperationTypes.UPDATE,
            list: list
          }));
        })
    );
  }
}
