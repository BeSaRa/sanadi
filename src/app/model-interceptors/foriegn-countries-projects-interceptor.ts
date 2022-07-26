import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { ForeignCountriesProjects } from '@app/models/foreign-countries-projects';

export class ForeignCountriesProjectsInterceptor implements IModelInterceptor<ForeignCountriesProjects> {
  caseInterceptor?: IModelInterceptor<ForeignCountriesProjects> | undefined;
  send(model: Partial<ForeignCountriesProjects>): Partial<ForeignCountriesProjects> {
    delete model.entityClassification;
    return model;
  }
  receive(model: ForeignCountriesProjects): ForeignCountriesProjects {
    return model;
  }
}
