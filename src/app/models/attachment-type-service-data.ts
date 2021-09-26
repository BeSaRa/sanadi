import {BaseModel} from './base-model';
import {LangService} from '../services/lang.service';
import {FactoryService} from '../services/factory.service';
import {AttachmentTypeServiceDataService} from '../services/attachment-type-service-data.service';
import {AdminResult} from "@app/models/admin-result";

export class AttachmentTypeServiceData extends BaseModel<AttachmentTypeServiceData, AttachmentTypeServiceDataService> {
  service!: AttachmentTypeServiceDataService;
  langService: LangService;
  attachmentTypeId!: number;
  isRequired: boolean = false;
  serviceId!: number;
  userType!: number;
  customProperties: string = '';
  serviceInfo!: AdminResult;

  constructor() {
    super();
    this.service = FactoryService.getService('AttachmentTypeServiceDataService');
    this.langService = FactoryService.getService('LangService');
  }
}
