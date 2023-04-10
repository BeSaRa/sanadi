import { BaseModel } from '@app/models/base-model';
import { ChecklistService } from '@app/services/checklist.service';
import { Lookup } from '@app/models/lookup';
import { INames } from '@app/interfaces/i-names';
import { FactoryService } from '@app/services/factory.service';
import { LangService } from '@app/services/lang.service';
import { CustomValidators } from '@app/validators/custom-validators';
import { ChecklistItemInterceptor } from '@app/model-interceptors/checklist-item-interceptor';
import { InterceptModel } from "@decorators/intercept-model";
import {ISearchFieldsMap} from '@app/types/types';
import {normalSearchFields} from '@helpers/normal-search-fields';
import {infoSearchFields} from '@helpers/info-search-fields';

const { send, receive } = new ChecklistItemInterceptor();

@InterceptModel({ send, receive })
export class ChecklistItem extends BaseModel<ChecklistItem, ChecklistService> {
  langService: LangService;
  service!: ChecklistService;
  arDesc!: string;
  enDesc!: string;
  stepId!: number;
  stepOrder!: number;
  status: number = 1;
  statusInfo!: Lookup;

  // not related to the model will remove it while sending to the backend
  checked: boolean = false;

  searchFields: ISearchFieldsMap<ChecklistItem> = {
    ...normalSearchFields(['arName', 'enName']),
    ...infoSearchFields(['statusInfo'])
  };

  constructor() {
    super();
    this.service = FactoryService.getService('ChecklistService');
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  buildForm(controls?: boolean): any {
    const {
      arName,
      enName,
      arDesc,
      enDesc,
      stepOrder,
      status,
      stepId
    } = this;

    return {
      arName: controls ? [arName, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('AR_NUM')
      ]] : arName,
      enName: controls ? [enName, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('ENG_NUM')
      ]] : enName,
      arDesc: controls ? [arDesc, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('AR_NUM')
      ]] : arDesc,
      enDesc: controls ? [enDesc, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('ENG_NUM')
      ]] : enDesc,
      stepOrder: controls ? [stepOrder, [
        CustomValidators.required,
        CustomValidators.pattern('ENG_NUM_ONLY')
      ]] : stepOrder,
      status: controls ? [status] : status,
      stepId: controls ? [stepId] : stepId,
    }
  }

  getDescription() {
    return this[(this.langService.map.lang + 'Desc') as keyof INames];
  }
}
