import {Injectable} from '@angular/core';
import {BackendWithDialogOperationsGenericService} from '@app/generics/backend-with-dialog-operations-generic-service';
import {ChecklistItem} from '@app/models/checklist-item';
import {ComponentType} from '@angular/cdk/overlay';
import {ChecklistPopupComponent} from '@app/administration/popups/checklist-popup/checklist-popup.component';
import {HttpClient, HttpParams} from '@angular/common/http';
import {UrlService} from '@app/services/url.service';
import {DialogService} from '@app/services/dialog.service';
import {FactoryService} from '@app/services/factory.service';
import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {ChecklistItemInterceptor} from '@app/model-interceptors/checklist-item-interceptor';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {ServiceDataStep} from '@app/models/service-data-step';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {Observable, of} from 'rxjs';
import {Generator} from '@app/decorators/generator';
import {
  ChecklistItemPopupComponent
} from '@app/administration/popups/checklist-item-popup/checklist-item-popup.component';
import {IChecklistCriteria} from "@app/interfaces/ichecklist-criteria";

@Injectable({
  providedIn: 'root'
})
export class ChecklistService extends BackendWithDialogOperationsGenericService<ChecklistItem> {
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

  _getReceiveInterceptor(): any {
    return this.interceptor.receive;
  }

  _getSendInterceptor(): any {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.CHECKLIST;
  }

  @Generator(undefined, true, {property: 'rs'})
  getChecklistByStepId(stepId: number): Observable<ChecklistItem[]> {
    return this.http.get<ChecklistItem[]>(this._getServiceURL() + '/step/' + stepId);
  }

  openListDialog(serviceDataStep: ServiceDataStep): Observable<DialogRef> {
    return of(this.dialog.show<IDialogData<ServiceDataStep>>(ChecklistPopupComponent, {
      model: serviceDataStep,
      operation: OperationTypes.VIEW
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

  @Generator(ChecklistItem, true)
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
