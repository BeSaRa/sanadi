import { NpoContactOfficer } from '@app/models/npo-contact-officer';
import { AdminResult } from '../models/admin-result';
import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";

export class NpoContactOfficerInterceptor implements IModelInterceptor<NpoContactOfficer> {
  send(model: Partial<NpoContactOfficer>): Partial<NpoContactOfficer> {
    delete model.jobInfo;
    delete model.searchFields
    return model;
  }

  receive(model: NpoContactOfficer): NpoContactOfficer {
    model.jobInfo && (model.jobInfo = AdminResult.createInstance(model.jobInfo));
    return model;
  }
}
