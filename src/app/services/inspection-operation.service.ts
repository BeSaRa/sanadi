import { InspectionOperationPopupComponent } from './../administration/popups/inspection-operation-popup/inspection-operation-popup.component';
import { ComponentType } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CastResponseContainer } from '@app/decorators/decorators/cast-response';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { CrudWithDialogGenericService } from '@app/generics/crud-with-dialog-generic-service';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { InspectionOperation } from '@app/models/inspection-operation';
import { Pagination } from '@app/models/pagination';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DialogService } from './dialog.service';
import { FactoryService } from './factory.service';
import { UrlService } from './url.service';
import { InspectionOperationChildrenPopupComponent } from '@app/administration/popups/inspection-operation-children-popup/inspection-operation-children-popup.component';

@CastResponseContainer({
  $default: {
    model: () => InspectionOperation
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => InspectionOperation }
  }
})

@Injectable({
  providedIn: 'root'
})
export class InspectionOperationService extends CrudWithDialogGenericService<InspectionOperation> {
  list: InspectionOperation[] = [];

  constructor(public http: HttpClient,
    private urlService: UrlService,
    public dialog: DialogService) {
    super();
    FactoryService.registerService('InspectionOperationService', this);
  }

  _getModel(): new () => InspectionOperation {
    return InspectionOperation;
  }

  _getDialogComponent(): ComponentType<any> {
    return InspectionOperationPopupComponent;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.INSPECTION_OPERATION;
  }

  openViewDialog(modelId: number): Observable<DialogRef> {
    return this.getById(modelId).pipe(
      switchMap((InspectionOperation: InspectionOperation) => {
        return of(this.dialog.show<IDialogData<InspectionOperation>>(InspectionOperationPopupComponent, {
          model: InspectionOperation,
          operation: OperationTypes.VIEW
        }));
      })
    );
  }
  openChildrenDialog(models: InspectionOperation[]): Observable<DialogRef> {
    return of(this.dialog.show<IDialogData<InspectionOperation[]>>(InspectionOperationChildrenPopupComponent, {
      model: models,
      operation: OperationTypes.UPDATE
    }));
  }
  openCreateDialog(mainOperations:InspectionOperation[]=[]): DialogRef {
    return this.dialog.show<IDialogData<InspectionOperation> & {mainOperations:InspectionOperation[]}>
    (this._getDialogComponent(), {
      model: new InspectionOperation(),
      mainOperations,
      operation: OperationTypes.CREATE,
    });
  }
}
