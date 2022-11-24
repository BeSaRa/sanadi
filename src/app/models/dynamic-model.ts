import { normalSearchFields } from "@app/helpers/normal-search-fields";
import { INames } from "@app/interfaces/i-names";
import { DynamicModelService } from "@app/services/dynamic-models.service";
import { FactoryService } from "@app/services/factory.service";
import { LangService } from "@app/services/lang.service";
import { ISearchFieldsMap } from "@app/types/types";
import { CustomValidators } from "@app/validators/custom-validators";
import { BaseModel } from "./base-model";

export class DynamicModel  extends BaseModel<DynamicModel, DynamicModelService>{
  arName!: string;
  enName!: string;

  mainClass!: number;
  subClass!: number;

  departmentId!: number;
  teamId!: number;
  subTeamId!: number;
  processType!: number;

  active!: true;

  template!: string;

  // extra properties
  langService: LangService;
  service!:DynamicModelService;
  constructor() {
     super();
    this.langService = FactoryService.getService('LangService');
     this.service = FactoryService.getService('DynamicModelService')
  }

  searchFields: ISearchFieldsMap<DynamicModel> = {
    ...normalSearchFields(['arName', 'enName']),
  };
  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  buildForm(controls?: boolean): any {
    const {
      arName,
      enName,
      mainClass,
      subClass,
      departmentId,
      teamId,
      processType,
      subTeamId,
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
      processType: controls ? [processType, [CustomValidators.required]] : processType,
      mainClass: controls ? [mainClass, [CustomValidators.required]] : mainClass,
      subClass: controls ? [subClass, [CustomValidators.required]] : subClass,
      departmentId: controls ? [departmentId, [CustomValidators.required]] : departmentId,
      teamId: controls ? [teamId, [CustomValidators.required]] : teamId,
      subTeamId: controls ? [subTeamId, [CustomValidators.required]] : subTeamId,
    }
  }
}
