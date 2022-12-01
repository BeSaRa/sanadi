import { CoordinationWithOrganizationTemplate } from './../models/corrdination-with-organization-template';
import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';

export class CoordinationWithOrganizationTemplateInterceptor
  implements IModelInterceptor<CoordinationWithOrganizationTemplate>
{
  caseInterceptor?: IModelInterceptor<CoordinationWithOrganizationTemplate> | undefined;
  send(model: Partial<CoordinationWithOrganizationTemplate>): Partial<CoordinationWithOrganizationTemplate> {
    delete model.langService;
    delete model.searchFields;
    delete model.employeeService;

    return model;
  }
  receive(model: CoordinationWithOrganizationTemplate): CoordinationWithOrganizationTemplate {
    return model;
  }
}
