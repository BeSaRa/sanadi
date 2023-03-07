import { TrainingProgramPartner } from '@app/models/training-program-partner';
import { Injectable } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import { UrlService } from '@app/services/url.service';
import { DialogService } from '@app/services/dialog.service';
import { FactoryService } from '@app/services/factory.service';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { CrudWithDialogGenericService } from "@app/generics/crud-with-dialog-generic-service";
import { CastResponseContainer } from "@decorators/cast-response";
import { Pagination } from "@app/models/pagination";
import { TrainingProgramPartnerPopupComponent } from '@app/administration/popups/training-program-partner-popup/training-program-partner-popup.component';

@CastResponseContainer({
  $default: {
    model: () => TrainingProgramPartner
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => TrainingProgramPartner }
  }
})
@Injectable({
  providedIn: 'root'
})
export class TrainingProgramPartnerService extends CrudWithDialogGenericService<TrainingProgramPartner> {
  _getModel(): new () => TrainingProgramPartner {
    return TrainingProgramPartner
  }

  list: TrainingProgramPartner[] = [];

  constructor(public http: HttpClient,
              private urlService: UrlService,
              public dialog: DialogService) {
    super();
    FactoryService.registerService('TrainingProgramPartnerService', this);
  }

  _getDialogComponent(): ComponentType<any> {
    return TrainingProgramPartnerPopupComponent;
  }


  _getServiceURL(): string {
    return this.urlService.URLS.TRAINING_PROGRAM_PARTNER;
  }

  updateStatus(partnerId: number, newStatus: CommonStatusEnum) {
    return newStatus === CommonStatusEnum.ACTIVATED ? this._activate(partnerId) : this._deactivate(partnerId);
  }

  updateStatusBulk(recordIds: number[], newStatus: CommonStatusEnum): Observable<any> {
    return newStatus === CommonStatusEnum.ACTIVATED ? this._activateBulk(recordIds) : this._deactivateBulk(recordIds);
  }

  private _activate(partnerId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + partnerId + '/activate', {});
  }

  private _deactivate(partnerId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + partnerId + '/de-activate', {});
  }

  private _activateBulk(recordIds: number[]) {
    return this.http.put(this._getServiceURL() + '/bulk/activate', recordIds)
      .pipe(
        map((response: any) => {
          return response.rs;
        })
      );
  }

  private _deactivateBulk(recordIds: number[]) {
    return this.http.put(this._getServiceURL() + '/bulk/de-activate', recordIds)
      .pipe(
        map((response: any) => {
          return response.rs;
        })
      );
  }


  openViewDialog(modelId: number): Observable<DialogRef> {
    return this.getByIdComposite(modelId).pipe(
      switchMap((TrainingProgramPartner: TrainingProgramPartner) => {
        return of(this.dialog.show<IDialogData<TrainingProgramPartner>>(this._getDialogComponent(), {
          model: TrainingProgramPartner,
          operation: OperationTypes.VIEW
        }));
      })
    );
  }
}
