import {Inquiry} from '../models/inquiry';
import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {TaskDetails} from '../models/task-details';


export class InquiryInterceptor implements IModelInterceptor<Inquiry> {
  send(model: any) {
    delete model.service;
    delete model.taskDetails;
    return model;
  }

  receive(model: Inquiry): Inquiry {
    model.taskDetails = (new TaskDetails()).clone(model.taskDetails);
    return model;
  }

}
