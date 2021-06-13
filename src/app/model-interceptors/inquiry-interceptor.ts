import {Inquiry} from '../models/inquiry';
import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {TaskDetails} from '../models/task-details';
import {AdminResult} from '../models/admin-result';


export class InquiryInterceptor implements IModelInterceptor<Inquiry> {
  send(model: any) {
    delete model.service;
    delete model.taskDetails;

    delete model.creatorInfo;
    delete model.caseStatusInfo;
    delete model.ouInfo;

    return model;
  }

  receive(model: Inquiry): Inquiry {
    model.taskDetails = (new TaskDetails()).clone(model.taskDetails);

    model.caseStatusInfo = AdminResult.createInstance(model.caseStatusInfo);
    model.creatorInfo = AdminResult.createInstance(model.creatorInfo);
    model.ouInfo = AdminResult.createInstance(model.ouInfo);

    return model;
  }

}
