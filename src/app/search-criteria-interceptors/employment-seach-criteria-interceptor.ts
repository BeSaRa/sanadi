import { EmployeeService } from '@app/services/employee.service';
import { FactoryService } from './../services/factory.service';
import { EmploymentSearchCriteria } from '@app/models/employment-search-criteria';
import { EmploymentInterceptor } from './../model-interceptors/employment-interceptor';
import { IModelInterceptor } from '@contracts/i-model-interceptor';

export class EmploymentSearchCriteriaInterceptor implements IModelInterceptor<EmploymentSearchCriteria> {
  caseInterceptor: IModelInterceptor<any> = new EmploymentInterceptor();
  employeeService: EmployeeService;
  constructor() {
    this.employeeService = FactoryService.getService('EmployeeService');
  }
  receive(model: EmploymentSearchCriteria): EmploymentSearchCriteria {
    return model;
  }

  send(model: Partial<EmploymentSearchCriteria>): Partial<EmploymentSearchCriteria> {
    model.organizationId = this.employeeService.getProfile()?.id || 0;
    return model;
  }
}
