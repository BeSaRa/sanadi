import { ComponentType } from "@angular/cdk/portal";
import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { CastResponseContainer } from "@app/decorators/decorators/cast-response";
import { OperationTypes } from "@app/enums/operation-types.enum";
import { CrudWithDialogGenericService } from "@app/generics/crud-with-dialog-generic-service";
import { IDialogData } from "@app/interfaces/i-dialog-data";
import { Pagination } from "@app/models/pagination";
import { DialogRef } from "@app/shared/models/dialog-ref";
import { Observable, switchMap, of } from "rxjs";
import { DialogService } from "./dialog.service";
import { FactoryService } from "./factory.service";
import { UrlService } from "./url.service";
import { LegalAction } from "@app/models/legal-action";
import { LegalActionPopupComponent } from "@app/administration/popups/legal-action-popup/legal-action-popup.component";
import { CommonStatusEnum } from "@app/enums/common-status.enum";

@CastResponseContainer({
    $default: {
      model: () => LegalAction
    },
    $pagination: {
      model: () => Pagination,
      shape: { 'rs.*': () => LegalAction }
    }
  })
  @Injectable({
    providedIn: 'root'
  })
  export class LegalActionService extends CrudWithDialogGenericService<LegalAction> {
    list: LegalAction[] = [];
    http = inject(HttpClient);
    urlService = inject(UrlService);
    dialog = inject(DialogService);
  
    constructor() {
      super();
      FactoryService.registerService('LegalActionService', this);
    }
  
    _getModel(): new () => LegalAction {
      return LegalAction;
    }
  
    _getDialogComponent(): ComponentType<any> {
      return LegalActionPopupComponent;
    }
  
    _getServiceURL(): string {
      return this.urlService.URLS.LEGAL_ACTION;
    }
  
  
    openViewDialog(modelId: number): Observable<DialogRef> {
      return this.getByIdComposite(modelId).pipe(
        switchMap((LegalAction: LegalAction) => {
          return of(this.dialog.show<IDialogData<LegalAction>>(this._getDialogComponent(), {
            model: LegalAction,
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
  