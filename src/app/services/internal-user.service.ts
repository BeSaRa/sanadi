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
import {Observable} from "rxjs";
import {IDefaultResponse} from "@app/interfaces/idefault-response";
import {map} from "rxjs/operators";
import {CommonStatusEnum} from '@app/enums/common-status.enum';

@Injectable({
  providedIn: 'root'
})
export class InternalUserService extends BackendWithDialogOperationsGenericService<InternalUser> {
  list: InternalUser[] = [];
  interceptor: InternalUserInterceptor = new InternalUserInterceptor();

  constructor(public http: HttpClient,
              private urlService: UrlService,
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
}
