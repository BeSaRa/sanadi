import { SubTeam } from './../models/sub-team';
import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { FactoryService } from '@app/services/factory.service';
import { LookupService } from '@app/services/lookup.service';

export class SubTeamInterceptor implements IModelInterceptor<SubTeam>{
  receive(model: SubTeam): SubTeam {
    const lookupService = FactoryService.getService('LookupService') as LookupService;
    model.statusInfo = (lookupService.listByCategory.CommonStatus.find(s => s.lookupKey == model.status)!);
    return model;
  }

  send(model: Partial<SubTeam>): Partial<SubTeam> {
    delete model.statusInfo;
    delete model.service;
    delete model.langService;
    return model;
  }
}
