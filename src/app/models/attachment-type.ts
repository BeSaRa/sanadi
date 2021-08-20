import {BaseModel} from './base-model';
import {AttachmentTypeService} from '../services/attachment-type.service';
import {FactoryService} from '../services/factory.service';
import {INames} from '../interfaces/i-names';
import {LangService} from '../services/lang.service';

export class AttachmentType extends BaseModel<AttachmentType, AttachmentTypeService> {
  service!: AttachmentTypeService;
  langService: LangService;
  status!: number;
  global: boolean = false;
  constructor() {
    super();
    this.service = FactoryService.getService('AttachmentTypeService');
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }
}
