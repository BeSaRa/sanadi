import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {TrainingProgramBriefcase} from '@app/models/training-program-briefcase';

export class TrainingProgramBriefcaseInterceptor implements IModelInterceptor<TrainingProgramBriefcase> {

  send(model: Partial<TrainingProgramBriefcase>): Partial<TrainingProgramBriefcase> {
    delete model.service;
    delete model.langService;
    return model;
  }

  receive(model: TrainingProgramBriefcase): TrainingProgramBriefcase {
    return model;
  }
}
