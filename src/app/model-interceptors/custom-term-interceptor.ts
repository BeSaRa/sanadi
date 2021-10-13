import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {CustomTerm} from "@app/models/custom-term";

export class CustomTermInterceptor implements IModelInterceptor<CustomTerm> {
  send(model: Partial<CustomTerm>): Partial<CustomTerm> {
    delete model.service;
    return model;
  }

  receive(model: CustomTerm): CustomTerm {
    return model;
  }
}
