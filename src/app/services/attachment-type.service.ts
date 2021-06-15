import { Injectable } from '@angular/core';
import {BackendGenericService} from '../generics/backend-generic-service';
import {AttachmentType} from '../models/attachment-type';
import {HttpClient} from '@angular/common/http';
import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {AttachmentTypeInterceptor} from '../model-interceptors/attachment-type-interceptor';
import {UrlService} from './url.service';
import {FactoryService} from './factory.service';

@Injectable({
  providedIn: 'root'
})
export class AttachmentTypeService extends BackendGenericService<AttachmentType> {
  list!: AttachmentType[];
  interceptor: IModelInterceptor<AttachmentType> = new AttachmentTypeInterceptor();

  constructor(public http: HttpClient,
              private urlService: UrlService) {
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
}
