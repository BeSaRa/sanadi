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
    return model;
  }
  receive(model: Employee): Employee {
    model.workStartDate = DateUtils.changeDateToDatepicker(model.workStartDate);
    model.workEndDate = DateUtils.changeDateToDatepicker(model.workEndDate);
    model.updatedOn = DateUtils.changeDateToDatepicker(model.updatedOn);
    model.contractExpiryDate = DateUtils.changeDateToDatepicker(
      model.contractExpiryDate
    );
    return model;
  }
}
