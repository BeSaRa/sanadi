import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {SDGoal} from '@app/models/sdgoal';
import {FactoryService} from '@app/services/factory.service';
import {LookupService} from '@app/services/lookup.service';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {CommonUtils} from '@helpers/common-utils';

export class SdGoalInterceptor implements IModelInterceptor<SDGoal> {
  receive(model: SDGoal): SDGoal {
    const lookupService = FactoryService.getService('LookupService') as LookupService;
    if (!CommonUtils.isValidValue(model.status)) {
      model.status = CommonStatusEnum.DEACTIVATED;
    }
    model.statusInfo = (lookupService.listByCategory.CommonStatus.find(s => s.lookupKey == model.status)!);
    return model;
  }

  send(model: Partial<SDGoal>): Partial<SDGoal> {
    if (!CommonUtils.isValidValue(model.status)) {
      model.status = CommonStatusEnum.DEACTIVATED;
    }
    model.status = model.status ? CommonStatusEnum.ACTIVATED : CommonStatusEnum.DEACTIVATED;
    delete model.langService;
    delete model.service;
    delete model.statusInfo;
    return model;
  }
}
