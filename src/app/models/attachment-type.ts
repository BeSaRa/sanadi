import {BaseModel} from './base-model';
import {AttachmentTypeService} from '../services/attachment-type.service';
import {FactoryService} from '../services/factory.service';
import {INames} from '../interfaces/i-names';
import {LangService} from '../services/lang.service';
import {Lookup} from './lookup';
import {FileNetDocument} from "@app/models/file-net-document";
import {AdminResult} from "@app/models/admin-result";

export class AttachmentType extends BaseModel<AttachmentType, AttachmentTypeService> {
  service!: AttachmentTypeService;
  langService: LangService;
  status!: number;
  global: boolean = false;
  arDesc!: string
  enDesc!: string
  statusInfo!: Lookup

  constructor() {
    super();
    this.service = FactoryService.getService('AttachmentTypeService');
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  convertToAttachment(): FileNetDocument {
    return new FileNetDocument().clone({
      documentTitle: this.getName(),
      attachmentTypeId: this.id,
      description: this.arDesc,
      attachmentTypeInfo: AdminResult.createInstance({
        arName: this.arName,
        enName: this.enName,
        id: this.id
      })
    });
  }
}
