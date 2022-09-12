import { NpoManagement } from './../models/npo-management';
import { IModelInterceptor } from '@contracts/i-model-interceptor';


export class NpoManagementInterceptor implements IModelInterceptor<NpoManagement> {
  receive(model: NpoManagement): NpoManagement {

    return model;
  }

  send(model: Partial<NpoManagement>): Partial<NpoManagement> {

    NpoManagementInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<NpoManagement>): void {
    delete model.searchFields;
  }
}
