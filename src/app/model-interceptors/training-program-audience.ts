import { TrainingProgramAudience } from '../models/training-program-audience';
import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {FactoryService} from '@app/services/factory.service';
import {LookupService} from '@app/services/lookup.service';

export class TrainingProgramAudienceInterceptor implements IModelInterceptor<TrainingProgramAudience>{
  receive(model: TrainingProgramAudience): TrainingProgramAudience {
    const lookupService = FactoryService.getService('LookupService') as LookupService;
    model.statusInfo = (lookupService.listByCategory.CommonStatus.find(s => s.lookupKey == model.status)!);
    return model;
  }

  send(model: Partial<TrainingProgramAudience>): Partial<TrainingProgramAudience> {
    delete model.statusInfo;
    delete model.service;
    delete model.langService;
    return model;
  }
}
