import { EmployeeService } from '@app/services/employee.service';
import { IModelInterceptor } from '@contracts/i-model-interceptor';
import { ProjectModelSearchCriteria } from '@app/models/project-model-search-criteria';
import { ProjectModelInterceptor } from '@app/model-interceptors/project-model-interceptor';

export class ProjectModelSearchCriteriaInterceptor implements IModelInterceptor<ProjectModelSearchCriteria> {
  caseInterceptor: IModelInterceptor<any> = new ProjectModelInterceptor();
  employeeService!: EmployeeService;
  receive(model: ProjectModelSearchCriteria): ProjectModelSearchCriteria {
    return model;
  }

  send(model: Partial<ProjectModelSearchCriteria>): Partial<ProjectModelSearchCriteria> {
    (model?.componentList && !model.componentList.length) && delete model.componentList;
    (model?.evaluationIndicatorList && !model.evaluationIndicatorList.length) && delete model.evaluationIndicatorList;
    (model?.foreignCountriesProjectList && !model.foreignCountriesProjectList.length) && delete model.foreignCountriesProjectList;
    (model?.projectAddressList && !model.projectAddressList.length) && delete model.projectAddressList;
    return model;
  }
}
