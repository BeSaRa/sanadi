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


  constructor(public http: HttpClient,
              private urlService: UrlService,
              private attachmentTypeServiceDataService: AttachmentTypeServiceDataService,
              public dialog: DialogService) {
    super();
    FactoryService.registerService('AttachmentTypeService', this);
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

  loadByServiceId(serviceId: number): Observable<AttachmentType[]> {
    return this._loadByServiceId(serviceId);
  }

  loadTypesByCaseType(caseId: number): Observable<AttachmentTypeServiceData[]> {
    return this.attachmentTypeServiceDataService.getByCaseType(caseId);
  }
}
