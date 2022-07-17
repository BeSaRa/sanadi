import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {ImplementationTemplate} from '@app/models/implementation-template';
import {AdminResult} from '@app/models/admin-result';

export class ImplementationTemplateInterceptor implements IModelInterceptor<ImplementationTemplate> {
  receive(model: ImplementationTemplate): ImplementationTemplate {
    model.implementingAgencyInfo && (model.implementingAgencyInfo = AdminResult.createInstance(model.implementingAgencyInfo))
    model.typeInfo && (model.typeInfo = AdminResult.createInstance(model.typeInfo))
    return model;
  }

  send(model: Partial<ImplementationTemplate>): Partial<ImplementationTemplate> {
    ImplementationTemplateInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<ImplementationTemplate>): void {
    delete model.searchFields;
    delete model.implementingAgencyInfo;
    delete model.typeInfo;
  }

}
