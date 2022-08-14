import { ComponentType } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { VacationDatesPopupComponent } from '@app/administration/popups/vacation-dates-popup/vacation-dates-popup.component';
import { CastResponseContainer } from '@app/decorators/decorators/cast-response';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { CrudWithDialogGenericService } from '@app/generics/crud-with-dialog-generic-service';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { Pagination } from '@app/models/pagination';
import { VacationDates } from '@app/models/vacation-dates';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { Observable, of } from 'rxjs';
import { exhaustMap, map, switchMap } from 'rxjs/operators';
import { DialogService } from './dialog.service';
import { FactoryService } from './factory.service';
import { UrlService } from './url.service';

@CastResponseContainer({
  $default: {
    model: () => VacationDates,
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => VacationDates },
  },
})
@Injectable({
  providedIn: 'root',
})
export class VacationDatesService extends CrudWithDialogGenericService<VacationDates> {
  list: VacationDates[] = [];

  constructor(
    public dialog: DialogService,
    public http: HttpClient,
    private urlService: UrlService
  ) {
    super();
    FactoryService.registerService('VacationDatesService', this);
  }
  _getServiceURL(): string {
    return this.urlService.URLS.VACATION_DATE;
  }
  _getDialogComponent(): ComponentType<any> {
    return VacationDatesPopupComponent;
  }
  _getModel(): new () => VacationDates {
    return VacationDates;
  }
  deleteByPeriodId(periodId: number) {
    return this.http.delete(this._getServiceURL() + '/period/' + periodId);
  }
  openViewDialog(model: VacationDates): Observable<DialogRef> {
    return of(
      this.dialog.show<IDialogData<VacationDates>>(this._getDialogComponent(), {
        model,
        operation: OperationTypes.VIEW,
      })
    );
  }
  openEditDialog(model: VacationDates): Observable<DialogRef> {
    return of(
      this.dialog.show<IDialogData<VacationDates>>(this._getDialogComponent(), {
        model,
        operation: OperationTypes.UPDATE,
      })
    );
  }
}
