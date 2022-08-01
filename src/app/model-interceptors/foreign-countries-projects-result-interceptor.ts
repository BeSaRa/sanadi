import { IModelInterceptor } from '@app/interfaces/i-model-interceptor'
import { AdminResult } from '@app/models/admin-result'
import { ForeignCountriesProjectsResult } from '@app/models/foreign-countries-projects-results'

export class ForeignCountriesProjectsResultInterceptor implements IModelInterceptor<ForeignCountriesProjectsResult> {
  send(model: Partial<ForeignCountriesProjectsResult>): Partial<ForeignCountriesProjectsResult> {

    delete model.creatorInfo
    delete model.licenseStatusInfo
    delete model.ouInfo
    return model;
  }
  receive(model: ForeignCountriesProjectsResult): ForeignCountriesProjectsResult {
    model.creatorInfo = AdminResult.createInstance(model.creatorInfo);
    model.licenseStatusInfo = AdminResult.createInstance(model.licenseStatusInfo);
    model.ouInfo = AdminResult.createInstance(model.ouInfo);
    return model;
  }

}
