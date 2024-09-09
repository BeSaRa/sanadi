import { ComponentType } from "@angular/cdk/portal";
import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { CastResponse, CastResponseContainer } from "@app/decorators/decorators/cast-response";
import { OperationTypes } from "@app/enums/operation-types.enum";
import { CreateCharityPopupComponent } from "@app/external-charity/popups/create-charity-popup/create-charity-popup.component";
import { CrudWithDialogGenericService } from "@app/generics/crud-with-dialog-generic-service";
import { IDialogData } from "@app/interfaces/i-dialog-data";
import { ExternalCharity } from "@app/models/external-charity";
import { Pagination } from "@app/models/pagination";
import { DialogRef } from "@app/shared/models/dialog-ref";
import { Observable, of, switchMap, tap } from "rxjs";
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
    @CastResponse(undefined, {
      fallback: '$default',
      unwrap: 'rs'
    })
    private _getByCriteria(modelId: number, criteria?: any): Observable<ExternalCharity> {
      return this.http.get<ExternalCharity>(this._getServiceURL() + '/details/' + modelId, {
        params: new HttpParams({
          fromObject: criteria
        })
      });
    }
  
    //{
    //   "includeRequestInfo": false,
    //   "includeAttachment": true,
    //   "includeLogs": false,
    //   "includeAttachmentLog": true,
    //   "includeRequestAttachment": true
    // }
    getByIdComposite(modelId: number): Observable<ExternalCharity> {
      return this._getByCriteria(modelId, {
        "includeRequestInfo": false,
        "includeAttachment": true,
        "includeLogs": true,
        "includeAttachmentLog": true,
        "includeRequestAttachment": true
      })
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
    @CastResponse(undefined, {
      fallback: '$default',
      unwrap: 'rs'
    })
    private _loadByCriteria(filter: Partial<ExternalCharity>): Observable<ExternalCharity[]> {
      return this.http.post<ExternalCharity[]>(this._getServiceURL() + '/filter/criteria', { ...filter });
    }
  
    loadByCriteria(filter: Partial<ExternalCharity>): Observable<ExternalCharity[]> {
      return this._loadByCriteria(filter).pipe(
        tap(result => this.list = result),
        tap(result => this._loadDone$.next(result))
      );
    }
}