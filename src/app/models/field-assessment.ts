import { BaseModel } from '@app/models/base-model';
import { FieldAssessmentService } from '@services/field-assessment.service';
import { FactoryService } from '@services/factory.service';
import { LangService } from '@services/lang.service';
import { INames } from '@contracts/i-names';
import { AdminResult } from '@app/models/admin-result';
import { ISearchFieldsMap } from '@app/types/types';
import { normalSearchFields } from '@helpers/normal-search-fields';
import { infoSearchFields } from '@helpers/info-search-fields';
import { CustomValidators } from '@app/validators/custom-validators';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { InterceptModel } from "@decorators/intercept-model";
import { FieldAssessmentInterceptor } from "@app/model-interceptors/field-assessment-interceptor";

const interceptor = new FieldAssessmentInterceptor();

@InterceptModel({
  send: interceptor.send,
  receive: interceptor.receive
})
export class FieldAssessment extends BaseModel<FieldAssessment, FieldAssessmentService> {
  status: number = CommonStatusEnum.ACTIVATED;
  statusDateModified!: string;
  type!: number;
  statusInfo!: AdminResult;
  typeInfo!: AdminResult;

  // extra properties
  service: FieldAssessmentService;
  langService: LangService;
  statusDateModifiedString!: string;

  searchFields: ISearchFieldsMap<FieldAssessment> = {
    ...normalSearchFields(['arName', 'enName', 'statusDateModifiedString']),
    ...infoSearchFields(['typeInfo', 'statusInfo'])
  };

  constructor() {
    super();
    this.service = FactoryService.getService('FieldAssessmentService');
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  convertToAdminResult(): AdminResult {
    return AdminResult.createInstance({ arName: this.arName, enName: this.enName, id: this.id, status: this.status, disabled: !this.isActive() });
  }

  isActive(): boolean {
    return Number(this.status) === CommonStatusEnum.ACTIVATED;
  }

  updateStatus(newStatus: CommonStatusEnum): any {
    return this.service.updateStatus(this.id, newStatus);
  }

  buildForm(controls?: boolean): any {
    const {
      arName,
      enName,
      type,
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
      type: controls ? [type, [CustomValidators.required]] : type,
    };
  }
}
