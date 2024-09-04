import { ComponentType } from "@angular/cdk/portal";
import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { CastResponseContainer } from "@app/decorators/decorators/cast-response";
import { OperationTypes } from "@app/enums/operation-types.enum";
import { CreateCharityPopupComponent } from "@app/external-charity/popups/create-charity-popup/create-charity-popup.component";
import { CrudWithDialogGenericService } from "@app/generics/crud-with-dialog-generic-service";
import { IDialogData } from "@app/interfaces/i-dialog-data";
import { ExternalCharity } from "@app/models/external-charity";
import { Pagination } from "@app/models/pagination";
import { DialogRef } from "@app/shared/models/dialog-ref";
import { Observable, of, switchMap } from "rxjs";
import { DialogService } from "./dialog.service";
import { DocumentService } from "./document.service";
import { FactoryService } from "./factory.service";
import { UrlService } from "./url.service";

@CastResponseContainer({
    $default: {
      model: () => ExternalCharity
    },
    $pagination: {
      model: () => Pagination,
      shape: { 'rs.*': () => ExternalCharity }
    }
  })
@Injectable({
    providedIn: 'root'
})
export class ExternalCharityService extends CrudWithDialogGenericService<ExternalCharity> {
    _getDialogComponent(): ComponentType<any> {
        return CreateCharityPopupComponent;
    }
    _getModel() {
        return ExternalCharity;
    }
    list: ExternalCharity[] = [];
    http: HttpClient = inject(HttpClient);
    urlService: UrlService = inject(UrlService);
    dialog: DialogService = inject(DialogService);
    

    _getServiceURL(): string {
        return this.urlService.URLS.EXTERNAL_CHARITY_REQUEST;
    }

    constructor() {
        super();
        FactoryService.registerService('ExternalCharityService', this);
    }
    openViewDialog(modelId: number): Observable<DialogRef> {
        return this.getByIdComposite(modelId).pipe(
          switchMap((model: ExternalCharity) => {
            return of(this.dialog.show<IDialogData<ExternalCharity>>(CreateCharityPopupComponent, {
              model: model,
              operation: OperationTypes.VIEW
            }));
          })
        );
      }
      updateStatus(model:{requestId:number,statusId:number,comments:string}) {
        return this.http.put(this._getServiceURL() + '/status', model);
    }
}