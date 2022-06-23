import { Employee } from "./../models/employee";
import { EmployeeInterceptor } from "./employee-interceptor";
import { JobApplication } from "./../models/job-application";
import { IModelInterceptor } from "@contracts/i-model-interceptor";

const employeeInterceptor = new EmployeeInterceptor();
export class JobApplicationInterceptor
  implements IModelInterceptor<JobApplication>
{
  send(model: any) {
    model.employeeInfoDTOs = model.employeeInfoDTOs.map((ei: any) => {
      return employeeInterceptor.send(ei) as unknown as Employee;
    });
    return model;
  }

  receive(model: JobApplication): JobApplication {
    model.employeeInfoDTOs = model.employeeInfoDTOs.map(ei => {
      return employeeInterceptor.receive(new Employee().clone(ei));
    })
    return model;
  }
}
