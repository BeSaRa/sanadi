import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { ForeignCountriesProjects } from '@app/models/foreign-countries-projects';
import { ProjectNeed } from '@app/models/project-needs';

export class ForeignCountriesProjectsInterceptor implements IModelInterceptor<ForeignCountriesProjects> {
  caseInterceptor?: IModelInterceptor<ForeignCountriesProjects> | undefined;
  send(model: Partial<ForeignCountriesProjects>): Partial<ForeignCountriesProjects> {
    delete model.entityClassification;
    model.projectNeeds?.forEach((e: Partial<ProjectNeed>) => {
      delete e.searchFields;
    });
    return model;
  }
  receive(model: ForeignCountriesProjects): ForeignCountriesProjects {
    return model;
  }
}
