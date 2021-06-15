import {BaseModel} from './base-model';
import {AttachmentTypeService} from '../services/attachment-type.service';
import {FactoryService} from '../services/factory.service';

export class AttachmentType extends BaseModel<AttachmentType, AttachmentTypeService> {
  service!: AttachmentTypeService;
  status!: number;
  constructor() {
    super();
    this.service = FactoryService.getService('AttachmentTypeService');
  }
}
