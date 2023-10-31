// const interceptor: SectorInterceptor = new SectorInterceptor()

import { InterceptModel } from "@app/decorators/decorators/intercept-model";
import { CommonStatusEnum } from "@app/enums/common-status.enum";
import { normalSearchFields } from "@app/helpers/normal-search-fields";
import { INames } from "@app/interfaces/i-names";
import { SectorInterceptor } from "@app/model-interceptors/sector-interceptor";
import { FactoryService } from "@app/services/factory.service";
import { LangService } from "@app/services/lang.service";
import { SectorService } from "@app/services/sector.service";
import { ISearchFieldsMap } from "@app/types/types";
import { CustomValidators } from "@app/validators/custom-validators";
import { AdminResult } from "./admin-result";
import { BaseModel } from "./base-model";

const interceptor: SectorInterceptor = new SectorInterceptor()

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})
export class Sector extends BaseModel<Sector, SectorService>{
  id!: number;
  arName!: string;
  enName!: string;
  status: number = CommonStatusEnum.ACTIVATED;
  departmentId!: number;

  // extra properties
  service!: SectorService;
  langService!: LangService;
  statusInfo!: AdminResult;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
    this.service = FactoryService.getService('SectorService')
  }

  searchFields: ISearchFieldsMap<Sector> = {
    ...normalSearchFields(['arName', 'enName']),
  };

  buildForm(controls?: boolean): any {
    const {
      arName,
      enName,
    } = this;
    return {
      arName: controls ? [arName, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('AR_NUM_ONE_AR')
      ]] : arName,
      enName: controls ? [enName, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('ENG_NUM_ONE_ENG')
      ]] : enName,
    }
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }


}

