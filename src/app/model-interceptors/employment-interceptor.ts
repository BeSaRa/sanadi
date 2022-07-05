import { Employment } from '@app/models/employment';
import { EmployeeInterceptor } from "./employee-interceptor";
import { IModelInterceptor } from "@contracts/i-model-interceptor";
import { Employee } from '@app/models/employee';

const employeeInterceptor = new EmployeeInterceptor();
export class EmploymentInterceptor
  implements IModelInterceptor<Employment>
{
  send(model: any) {
    model.employeeInfoDTOs = model.employeeInfoDTOs.map((ei: any) => {
      return employeeInterceptor.send(ei) as unknown as Employee;
    });
    return model;
  }

  receive(model: Employment): Employment {
    model.employeeInfoDTOs = model.employeeInfoDTOs.map(ei => {
      return employeeInterceptor.receive(new Employee().clone(ei));
    })
    return model;
  }
}
