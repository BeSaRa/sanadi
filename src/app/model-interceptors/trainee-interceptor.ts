import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {Trainee} from '@app/models/trainee';

export class TraineeInterceptor implements IModelInterceptor<Trainee>{
  receive(model: Trainee): Trainee {
    return model;
  }

  send(model: Partial<Trainee>): Partial<Trainee> {
    delete model.service;
    delete model.lang;
    return model;
  }
}
