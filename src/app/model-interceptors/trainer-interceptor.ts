import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {Trainer} from '@app/models/trainer';

export class TrainerInterceptor implements IModelInterceptor<Trainer>{
  receive(model: Trainer): Trainer {
    let languages: number[];
    try {
      languages = JSON.parse(model.langList);
    }
    catch (err) {
      languages = [];
    }
    model.langListArr = languages;
    return model;
  }

  send(model: Partial<Trainer>): Partial<Trainer> {
    model.langList = JSON.stringify(model.langListArr);
    delete model.langListArr;
    return model;
  }
}
