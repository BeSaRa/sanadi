import { IMyDateModel } from 'angular-mydatepicker';

import { FactoryService } from '@services/factory.service';
import { InterceptModel } from "@decorators/intercept-model";
import { WorldCheckInterceptor } from '@app/model-interceptors/world-check-interceptor';
import { BaseModel } from './base-model';
import { CustomValidators } from '@app/validators/custom-validators';
import { WorldCheckService } from '@app/services/world-check.service';
import { AdminResult } from './admin-result';

const { send, receive } = new WorldCheckInterceptor();

@InterceptModel({ send, receive })
export class WorldCheckSearch extends BaseModel<WorldCheckSearch, WorldCheckService> {
  id!: number;
  service: WorldCheckService;

  targetArabicName!: string;
  targetEnglishName!: string;

  actionDateFrom!: string | IMyDateModel;
  actionDateTo!: string | IMyDateModel;

  entityType!: number;
  actionType!: number;
  searchType!: number;

  actionDate!: string | IMyDateModel;
  internalUserDeptId!: number;
  internalUserId!: number;
  serviceStatus!: boolean;
  signature!: string;

  internalUserDeptInfo!: AdminResult;
  internalUserInfo!: AdminResult;

  constructor() {
    super();
    this.service = FactoryService.getService('WorldCheckService');
  }
  buildInquireForm() {
    return {
      targetName: ['', [CustomValidators.required,CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]],
      entityType: [null, [CustomValidators.required]],
    }
  }
  buildSearchForm() {
    return {
      targetArabicName: ['', [
        CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('AR_NUM_ONE_AR')]],
      targetEnglishName: ['', [
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('ENG_NUM_ONE_ENG')]],
      actionDateFrom: [null],
      actionDateTo: [null],
      entityType: [null],
      actionType: [null],
      searchType: [null],
      limit: [0, [CustomValidators.number]],
    }
  }
}

