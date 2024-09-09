import { ComponentType } from "@angular/cdk/portal";
import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { PaginationContract } from "@app/contracts/pagination-contract";
import { CastResponse, CastResponseContainer } from "@app/decorators/decorators/cast-response";
import { OperationTypes } from "@app/enums/operation-types.enum";
import { UpdateCharityPopupComponent } from "@app/external-charity/popups/update-charity-popup/update-charity-popup.component";
import { CrudWithDialogGenericService } from "@app/generics/crud-with-dialog-generic-service";
import { IDialogData } from "@app/interfaces/i-dialog-data";
import { ConvertExternalCharity } from "@app/models/convert-external-charity";
import { Pagination } from "@app/models/pagination";
import { DialogRef } from "@app/shared/models/dialog-ref";
import { Observable, of, switchMap, tap } from "rxjs";
import { DialogService } from "./dialog.service";
import { EmployeeService } from "./employee.service";
import { FactoryService } from "./factory.service";
import { UrlService } from "./url.service";

@CastResponseContainer({
  $default: {
    model: () => ConvertExternalCharity
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => ConvertExternalCharity }
  }
})
@Injectable({
  providedIn: 'root'
})
export class ConvertExternalCharityService extends CrudWithDialogGenericService<ConvertExternalCharity> {
  _getDialogComponent(): ComponentType<any> {
    return UpdateCharityPopupComponent;
  }
  _getModel() {
    return ConvertExternalCharity;
  }
  list: ConvertExternalCharity[] = [];
  http: HttpClient = inject(HttpClient);
  urlService: UrlService = inject(UrlService);
  dialog: DialogService = inject(DialogService);


  employeeService = inject(EmployeeService);
  _getServiceURL(): string {
    return this.urlService.URLS.EXTERNAL_CHARITY_ADJUST;
  }

  constructor() {
    super();
    FactoryService.registerService('ConvertExternalCharityService', this);
  }
  openViewDialog(modelId: number): Observable<DialogRef> {
    return this.getByIdComposite(modelId).pipe(
      switchMap((model: ConvertExternalCharity) => {
        return of(this.dialog.show<IDialogData<ConvertExternalCharity>>(UpdateCharityPopupComponent, {
          model: model,
          operation: OperationTypes.VIEW
        }));
      })
    );
  }

  updateStatus(model: { requestId: number, statusId: number, comments: string }) {
    return this.http.put(this._getServiceURL() + '/status', model);
  }

  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  private _getByCriteria(modelId: number, criteria?: any): Observable<ConvertExternalCharity> {
    return this.http.get<ConvertExternalCharity>(this._getServiceURL() + '/details/' + modelId, {
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
  getByIdComposite(modelId: number): Observable<ConvertExternalCharity> {
    return this._getByCriteria(modelId, {
      "includeRequestInfo": false,
      "includeAttachment": true,
      "includeLogs": true,
      "includeAttachmentLog": true,
      "includeRequestAttachment": true
    })
  }
  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  private _loadByCriteria(filter: Partial<ConvertExternalCharity>): Observable<ConvertExternalCharity[]> {
    return this.http.post<ConvertExternalCharity[]>(this._getServiceURL() + '/filter/criteria', { ...filter });
  }

  loadByCriteria(filter: Partial<ConvertExternalCharity>): Observable<ConvertExternalCharity[]> {
    return this._loadByCriteria(filter).pipe(
      tap(result => this.list = result),
      tap(result => this._loadDone$.next(result))
    );
  }
  @CastResponse(undefined, {
    fallback: '$pagination'
  })
  private _pagination(options: Partial<PaginationContract>): Observable<Pagination<ConvertExternalCharity[]>> {
    return this.http.get<Pagination<ConvertExternalCharity[]>>(this._getServiceURL() + '/composite/pg', {
      params: { ...options }
    })
  }
  paginateComposite(options: Partial<PaginationContract>): Observable<Pagination<ConvertExternalCharity[]>> {
    return this._getPaginationEndpoint(options).pipe(
      tap(result => this.list = result.rs),
      tap(result => this._loadDone$.next(result.rs))
    );
  }

  @CastResponse(undefined, {
    fallback: '$pagination'
  })
  private _getPaginationEndpoint(options: Partial<PaginationContract>) {
    return this.employeeService.isInternalUser() ?
      this.http.get<Pagination<ConvertExternalCharity[]>>(this._getServiceURL() + '/composite/pg', {
        params: { ...options }
      }) :

      this.http.post<Pagination<ConvertExternalCharity[]>>(this._getServiceURL() + '/filter/criteria/pg',
        { externalUserId: this.employeeService.getCurrentUser().id }, {
        params: { ...options }
      })
  }


}