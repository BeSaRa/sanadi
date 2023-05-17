import { ForeignCountriesProjectsInterceptor } from '@app/model-interceptors/foriegn-countries-projects-interceptor';
import { ForeignCountriesProjectsSearchCriteria } from '@app/models/foreign-countries-projects-seach-criteria';
import { ProjectNeed } from '@app/models/project-needs';
import { IModelInterceptor } from '@contracts/i-model-interceptor';

export class ForeignCountriesProjectsSearchCriteriaInterceptor implements IModelInterceptor<ForeignCountriesProjectsSearchCriteria> {
  caseInterceptor: IModelInterceptor<any> = new ForeignCountriesProjectsInterceptor();

  receive(model: ForeignCountriesProjectsSearchCriteria): ForeignCountriesProjectsSearchCriteria {
    return model;
  }

  send(model: Partial<ForeignCountriesProjectsSearchCriteria>): Partial<ForeignCountriesProjectsSearchCriteria> {
    if (!model.projectName) { return model; }
    model.projectNeeds = [{ projectName: model.projectName } as ProjectNeed];
    delete model.projectName;
    return model;
  }
}
