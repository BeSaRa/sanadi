import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {ImplementationTemplate} from '@app/models/implementation-template';
import {AdminResult} from "@models/admin-result";

export class ImplementationTemplateInterceptor implements IModelInterceptor<ImplementationTemplate> {
  receive(model: ImplementationTemplate): ImplementationTemplate {
    model.executionCountryInfo = AdminResult.createInstance(model.executionCountryInfo);
    return model;
  }

  send(model: Partial<ImplementationTemplate>): Partial<ImplementationTemplate> {
    delete model.defaultLatLng;
    delete model.executionCountryInfo;
    delete model.service
    return model;
  }

}
