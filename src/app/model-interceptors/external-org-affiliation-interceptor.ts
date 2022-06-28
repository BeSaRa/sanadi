import { ExternalOrgAffiliation } from './../models/external-org-affiliation';
import { IModelInterceptor } from './../interfaces/i-model-interceptor';


export class ExternalOrgAffiliationInterceptor implements IModelInterceptor<ExternalOrgAffiliation> {
  caseInterceptor?: IModelInterceptor<ExternalOrgAffiliation> | undefined;
  send(model: Partial<ExternalOrgAffiliation>): Partial<ExternalOrgAffiliation> {
    return model;
  }
  receive(model: ExternalOrgAffiliation): ExternalOrgAffiliation {
    return model;
  }

}
