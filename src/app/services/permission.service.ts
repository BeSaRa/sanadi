import { AdminPermissionPopupComponent } from './../administration/popups/admin-permission-popup/admin-permission-popup.component';
import { Injectable } from '@angular/core';
import { Permission } from '../models/permission';
import { HttpClient } from '@angular/common/http';
import { UrlService } from './url.service';
import { FactoryService } from './factory.service';
import { CrudGenericService } from "@app/generics/crud-generic-service";
import { Pagination } from '@app/models/pagination';
import { CastResponseContainer } from "@decorators/cast-response";
import { CrudWithDialogGenericService } from '@app/generics/crud-with-dialog-generic-service';
import { ComponentType } from '@angular/cdk/portal';
import { DialogService } from './dialog.service';
import { JobTitlePopupComponent } from '@app/administration/popups/job-title-popup/job-title-popup.component';
import { Observable, of } from 'rxjs';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { switchMap } from 'rxjs/operators';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { DialogRef } from '@app/shared/models/dialog-ref';

@CastResponseContainer({
  $default: {
    model: () => Permission
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => Permission }
  }
})
@Injectable({
  providedIn: 'root'
})
export class PermissionService extends  CrudWithDialogGenericService<Permission> {
  _getDialogComponent(): ComponentType<any> {
    return AdminPermissionPopupComponent;
  }
  list!: Permission[];

  constructor(public http: HttpClient, private urlService: UrlService, public dialog: DialogService) {
    super();
    FactoryService.registerService('PermissionService', this);
  }

  _getModel(): any {
    return Permission;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.PERMISSIONS;
  }
  openViewDialog(modelId: number): Observable<DialogRef> {
    return this.getByIdComposite(modelId).pipe(
      switchMap((permission: Permission) => {
        return of(this.dialog.show<IDialogData<Permission>>(AdminPermissionPopupComponent, {
          model: permission,
          operation: OperationTypes.VIEW
        }));
      })
    );
  }
}
