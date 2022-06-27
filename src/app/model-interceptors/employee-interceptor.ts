import { AdminResult } from './../models/admin-result';
import { JobTitle } from './../models/job-title';
import { IMyDateModel } from "angular-mydatepicker";
import { DateUtils } from "./../helpers/date-utils";
import { Employee } from "./../models/employee";
import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";

export class EmployeeInterceptor implements IModelInterceptor<Employee> {
  send(model: Partial<Employee>): Partial<Employee> {
    delete model.id;
    model.contractExpiryDate = !model.contractExpiryDate
      ? undefined
      : DateUtils.changeDateFromDatepicker(
        model.contractExpiryDate as unknown as IMyDateModel
      )?.toISOString();
    model.workStartDate = !model.workStartDate
      ? undefined
      : DateUtils.changeDateFromDatepicker(
        model.workStartDate as unknown as IMyDateModel
      )?.toISOString();
    model.workEndDate = !model.workEndDate
      ? undefined
      : DateUtils.changeDateFromDatepicker(
        model.workEndDate as unknown as IMyDateModel
      )?.toISOString();
    delete model.jobTitleInfo
    return model;
  }
  receive(model: Employee): Employee {
    model.workStartDate = DateUtils.changeDateToDatepicker(model.workStartDate);
    model.workEndDate = DateUtils.changeDateToDatepicker(model.workEndDate);
    model.updatedOn = DateUtils.changeDateToDatepicker(model.updatedOn);
    model.jobTitleInfo = AdminResult.createInstance({
      id: model.jobTitleInfo.id,
      arName: model.jobTitleInfo.arName,
      enName: model.jobTitleInfo.enName,
    });
    model.contractExpiryDate = DateUtils.changeDateToDatepicker(
      model.contractExpiryDate
    );
    return model;
  }
}
