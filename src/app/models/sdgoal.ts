import {BaseModel} from '@app/models/base-model';
import {SDGoalService} from '@app/services/sdgoal.service';
import {FactoryService} from '@app/services/factory.service';
import {INames} from '@app/interfaces/i-names';
import {LangService} from '@app/services/lang.service';
import {searchFunctionType} from '@app/types/types';
import {Lookup} from '@app/models/lookup';
import {CustomValidators} from '@app/validators/custom-validators';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {SdGoalInterceptor} from '@app/model-interceptors/sd-goal-interceptor';
import {InterceptModel} from '@decorators/intercept-model';
import {PaginationContract} from '@contracts/pagination-contract';

const interceptor = new SdGoalInterceptor()

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})
export class SDGoal extends BaseModel<SDGoal, SDGoalService> {
  service!: SDGoalService;
  langService!: LangService;
  status: number = 1;
  parentId!: number | null;
  statusInfo!: Lookup;

  constructor() {
    super();
    this.service = FactoryService.getService('SDGoalService');
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  searchFields: { [key: string]: searchFunctionType | string } = {
    arName: 'arName',
    enName: 'enName',
    // status: text => !this.statusInfo ? false : this.statusInfo.getName().toLowerCase().indexOf(text) !== -1,
  };

  buildForm(controls?: boolean): any {
    const {
      arName,
      enName,
      status,
      parentId
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
      status: controls ? [status, [CustomValidators.required]] : status,
      parentId: controls ? [parentId] : parentId,
    }
  }

  loadSubGoals() {
    return this.service.loadSubSdGoals(this.id);
  }

  loadSubGoalsPaginate(options: Partial<PaginationContract>) {
    return this.service.loadSubSdGoalsPaginate(options, this.id);
  }

  updateStatus(newStatus: CommonStatusEnum): any {
    return this.service.updateStatus(this.id, newStatus);
  }

  isActive(): boolean {
    return this.status === CommonStatusEnum.ACTIVATED;
  }
}
