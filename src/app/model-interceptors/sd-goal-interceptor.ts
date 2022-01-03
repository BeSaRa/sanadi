import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {SDGoal} from '@app/models/sdgoal';
import {FactoryService} from '@app/services/factory.service';
import {LookupService} from '@app/services/lookup.service';

export class SdGoalInterceptor implements IModelInterceptor<SDGoal>{
  receive(model: SDGoal): SDGoal {
    const lookupService = FactoryService.getService('LookupService') as LookupService;
    model.statusInfo = (lookupService.listByCategory.CommonStatus.find(s => s.lookupKey == model.status)!);
    return model;
  }

  send(model: Partial<SDGoal>): Partial<SDGoal> {
    model.status = model.status ? 1 : 0;
    delete model.langService;
    delete model.service;
    delete model.statusInfo;
    delete model.childCount;
    return model;
  }
}
