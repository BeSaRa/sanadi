import { InterceptModel } from "@app/decorators/decorators/intercept-model";
import { InspectionOperationInterceptor } from "@app/model-interceptors/inspection-operation-interceptor";
import { BaseModel } from "./base-model";
import { infoSearchFields } from "@app/helpers/info-search-fields";
import { normalSearchFields } from "@app/helpers/normal-search-fields";
import { INames } from "@app/interfaces/i-names";
import { FactoryService } from "@app/services/factory.service";
import { LangService } from "@app/services/lang.service";
import { ISearchFieldsMap } from "@app/types/types";
import { CustomValidators } from "@app/validators/custom-validators";
import { AdminResult } from "./admin-result";
import { InspectionOperationService } from "@app/services/inspection-operation.service";
import { VerificationTemplate } from "./verification-template";
import { Language } from "./language";

const interceptor: InspectionOperationInterceptor = new InspectionOperationInterceptor()

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})
export class InspectionOperation extends BaseModel<InspectionOperation, InspectionOperationService>{
  id!: number;
  arName!: string;
  egName!: string;
  departmentId!: number;
  parentId!: number|null;
  clientData!: string;

  departmentInfo!: AdminResult;
  parentInfo!: AdminResult;
  verificationListTemplate: VerificationTemplate[] = [];

  // extra properties
  service!: InspectionOperationService;
  langService!: LangService;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
    this.service = FactoryService.getService('InspectionOperationService')
  }

  searchFields: ISearchFieldsMap<InspectionOperation> = {
    ...normalSearchFields(['arName', 'enName']),
    ...infoSearchFields(['departmentInfo'])
  };

  buildForm(controls?: boolean): any {
    const {
      arName,
      egName,
      departmentId,
      parentId,
      verificationListTemplate
    } = this;
    return {
      arName: controls ? [arName, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('AR_NUM_ONE_AR')
      ]] : arName,
      egName: controls ? [egName, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('ENG_NUM_ONE_ENG')
      ]] : egName,
      departmentId: controls ? [departmentId, [CustomValidators.required]] : departmentId,
      parentId: controls ? [parentId, []] : parentId,
      verificationListTemplate:controls?[verificationListTemplate,[]]:verificationListTemplate
    }
  }


  getName(): string {
    return this.langService.map.lang === 'ar' ? this.arName : this.egName;
  }
}
