import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import { CustomServiceTemplate } from '@app/models/custom-service-template';

export class CustomServiceTemplateInterceptor implements IModelInterceptor<CustomServiceTemplate> {
  receive(model: CustomServiceTemplate): any {
    return model;
  }

  send(model: CustomServiceTemplate): any {
    console.log(model)
    CustomServiceTemplateInterceptor._deleteBeforeSend(model);
    return model
  }

  private static _deleteBeforeSend(model: Partial<CustomServiceTemplate>): void {
    delete model.searchFields;
  }
}
