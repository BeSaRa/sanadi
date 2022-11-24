import { DynamicModel } from './../models/dynamic-model';
import { CastResponse, CastResponseContainer } from "@app/decorators/decorators/cast-response";
import { Injectable } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { Subject, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DialogService } from './dialog.service';
import { FactoryService } from './factory.service';
import { UrlService } from './url.service';
import { CrudWithDialogGenericService } from '@app/generics/crud-with-dialog-generic-service';
import { GeneralProcessPopupComponent } from '@app/administration/popups/general-process-popup/general-process-popup.component';

@CastResponseContainer({
  $default: {
    model: () => DynamicModel
  }
})
@Injectable({
  providedIn: 'root'
})
export class DynamicModelService extends CrudWithDialogGenericService<DynamicModel>{
  _getModel(): new () => DynamicModel {
    return DynamicModel
  }

  list: DynamicModel[] = [];
  private _selectField: Subject<string> = new Subject<string>();
  constructor(public http: HttpClient,
    private urlService: UrlService,
    public dialog: DialogService) {
    super();
    FactoryService.registerService('DynamicModelService', this);
  }

  _getDialogComponent(): ComponentType<any> {
    return GeneralProcessPopupComponent;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.GENERAL_PROCESS;
  }
  listenToSelectField() {
    return this._selectField
  }
  setlectField(fieldId: string) {
    this._selectField.next(fieldId);
  }
  openViewDialog(modelId: number): Observable<DialogRef> {
    return this.getByIdComposite(modelId).pipe(
      switchMap((DynamicModel: DynamicModel) => {
        return of(this.dialog.show<IDialogData<DynamicModel>>(
          this._getDialogComponent(),
          {
            model: DynamicModel,
            operation: OperationTypes.VIEW
          },
          { fullscreen: true }
        ));
      })
    );
  }


  @CastResponse(undefined, {
    unwrap: 'rs',
    fallback: '$default'
  })
  filterProcess(params: Partial<DynamicModel>): Observable<DynamicModel[]> {
    return this.http.post<DynamicModel[]>(this._getServiceURL() + '/filter', params)
  }
}
