import { ProcessFieldBuilder } from './../administration/popups/general-process-popup/process-formly-components/process-fields-builder';
import { CoordinationWithOrganizationTemplate } from './../models/corrdination-with-organization-template';
import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { TemplateFieldInterceptor } from './formly-template-interceptor';
import { TemplateField } from '@app/models/template-field';

const templateFieldInterceptor = new TemplateFieldInterceptor();

export class CoordinationWithOrganizationTemplateInterceptor
  implements IModelInterceptor<CoordinationWithOrganizationTemplate>
{
  caseInterceptor?: IModelInterceptor<CoordinationWithOrganizationTemplate> | undefined;
  send(model: Partial<CoordinationWithOrganizationTemplate>): Partial<CoordinationWithOrganizationTemplate> {
    delete model.langService;
    delete model.searchFields;
    delete model.employeeService;
    delete model.generatedTemplate;
    delete model.parsedTemplates;

    return model;
  }
  receive(model: CoordinationWithOrganizationTemplate): CoordinationWithOrganizationTemplate {
    const fieldBuilder = new ProcessFieldBuilder();
    fieldBuilder.generateFromString(model.template)
    model.generatedTemplate = fieldBuilder.fields || [];
    CoordinationWithOrganizationTemplateInterceptor.parseTemplates(model);

    return model;
  }
  private static parseTemplates(model: CoordinationWithOrganizationTemplate) {
    try {
      model.parsedTemplates = JSON.parse(model.template);
    } catch (error) {
      model.parsedTemplates = [];
    }
    model.parsedTemplates = model.parsedTemplates.map(x => templateFieldInterceptor.receive(new TemplateField().clone(x)))
  }
}
