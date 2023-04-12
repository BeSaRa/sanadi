import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import { AdminResult } from '@app/models/admin-result';
import { CustomServiceTemplate } from '@app/models/custom-service-template';

export class CustomServiceTemplateInterceptor implements IModelInterceptor<CustomServiceTemplate> {
  receive(model: CustomServiceTemplate): any {
    model.approvalTemplateTypeInfo = AdminResult.createInstance(model.approvalTemplateTypeInfo)
    return model;
  }

  send(model: CustomServiceTemplate): any {
    CustomServiceTemplateInterceptor._deleteBeforeSend(model);
    return model
  }

  private static _deleteBeforeSend(model: Partial<CustomServiceTemplate>): void {
    delete model.approvalTemplateTypeInfo;
  }
}
