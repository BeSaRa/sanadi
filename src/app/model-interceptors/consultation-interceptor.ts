import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {Consultation} from '../models/consultation';
import {TaskDetails} from '../models/task-details';
import {AdminResult} from '../models/admin-result';

export class ConsultationInterceptor implements IModelInterceptor<Consultation> {
  receive(model: Consultation): Consultation {
    model.taskDetails = (new TaskDetails()).clone(model.taskDetails);
    model.caseStatusInfo = AdminResult.createInstance(model.caseStatusInfo);
    model.creatorInfo = AdminResult.createInstance(model.creatorInfo);
    model.ouInfo = AdminResult.createInstance(model.ouInfo);
    return model;
  }

  send(model: any): any {
    delete model.service;
    delete model.taskDetails;
    delete model.caseStatusInfo;
    delete model.creatorInfo;
    delete model.ouInfo;
    delete model.employeeService;
    return model;
  }

}
