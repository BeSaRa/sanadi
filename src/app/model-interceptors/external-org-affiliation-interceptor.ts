import { ExternalOrgAffiliation } from './../models/external-org-affiliation';
import { IModelInterceptor } from './../interfaces/i-model-interceptor';


export class ExternalOrgAffiliationInterceptor implements IModelInterceptor<ExternalOrgAffiliation> {
  send(model: Partial<ExternalOrgAffiliation>): Partial<ExternalOrgAffiliation> {
    console.log(model)
    return model;
  }
  receive(model: ExternalOrgAffiliation): ExternalOrgAffiliation {
    console.log(model)
    return model;
  }

}
