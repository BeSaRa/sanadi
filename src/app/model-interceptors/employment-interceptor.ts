import { IMyDateModel } from 'angular-mydatepicker';
import { DateUtils } from '@app/helpers/date-utils';
import { Employment } from '@app/models/employment';
import { EmployeeInterceptor } from "./employee-interceptor";
import { IModelInterceptor } from "@contracts/i-model-interceptor";
import { Employee } from '@app/models/employee';

const employeeInterceptor = new EmployeeInterceptor();
export class EmploymentInterceptor
  implements IModelInterceptor<Employment>
{
  send(model: any) {
    model.licenseStartDate = !model.licenseStartDate
      ? undefined
      : DateUtils.changeDateFromDatepicker(
        model.licenseStartDate as unknown as IMyDateModel
      )?.toISOString();
    model.licenseEndDate = !model.licenseEndDate
      ? undefined
      : DateUtils.changeDateFromDatepicker(
        model.licenseEndDate as unknown as IMyDateModel
      )?.toISOString();
    model.employeeInfoDTOs = model.employeeInfoDTOs.map((ei: any) => {
      return employeeInterceptor.send(ei) as unknown as Employee;
    });
    return model;
  }

  receive(model: Employment): Employment {
    model.licenseStartDate = DateUtils.changeDateToDatepicker(model.licenseStartDate);
    model.licenseEndDate = DateUtils.changeDateToDatepicker(model.licenseEndDate);
    model.employeeInfoDTOs = model.employeeInfoDTOs.map(ei => {
      return employeeInterceptor.receive(new Employee().clone(ei));
    })
    return model;
  }
}
