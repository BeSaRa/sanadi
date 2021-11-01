import {Injectable} from '@angular/core';
import {BackendGenericService} from '../generics/backend-generic-service';
import {AttachmentType} from '../models/attachment-type';
import {HttpClient} from '@angular/common/http';
import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {AttachmentTypeInterceptor} from '../model-interceptors/attachment-type-interceptor';
import {UrlService} from './url.service';
import {FactoryService} from './factory.service';
import {DialogRef} from '../shared/models/dialog-ref';
import {IDialogData} from '../interfaces/i-dialog-data';
import {OperationTypes} from '../enums/operation-types.enum';
import {DialogService} from './dialog.service';
import {AttachmentTypesPopupComponent} from '../administration/popups/attachment-types-popup/attachment-types-popup.component';
import {Observable, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {Generator} from "@app/decorators/generator";

@Injectable({
  providedIn: 'root'
})
export class AttachmentTypeService extends BackendGenericService<AttachmentType> {
  list!: AttachmentType[];
  interceptor: IModelInterceptor<AttachmentType> = new AttachmentTypeInterceptor();

  constructor(public http: HttpClient,
              private urlService: UrlService,
              private dialogService: DialogService) {
    super();
    FactoryService.registerService('AttachmentTypeService', this);
  }

  _getModel(): any {
    return AttachmentType;
  }

  _getReceiveInterceptor(): any {
    return this.interceptor.receive;
  }

  _getSendInterceptor(): any {
    return this.interceptor.send;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.ATTACHMENT_TYPES;
  }

  @Generator(undefined, true)
  private _loadTypesByCaseType(caseId: number): Observable<AttachmentType[]> {
    return this.http.get<AttachmentType[]>(this.urlService.URLS.ATTACHMENT_TYPES + '/service/' + caseId);
  }

  loadTypesByCaseType(caseId: number): Observable<AttachmentType[]> {
    return this._loadTypesByCaseType(caseId);
  }

  openCreateDialog(): DialogRef {
    return this.dialogService.show<IDialogData<AttachmentType>>(AttachmentTypesPopupComponent, {
      model: new AttachmentType(),
      operation: OperationTypes.CREATE
    });
  }

  openUpdateDialog(modelId: number): Observable<DialogRef> {
    return this.getById(modelId).pipe(
      switchMap((attachmentType: AttachmentType) => {
        return of(this.dialogService.show<IDialogData<AttachmentType>>(AttachmentTypesPopupComponent, {
          model: attachmentType,
          operation: OperationTypes.UPDATE
        }));
      })
    );
  }
}
