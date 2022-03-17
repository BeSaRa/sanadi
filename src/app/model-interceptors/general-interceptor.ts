import {AdminResult} from "@app/models/admin-result";
import { TaskDetails } from "@app/models/task-details";

export class GeneralInterceptor {
  static receive(model: any): any {
    model.setItemRoute && model.setItemRoute();
    model.taskDetails && (model.taskDetails = new TaskDetails().clone(model.taskDetails));
    model.taskDetails && model.taskDetails.fromUserInfo && (model.taskDetails.fromUserInfo = AdminResult.createInstance(model.taskDetails.fromUserInfo));
    model.creatorInfo && (model.creatorInfo = AdminResult.createInstance(model.creatorInfo))
    model.caseStatusInfo && (model.caseStatusInfo = AdminResult.createInstance(model.caseStatusInfo))
    return model;
  }

  static send(model: any): any {
    delete model.searchFields;
    delete model.service;
    delete model.employeeService;
    delete model.langService;
    delete model.dialog;
    delete model.encrypt;
    delete model.itemRoute;
    delete model.itemDetails;
    delete model.inboxService;
    delete model.caseStatusInfo;
    delete model.creatorInfo;
    delete model.taskDetails;
    return model;
  }
}
