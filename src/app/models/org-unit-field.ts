import { BaseModel } from '@app/models/base-model';
import { OrgUnitFieldService } from '@app/services/org-unit-field.service';
import { FactoryService } from '@app/services/factory.service';
import { LangService } from '@app/services/lang.service';
import { INames } from '@app/interfaces/i-names';
import { InterceptModel } from "@decorators/intercept-model";
import { OrgUnitFieldInterceptor } from "@app/model-interceptors/org-unit-field-interceptor";

const interceptor = new OrgUnitFieldInterceptor()

@InterceptModel({
  send: interceptor.send,
  receive: interceptor.receive
})
export class OrgUnitField extends BaseModel<OrgUnitField, OrgUnitFieldService> {
  service: OrgUnitFieldService;
  langService: LangService;
  status!: number;

  constructor() {
    super();
    this.service = FactoryService.getService('OrgUnitFieldService');
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }
}
