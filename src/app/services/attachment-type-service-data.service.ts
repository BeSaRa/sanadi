import { Injectable } from '@angular/core';
import { AttachmentTypeServiceData } from '../models/attachment-type-service-data';
import { HttpClient } from '@angular/common/http';
import { UrlService } from './url.service';
import { DialogService } from './dialog.service';
import { FactoryService } from './factory.service';
import { DialogRef } from '../shared/models/dialog-ref';
import { IDialogData } from '@contracts/i-dialog-data';
import {
  AttachmentTypeServiceDataPopupComponent
} from '../administration/popups/attachment-type-service-data-popup/attachment-type-service-data-popup.component';
import { OperationTypes } from '../enums/operation-types.enum';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { CustomProperty } from '../models/custom-property';
import { IDefaultResponse } from '@contracts/idefault-response';
import { CrudGenericService } from "@app/generics/crud-generic-service";
import { Pagination } from "@app/models/pagination";
import { CastResponse, CastResponseContainer } from "@decorators/cast-response";
import { HasInterception, InterceptParam } from "@decorators/intercept-model";

@CastResponseContainer({
  $default: {
    model: () => AttachmentTypeServiceData
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => AttachmentTypeServiceData }
  }
})
@Injectable({
  providedIn: 'root'
})
export class AttachmentTypeServiceDataService extends CrudGenericService<AttachmentTypeServiceData> {
  list!: AttachmentTypeServiceData[];
  attachmentTypes: Record<number, {
    time: number; list: AttachmentTypeServiceData[]
  }> = {}


  constructor(public http: HttpClient,
              private urlService: UrlService,
              private dialogService: DialogService) {
    super();
    FactoryService.registerService('AttachmentTypeServiceDataService', this);
  }

  _getModel(): any {
    return AttachmentTypeServiceData;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.ATTACHMENT_TYPES_SERVICE_DATA;
  }

  _getCustomPropertiesURL(): string {
    return this.urlService.URLS.ATTACHMENT_TYPES_CUSTOM_PROPERTIES;
  }

  openCreateServiceDialog(attachmentTypeId: number, list: AttachmentTypeServiceData[]): DialogRef {
    return this.dialogService.show<IDialogData<AttachmentTypeServiceData>>(AttachmentTypeServiceDataPopupComponent, {
      model: new AttachmentTypeServiceData().clone({
        attachmentTypeId: attachmentTypeId
      }),
      operation: OperationTypes.CREATE,
      existingList: list
    });
  }

  openUpdateServiceDialog(attachmentTypeServiceDataId: number, list: AttachmentTypeServiceData[]): Observable<DialogRef> {
    return this.getById(attachmentTypeServiceDataId).pipe(
      switchMap((attachmentTypeServiceData: AttachmentTypeServiceData) => {
        return of(this.dialogService.show<IDialogData<AttachmentTypeServiceData>>(AttachmentTypeServiceDataPopupComponent, {
          model: attachmentTypeServiceData,
          operation: OperationTypes.UPDATE,
          existingList: list
        }));
      })
    );
  }

  openViewServiceDialog(attachmentTypeServiceDataId: number, list: AttachmentTypeServiceData[]): Observable<DialogRef> {
    return this.getById(attachmentTypeServiceDataId).pipe(
      switchMap((attachmentTypeServiceData: AttachmentTypeServiceData) => {
        return of(this.dialogService.show<IDialogData<AttachmentTypeServiceData>>(AttachmentTypeServiceDataPopupComponent, {
          model: attachmentTypeServiceData,
          operation: OperationTypes.VIEW,
          existingList: list
        }));
      })
    );
  }

  @CastResponse(undefined)
  private _loadServicesByAttachmentTypeId(attachmentTypeId: number): Observable<AttachmentTypeServiceData[]> {
    return this.http.get<AttachmentTypeServiceData[]>(this._getServiceURL() + 's/' + attachmentTypeId);
  }

  loadServicesByAttachmentTypeId(attachmentTypeId: number): Observable<AttachmentTypeServiceData[]> {
    return this._loadServicesByAttachmentTypeId(attachmentTypeId)
      .pipe(
        tap(result => this.list = result),
        tap(result => this._loadDone$.next(result))
      );
  }

  @HasInterception
  @CastResponse(undefined)
  create(@InterceptParam() model: AttachmentTypeServiceData): Observable<AttachmentTypeServiceData> {
    return this.http.post<AttachmentTypeServiceData>(this._getServiceURL(), model);
  }

  @HasInterception
  @CastResponse(undefined)
  update(@InterceptParam() model: AttachmentTypeServiceData): Observable<AttachmentTypeServiceData> {
    return this.http.put<AttachmentTypeServiceData>(this._getServiceURL(), model);
  }

  getCustomProperties(caseType: number): Observable<CustomProperty[]> {
    return this.http.get<IDefaultResponse<CustomProperty[]>>(this._getCustomPropertiesURL() + '/' + caseType)
      .pipe(map(response => response.rs.map(item => (new CustomProperty()).clone({ ...item }))));
  }

  makeGlobal(attachmentTypeId: number): Observable<boolean> {
    return this.http.put<{ sc: number, rs: boolean }>(this._getServiceURL() + '/global/' + attachmentTypeId, attachmentTypeId)
      .pipe(map(response => response.rs));
  }

  @CastResponse(undefined)
  private _loadByCaseType(caseType: number): Observable<AttachmentTypeServiceData[]> {
    return this.http.get<AttachmentTypeServiceData[]>(this.urlService.URLS.ATTACHMENT_TYPES + '/attachment-service/case-type/' + caseType)
  }

  loadByCaseType(caseType: number): Observable<AttachmentTypeServiceData[]> {
    return this._loadByCaseType(caseType).pipe(tap(list => {
      if (!this.attachmentTypes[caseType]) {
        this.attachmentTypes[caseType] = { time: 0, list: [] }
      }
      this.attachmentTypes[caseType].list = list;
      this.attachmentTypes[caseType].time = Date.now();
    }));
  }

  // private passedReloadDuration(caseType: number): boolean {
  //   return ((Date.now() - this.attachmentTypes[caseType].time) > (5 * 60 * 1000))
  // }

  getByCaseType(caseType: number): Observable<AttachmentTypeServiceData[]> {
    return this.loadByCaseType(caseType)
  }
}
