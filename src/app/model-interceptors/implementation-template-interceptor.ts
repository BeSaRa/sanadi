import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {ImplementationTemplate} from '@app/models/implementation-template';

export class ImplementationTemplateInterceptor implements IModelInterceptor<ImplementationTemplate> {
  receive(model: ImplementationTemplate): ImplementationTemplate {
    return model;
  }

  send(model: Partial<ImplementationTemplate>): Partial<ImplementationTemplate> {
    return model;
  }

}
