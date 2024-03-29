import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {InternationalCooperation} from '../models/international-cooperation';
import {AdminResult} from '../models/admin-result';
import {TaskDetails} from '@app/models/task-details';

export class InternationalCooperationInterceptor implements IModelInterceptor<InternationalCooperation> {
  send(model: any) {
    delete model.service;
    delete model.taskDetails;
    delete model.caseStatusInfo;
    delete model.ouInfo;
    delete model.creatorInfo;
    delete model.categoryInfo;
    delete model.employeeService;
    return model;
  }

  receive(model: InternationalCooperation): InternationalCooperation {
    model.taskDetails = (new TaskDetails()).clone(model.taskDetails);
    model.creatorInfo = AdminResult.createInstance(model.creatorInfo);
    model.ouInfo = AdminResult.createInstance(model.ouInfo);
    model.caseStatusInfo = AdminResult.createInstance(model.caseStatusInfo);
    model.creatorInfo = AdminResult.createInstance(model.creatorInfo);
    model.categoryInfo = AdminResult.createInstance(model.categoryInfo);
    return model;
  }
}
