import {NpoContactOfficer} from '@app/models/npo-contact-officer';
import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";

export class NpoContactOfficerInterceptor implements IModelInterceptor<NpoContactOfficer> {
  send(model: Partial<NpoContactOfficer>): Partial<NpoContactOfficer> {
    NpoContactOfficerInterceptor._deleteBeforeSend(model)
    return model;
  }

  receive(model: NpoContactOfficer): NpoContactOfficer {
    return model;
  }
  private static _deleteBeforeSend(model: Partial<NpoContactOfficer>) {
    delete model.searchFields;
  }
}
