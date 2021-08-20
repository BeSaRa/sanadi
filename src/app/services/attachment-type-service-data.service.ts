import {Injectable} from '@angular/core';
import {BackendGenericService} from '../generics/backend-generic-service';
import {AttachmentTypeServiceData} from '../models/attachment-type-service-data';
import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {AttachmentTypeServiceDataInterceptor} from '../model-interceptors/attachment-type-service-data-interceptor';
import {HttpClient} from '@angular/common/http';
import {UrlService} from './url.service';
import {DialogService} from './dialog.service';
import {FactoryService} from './factory.service';
import {DialogRef} from '../shared/models/dialog-ref';
import {IDialogData} from '../interfaces/i-dialog-data';
import {AttachmentTypeServiceDataPopupComponent} from '../administration/popups/attachment-type-service-data-popup/attachment-type-service-data-popup.component';
import {OperationTypes} from '../enums/operation-types.enum';
import {Observable, of} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
import {Generator} from '../decorators/generator';
import {InterceptParam, SendInterceptor} from '../decorators/model-interceptor';
import {CustomProperty} from '../models/custom-property';
import {IDefaultResponse} from '../interfaces/idefault-response';

@Injectable({
  providedIn: 'root'
})
export class AttachmentTypeServiceDataService extends BackendGenericService<AttachmentTypeServiceData> {
  list!: AttachmentTypeServiceData[];
  interceptor: IModelInterceptor<AttachmentTypeServiceData> = new AttachmentTypeServiceDataInterceptor();

  constructor(public http: HttpClient,
              private urlService: UrlService,
              private dialogService: DialogService) {
    super();
    FactoryService.registerService('AttachmentTypeServiceDataService', this);
  }

  _getModel(): any {
    return AttachmentTypeServiceData;
  }

  _getReceiveInterceptor(): any {
    return this.interceptor.receive;
  }

  _getSendInterceptor(): any {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.ATTACHMENT_TYPES_SERVICE_DATA;
  }

  _getCustomPropertiesURL(): string {
    return this.urlService.URLS.ATTACHMENT_TYPES_CUSTOM_PROPERTIES;
  }

  openCreateServiceDialog(attachmentTypeId: number): DialogRef {
    return this.dialogService.show<IDialogData<AttachmentTypeServiceData>>(AttachmentTypeServiceDataPopupComponent, {
      model: new AttachmentTypeServiceData(),
      operation: OperationTypes.CREATE,
      attachmentTypeId: attachmentTypeId
    });
  }

  openUpdateServiceDialog(modelId: number, attachmentTypeId: number): Observable<DialogRef> {
    return this.getById(modelId).pipe(
      switchMap((attachmentTypeServiceData: AttachmentTypeServiceData) => {
        return of(this.dialogService.show<IDialogData<AttachmentTypeServiceData>>(AttachmentTypeServiceDataPopupComponent, {
          model: attachmentTypeServiceData,
          operation: OperationTypes.UPDATE,
          attachmentTypeId: attachmentTypeId
        }));
      })
    );
  }

  @Generator(undefined, true, {property: 'rs'})
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

  @SendInterceptor()
  @Generator(undefined, false, {property: 'rs'})
  create(@InterceptParam() model: AttachmentTypeServiceData): Observable<AttachmentTypeServiceData> {
    return this.http.post<AttachmentTypeServiceData>(this._getServiceURL(), model);
  }

  @SendInterceptor()
  @Generator(undefined, false, {property: 'rs'})
  update(@InterceptParam() model: AttachmentTypeServiceData): Observable<AttachmentTypeServiceData> {
    return this.http.put<AttachmentTypeServiceData>(this._getServiceURL(), model);
  }


  getCustomProperties(caseType: number): Observable<CustomProperty[]> {
    return this.http.get<IDefaultResponse<CustomProperty[]>>(this._getCustomPropertiesURL() + '/' + caseType)
      .pipe(map(response => response.rs.map(item => (new CustomProperty()).clone({...item}))));
  }
}
