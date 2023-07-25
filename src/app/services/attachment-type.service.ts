import { of } from 'rxjs';
import { OperationTypes } from './../enums/operation-types.enum';
import { IDialogData } from './../interfaces/i-dialog-data';
import { DialogRef } from './../shared/models/dialog-ref';
import { switchMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { AttachmentType } from '../models/attachment-type';
import { HttpClient } from '@angular/common/http';
import { UrlService } from './url.service';
import { FactoryService } from './factory.service';
import { DialogService } from './dialog.service';
import {
  AttachmentTypesPopupComponent
} from '../administration/popups/attachment-types-popup/attachment-types-popup.component';
import { Observable } from 'rxjs';
import { AttachmentTypeServiceDataService } from '@app/services/attachment-type-service-data.service';
import { AttachmentTypeServiceData } from '@app/models/attachment-type-service-data';
import { ComponentType } from '@angular/cdk/portal';
import { CrudWithDialogGenericService } from "@app/generics/crud-with-dialog-generic-service";
import { CastResponse, CastResponseContainer } from "@decorators/cast-response";
import { Pagination } from "@app/models/pagination";
import { AttachmentsComponent } from "@app/shared/components/attachments/attachments.component";
import { CommonStatusEnum } from '@app/enums/common-status.enum';

@CastResponseContainer({
  $default: {
    model: () => AttachmentType
  },
  $pagination: {
    model: () => Pagination,
    shape: { 'rs.*': () => AttachmentType }
  }
})
@Injectable({
  providedIn: 'root'
})
export class AttachmentTypeService extends CrudWithDialogGenericService<AttachmentType> {
  list!: AttachmentType[];
  attachmentsComponent!: AttachmentsComponent

  constructor(public http: HttpClient,
              private urlService: UrlService,
              private attachmentTypeServiceDataService: AttachmentTypeServiceDataService,
              public dialog: DialogService) {
    super();
    FactoryService.registerService('AttachmentTypeService', this);
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
  _getDialogComponent(): ComponentType<any> {
    return AttachmentTypesPopupComponent;
  }

  _getModel(): any {
    return AttachmentType;
  }

  _getServiceURL(): string {
    return this.urlService.URLS.ATTACHMENT_TYPES;
  }

  @CastResponse(undefined, {
    fallback: '$default',
    unwrap: 'rs'
  })
  private _loadByServiceId(serviceId: number): Observable<AttachmentType[]> {
    return this.http.get<AttachmentType[]>(this._getServiceURL() + '/attachment-types/' + serviceId);
  }

  openViewDialog(modelId: number): Observable<DialogRef> {
    return this.getByIdComposite(modelId).pipe(
      switchMap((serviceData: AttachmentType) => {
        return of(this.dialog.show<IDialogData<AttachmentType>>(AttachmentTypesPopupComponent, {
          model: serviceData,
          operation: OperationTypes.VIEW
        }));
      })
    );
  }
  loadByServiceId(serviceId: number): Observable<AttachmentType[]> {
    return this._loadByServiceId(serviceId);
  }

  loadTypesByCaseType(caseId: number): Observable<AttachmentTypeServiceData[]> {
    return this.attachmentTypeServiceDataService.getByCaseType(caseId);
  }
}
