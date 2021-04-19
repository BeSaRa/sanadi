import {Inquiry} from '../models/inquiry';
import {IModelInterceptor} from '../interfaces/i-model-interceptor';


export class InquiryInterceptor implements IModelInterceptor<Inquiry> {
  send(model: any) {
    delete model.service;
    return model;
  }

  receive(model: Inquiry): Inquiry {
    return model;
  }

}
