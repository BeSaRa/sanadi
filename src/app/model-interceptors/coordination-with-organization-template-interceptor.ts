import { ProcessFieldBuilder } from './../administration/popups/general-process-popup/process-formly-components/process-fields-builder';
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
    delete model.generatedTemplate;

    return model;
  }
  receive(model: CoordinationWithOrganizationTemplate): CoordinationWithOrganizationTemplate {
    const fieldBuilder = new ProcessFieldBuilder();
    fieldBuilder.generateFromString(model.template)
    model.generatedTemplate = fieldBuilder.fields;
    return model;
  }
}
