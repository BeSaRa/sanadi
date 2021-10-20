import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {Trainer} from '@app/models/trainer';

export class TrainerInterceptor implements IModelInterceptor<Trainer>{
  receive(model: Trainer): Trainer {
    return model;
  }

  send(model: Partial<Trainer>): Partial<Trainer> {
    return model;
  }
}
