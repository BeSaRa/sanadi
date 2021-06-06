import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {Consultation} from '../models/consultation';
import {TaskDetails} from '../models/task-details';

export class ConsultationInterceptor implements IModelInterceptor<Consultation> {
  receive(model: Consultation): Consultation {
    model.taskDetails = (new TaskDetails()).clone(model.taskDetails);

    return model;
  }

  send(model: any): any {
    delete model.service;
    delete model.taskDetails;

    return model;
  }

}
