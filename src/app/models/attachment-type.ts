import { BaseModel } from './base-model';
import { AttachmentTypeService } from '@services/attachment-type.service';
import { FactoryService } from '@services/factory.service';
import { INames } from '@contracts/i-names';
import { LangService } from '@services/lang.service';
import { Lookup } from './lookup';
import { FileNetDocument } from '@app/models/file-net-document';
import { AdminResult } from '@app/models/admin-result';
import { searchFunctionType } from '@app/types/types';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { AttachmentTypeInterceptor } from "@app/model-interceptors/attachment-type-interceptor";
import { InterceptModel } from "@decorators/intercept-model";

const interceptor = new AttachmentTypeInterceptor();

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})
export class AttachmentType extends BaseModel<AttachmentType, AttachmentTypeService> {
  service!: AttachmentTypeService;
  langService: LangService;
  status: boolean | number = true;
  global: boolean = false;
  arDesc!: string;
  enDesc!: string;
  statusInfo!: Lookup;

  searchFields: { [key: string]: searchFunctionType | string } = {
    arName: 'arName',
    enName: 'enName',
    status: text => !this.statusInfo ? false : this.statusInfo.getName().toLowerCase().indexOf(text) !== -1,
  };

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
      }),
      attachmentTypeStatus: this.isActive()
    });
  }

  isActive(): boolean {
    if (typeof this.status === 'number') {
      return this.status === CommonStatusEnum.ACTIVATED;
    }
    return this.status;
  }
}
