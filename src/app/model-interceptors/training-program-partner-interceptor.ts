import { TrainingProgramPartner } from '@app/models/training-program-partner';
import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {FactoryService} from '@app/services/factory.service';
import {LookupService} from '@app/services/lookup.service';

export class TrainingProgramPartnerInterceptor implements IModelInterceptor<TrainingProgramPartner>{
  receive(model: TrainingProgramPartner): TrainingProgramPartner {
    const lookupService = FactoryService.getService('LookupService') as LookupService;
    model.statusInfo = (lookupService.listByCategory.CommonStatus.find(s => s.lookupKey == model.status)!);
    return model;
  }

  send(model: Partial<TrainingProgramPartner>): Partial<TrainingProgramPartner> {
    delete model.statusInfo;
    delete model.service;
    delete model.langService;
    return model;
  }
}
