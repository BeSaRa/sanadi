import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {Officer} from '@app/models/officer';

export class OfficerInterceptor implements IModelInterceptor<Officer> {
  caseInterceptor?: IModelInterceptor<Officer> | undefined;

  send(model: Partial<Officer>): Partial<Officer> {
    delete model.searchFields;
    return model;
  }

  receive(model: Officer): Officer {
    return model;
  }
}
