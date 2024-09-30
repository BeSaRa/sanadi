import { ComponentType } from "@angular/cdk/portal";
import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { CastResponseContainer } from "@app/decorators/decorators/cast-response";
import { OperationTypes } from "@app/enums/operation-types.enum";
import { CrudWithDialogGenericService } from "@app/generics/crud-with-dialog-generic-service";
import { IDialogData } from "@app/interfaces/i-dialog-data";
import { Pagination } from "@app/models/pagination";
import { LegalBasis } from "@app/models/legal-basis";
import { DialogRef } from "@app/shared/models/dialog-ref";
import { Observable, switchMap, of } from "rxjs";
import { DialogService } from "./dialog.service";
import { FactoryService } from "./factory.service";
import { UrlService } from "./url.service";
import { LegalBasisPopupComponent } from "@app/administration/popups/legal-basis-popup/legal-basis-popup.component";
import { CommonStatusEnum } from "@app/enums/common-status.enum";

@CastResponseContainer({
    $default: {
      model: () => LegalBasis
    },
    $pagination: {
      model: () => Pagination,
      shape: { 'rs.*': () => LegalBasis }
    }
  })
  @Injectable({
    providedIn: 'root'
  })
  export class LegalBasisService extends CrudWithDialogGenericService<LegalBasis> {
    list: LegalBasis[] = [];
    http = inject(HttpClient);
    urlService = inject(UrlService);
    dialog = inject(DialogService);
  
    constructor() {
      super();
      FactoryService.registerService('LegalBasisService', this);
    }
  
    _getModel(): new () => LegalBasis {
      return LegalBasis;
    }
  
    _getDialogComponent(): ComponentType<any> {
      return LegalBasisPopupComponent;
    }
  
    _getServiceURL(): string {
      return this.urlService.URLS.LEGAL_BASIS;
    }
  
  
    openViewDialog(modelId: number): Observable<DialogRef> {
      return this.getByIdComposite(modelId).pipe(
        switchMap((LegalBasis: LegalBasis) => {
          return of(this.dialog.show<IDialogData<LegalBasis>>(this._getDialogComponent(), {
            model: LegalBasis,
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
  