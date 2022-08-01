import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SDGoal } from '@app/models/sdgoal';
import { FactoryService } from '@app/services/factory.service';
import { UrlService } from '@app/services/url.service';
import { ComponentType } from '@angular/cdk/portal';
import { SdGoalPopupComponent } from '@app/administration/popups/sd-goal-popup/sd-goal-popup.component';
import { DialogService } from '@app/services/dialog.service';
import { SdGoalInterceptor } from '@app/model-interceptors/sd-goal-interceptor';
import { Generator } from '@app/decorators/generator';
import { Observable } from 'rxjs';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { CrudWithDialogGenericService } from "@app/generics/crud-with-dialog-generic-service";
import { CastResponseContainer } from "@decorators/cast-response";
import { Pagination } from "@app/models/pagination";

@CastResponseContainer({
  $default: {
    model: () => SDGoal
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => SDGoal }
  }
})
@Injectable({
  providedIn: 'root'
})
export class SDGoalService extends CrudWithDialogGenericService<SDGoal> {
  list: SDGoal[] = [];
  interceptor: SdGoalInterceptor = new SdGoalInterceptor();

  _getModel() {
    return SDGoal;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.SD_GOAL;
  }

  constructor(public http: HttpClient, private urlService: UrlService, public dialog: DialogService) {
    super();
    FactoryService.registerService('SDGoalService', this);
  }

  @Generator(undefined, true, { property: 'rs' })
  private _loadSubSdGoals(sdGoalId: number): Observable<SDGoal[]> {
    return this.http.get<SDGoal[]>(this._getServiceURL() + '/sub/' + sdGoalId);
  }

  loadSubSdGoals(sdGoalId: number): Observable<SDGoal[]> {
    return this._loadSubSdGoals(sdGoalId);
  }

  private getSubSdGoalDialog(model: SDGoal, operation: OperationTypes, parentId: number | null): DialogRef {
    return this.dialog.show<IDialogData<SDGoal>>(this._getDialogComponent(), {
      operation,
      model,
      parentId: parentId
    })
  }

  subSdGoalAddDialog(parentId: number | null): DialogRef {
    // return this.getDialog(new (this._getModel() as { new(...args: any[]): SDGoal }), OperationTypes.CREATE);
    return this.getSubSdGoalDialog(new (this._getModel() as { new(...args: any[]): SDGoal }), OperationTypes.CREATE, parentId);
  }

  subSdGoalEditDialog(model: SDGoal, parentId: number | null): DialogRef {
    return this.getSubSdGoalDialog(model, OperationTypes.UPDATE, parentId);
  }

  _getDialogComponent(): ComponentType<any> {
    return SdGoalPopupComponent;
  }

  updateStatus(sdGoalId: number, newStatus: CommonStatusEnum) {
    return newStatus === CommonStatusEnum.ACTIVATED ? this._activate(sdGoalId) : this._deactivate(sdGoalId);
  }

  private _activate(sdGoalId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + sdGoalId + '/activate', {});
  }

  private _deactivate(sdGoalId: number): Observable<any> {
    return this.http.put<any>(this._getServiceURL() + '/' + sdGoalId + '/de-activate', {});
  }
}
