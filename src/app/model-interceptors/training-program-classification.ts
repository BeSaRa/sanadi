import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import { TrainingProgramClassification } from '@app/models/training-program-classification';
import {FactoryService} from '@app/services/factory.service';
import {LookupService} from '@app/services/lookup.service';

export class TrainingProgramClassificationInterceptor implements IModelInterceptor<TrainingProgramClassification>{
  receive(model: TrainingProgramClassification): TrainingProgramClassification {
    const lookupService = FactoryService.getService('LookupService') as LookupService;
    model.statusInfo = (lookupService.listByCategory.CommonStatus.find(s => s.lookupKey == model.status)!);
    return model;
  }

  send(model: Partial<TrainingProgramClassification>): Partial<TrainingProgramClassification> {
    delete model.statusInfo;
    delete model.service;
    delete model.langService;
    return model;
  }
}
