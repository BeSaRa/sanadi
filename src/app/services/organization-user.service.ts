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
import {Observable, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {DialogService} from './dialog.service';
import {OrganizationUserPopupComponent} from '../administration/popups/organization-user-popup/organization-user-popup.component';

@Injectable({
  providedIn: 'root'
})
export class OrganizationUserService extends BackendGenericService<OrgUser> {
  list!: OrgUser[];

  constructor(public http: HttpClient, private urlService: UrlService, private dialogService: DialogService) {
    super();
    FactoryService.registerService('OrganizationUserService', this);
  }

  openCreateDialog(): DialogRef {
    return this.dialogService.show<IDialogData<OrgUser>>(OrganizationUserPopupComponent, {
      model: new OrgUser(),
      operation: OperationTypes.CREATE
    });
  }

  openUpdateDialog(modelId: number): Observable<DialogRef> {
    return this.getById(modelId).pipe(
      switchMap((orgUser: OrgUser) => {
        return of(this.dialogService.show<IDialogData<OrgUser>>(OrganizationUserPopupComponent, {
          model: orgUser,
          operation: OperationTypes.UPDATE
        }));
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
}
