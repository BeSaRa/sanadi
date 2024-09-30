import { ComponentType } from "@angular/cdk/portal";
import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { CastResponseContainer } from "@app/decorators/decorators/cast-response";
import { OperationTypes } from "@app/enums/operation-types.enum";
import { CrudWithDialogGenericService } from "@app/generics/crud-with-dialog-generic-service";
import { IDialogData } from "@app/interfaces/i-dialog-data";
import { Pagination } from "@app/models/pagination";
import { Penalty } from "@app/models/penalty";
import { DialogRef } from "@app/shared/models/dialog-ref";
import { Observable, switchMap, of } from "rxjs";
import { DialogService } from "./dialog.service";
import { FactoryService } from "./factory.service";
import { UrlService } from "./url.service";
import { PenaltyPopupComponent } from "@app/administration/popups/penalty-popup/penalty-popup.component";
import { CommonStatusEnum } from "@app/enums/common-status.enum";

@CastResponseContainer({
    $default: {
      model: () => Penalty
    },
    $pagination: {
      model: () => Pagination,
      shape: { 'rs.*': () => Penalty }
    }
  })
  @Injectable({
    providedIn: 'root'
  })
  export class PenaltyService extends CrudWithDialogGenericService<Penalty> {
    list: Penalty[] = [];
    http = inject(HttpClient);
    urlService = inject(UrlService);
    dialog = inject(DialogService);
  
    constructor() {
      super();
      FactoryService.registerService('PenaltyService', this);
    }
  
    _getModel(): new () => Penalty {
      return Penalty;
    }
  
    _getDialogComponent(): ComponentType<any> {
      return PenaltyPopupComponent;
    }
  
    _getServiceURL(): string {
      return this.urlService.URLS.PENALTY;
    }
  
  
    openViewDialog(modelId: number): Observable<DialogRef> {
      return this.getByIdComposite(modelId).pipe(
        switchMap((Penalty: Penalty) => {
          return of(this.dialog.show<IDialogData<Penalty>>(this._getDialogComponent(), {
            model: Penalty,
            operation: OperationTypes.VIEW
          }));
        })
      );
    }
    updateStatus(donorId: number, newStatus: CommonStatusEnum) {
      return newStatus === CommonStatusEnum.ACTIVATED ? this._activate(donorId) : this._deactivate(donorId);
    }
  
    private _activate(donorId: number): Observable<any> {
      return this.http.put<any>(this._getServiceURL() + '/' + donorId + '/activate', {});
    }
  
    private _deactivate(donorId: number): Observable<any> {
      return this.http.put<any>(this._getServiceURL() + '/' + donorId + '/de-activate', {});
    }
  }
  