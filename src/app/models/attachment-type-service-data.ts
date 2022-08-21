import { BaseModel } from './base-model';
import { LangService } from '@services/lang.service';
import { FactoryService } from '@services/factory.service';
import { AttachmentTypeServiceDataService } from '@services/attachment-type-service-data.service';
import { AdminResult } from "@app/models/admin-result";
import { AttachmentType } from "@app/models/attachment-type";
import { FileNetDocument } from "@app/models/file-net-document";
import { AttachmentTypeServiceDataInterceptor } from "@app/model-interceptors/attachment-type-service-data-interceptor";
import { InterceptModel } from "@decorators/intercept-model";


const { send, receive } = new AttachmentTypeServiceDataInterceptor();

@InterceptModel({ send, receive })
export class AttachmentTypeServiceData extends BaseModel<AttachmentTypeServiceData, AttachmentTypeServiceDataService> {
  service!: AttachmentTypeServiceDataService;
  langService: LangService;
  attachmentTypeId!: number;
  isRequired: boolean = false;
  serviceId!: number;
  userType!: number;
  customProperties: string = '';
  caseType!: number;
  serviceInfo!: AdminResult;
  attachmentTypeInfo!: AttachmentType;
  multi: boolean = false;
  identifier: string = ''

  constructor() {
    super();
    this.service = FactoryService.getService('AttachmentTypeServiceDataService');
    this.langService = FactoryService.getService('LangService');
  }

  convertToAttachment(): FileNetDocument {
    let attachment = this.attachmentTypeInfo.convertToAttachment();
    attachment.required = this.isRequired;
    return attachment;
  }
}
