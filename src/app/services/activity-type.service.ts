import { ComponentType } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivityTypeComponent } from '@app/administration/pages/activity-type/activity-type.component';
import { ActivityTypesPopupComponent } from '@app/administration/popups/activity-types-popup/activity-types-popup.component';
import { CastResponseContainer } from '@app/decorators/decorators/cast-response';
import { AdminLookupTypeEnum } from '@app/enums/admin-lookup-type-enum';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { CrudWithDialogGenericService } from '@app/generics/crud-with-dialog-generic-service';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { AdminLookup } from '@app/models/admin-lookup';
import { Pagination } from '@app/models/pagination';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { Observable, of } from 'rxjs';
import { AdminLookupService } from './admin-lookup.service';
import { DialogService } from './dialog.service';

@CastResponseContainer({
  $default: {
    model: () => AdminLookup,
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => AdminLookup },
  },
})
@Injectable({
  providedIn: 'root',
})
export class ActivityTypeService extends CrudWithDialogGenericService<AdminLookup> {
  list: AdminLookup[] = [];
  constructor(public dialog: DialogService, public http: HttpClient, private adminLookupService: AdminLookupService) {
    super();
  }
  _getDialogComponent(): ComponentType<any> {
    return ActivityTypesPopupComponent;
  }
  _getModel(): new () => AdminLookup {
    return AdminLookup;
  }
  _getServiceURL(): string {
    return this.adminLookupService._getServiceURLByType(AdminLookupTypeEnum.ACTIVITY_TYPE);
  }
  openViewDialog(model: AdminLookup): Observable<DialogRef> {
    return of(
      this.dialog.show<IDialogData<AdminLookup>>(this._getDialogComponent(), {
        model,
        operation: OperationTypes.VIEW,
      })
    );
  }
  openEditDialog(model: AdminLookup): Observable<DialogRef> {
    return of(
      this.dialog.show<IDialogData<AdminLookup>>(this._getDialogComponent(), {
        model,
        operation: OperationTypes.UPDATE,
      })
    );
  }
}
