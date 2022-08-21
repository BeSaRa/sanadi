import { Injectable } from '@angular/core';
import { ChecklistItem } from '@app/models/checklist-item';
import { ComponentType } from '@angular/cdk/overlay';
import { ChecklistPopupComponent } from '@app/administration/popups/checklist-popup/checklist-popup.component';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UrlService } from '@app/services/url.service';
import { DialogService } from '@app/services/dialog.service';
import { FactoryService } from '@app/services/factory.service';
import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { ChecklistItemInterceptor } from '@app/model-interceptors/checklist-item-interceptor';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { ServiceDataStep } from '@app/models/service-data-step';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { Observable, of } from 'rxjs';
import {
  ChecklistItemPopupComponent
} from '@app/administration/popups/checklist-item-popup/checklist-item-popup.component';
import { IChecklistCriteria } from '@app/interfaces/ichecklist-criteria';
import { CrudWithDialogGenericService } from "@app/generics/crud-with-dialog-generic-service";
import { Pagination } from "@app/models/pagination";
import { CastResponse, CastResponseContainer } from "@decorators/cast-response";

@CastResponseContainer({
  $default: {
    model: () => ChecklistItem
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => ChecklistItem }
  }
})
@Injectable({
  providedIn: 'root'
})
export class ChecklistService extends CrudWithDialogGenericService<ChecklistItem> {
  list!: ChecklistItem[];
  interceptor: IModelInterceptor<ChecklistItem> = new ChecklistItemInterceptor();

  constructor(public http: HttpClient,
              private urlService: UrlService,
              public dialog: DialogService) {
    super();
    FactoryService.registerService('ChecklistService', this);
  }

  _getDialogComponent(): ComponentType<any> {
    return ChecklistPopupComponent;
  }

  _getModel(): any {
    return ChecklistItem;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.CHECKLIST;
  }

  @CastResponse(undefined)
  getChecklistByStepId(stepId: number): Observable<ChecklistItem[]> {
    return this.http.get<ChecklistItem[]>(this._getServiceURL() + '/step/' + stepId);
  }

  openCheckListDialog(serviceDataStep: ServiceDataStep, readonly: boolean = false): Observable<DialogRef> {
    return of(this.dialog.show<IDialogData<ServiceDataStep>>(ChecklistPopupComponent, {
      model: serviceDataStep,
      operation: readonly ? OperationTypes.VIEW : OperationTypes.UPDATE
    }));
  }

  openAddChecklistItemDialog(stepId: number): DialogRef {
    return this.dialog.show<IDialogData<ChecklistItem>>(ChecklistItemPopupComponent, {
      model: new ChecklistItem(),
      operation: OperationTypes.CREATE,
      stepId: stepId
    });
  }

  openEditChecklistItemDialog(stepId: number, checklistItem: ChecklistItem): DialogRef {
    return this.dialog.show<IDialogData<ChecklistItem>>(ChecklistItemPopupComponent, {
      model: checklistItem,
      operation: OperationTypes.UPDATE,
      stepId: stepId
    });
  }

  openViewChecklistItemDialog(stepId: number, checklistItem: ChecklistItem): DialogRef {
    return this.dialog.show<IDialogData<ChecklistItem>>(ChecklistItemPopupComponent, {
      model: checklistItem,
      operation: OperationTypes.VIEW,
      stepId: stepId
    });
  }

  @CastResponse(undefined)
  private _criteria(criteria: IChecklistCriteria) {
    return this.http.get(this._getServiceURL() + '/criteria', {
      params: new HttpParams({
        fromObject: {...criteria}
      })
    });
  }

  criteria(criteria: IChecklistCriteria) {
    return this._criteria(criteria);
  }

  // openEditChecklistItemDialog(stepId: number, checklistItemId: number): Observable<DialogRef> {
  //   return this.getById(checklistItemId).pipe(
  //     switchMap((checklistItem: ChecklistItem) => {
  //       return of(this.dialog.show<IDialogData<ChecklistItem>>(ChecklistItemPopupComponent, {
  //         model: checklistItem,
  //         operation: OperationTypes.UPDATE,
  //         stepId: stepId
  //       }));
  //     })
  //   );
  // }
}
