import {NpoContactOfficer} from '@app/models/npo-contact-officer';
import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";

export class NpoContactOfficerInterceptor implements IModelInterceptor<NpoContactOfficer> {
  send(model: Partial<NpoContactOfficer>): Partial<NpoContactOfficer> {
    delete model.searchFields
    return model;
  }

  receive(model: NpoContactOfficer): NpoContactOfficer {
    return model;
  }
}
