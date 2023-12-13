import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { AdminResult } from '@app/models/admin-result';
import { NpoProfile } from '@app/models/npo-profile';

export class NpoProfileInterceptor implements IModelInterceptor<NpoProfile> {
  caseInterceptor?: IModelInterceptor<NpoProfile> | undefined;
  send(model: Partial<NpoProfile>): Partial<NpoProfile> {
    if (model.registrationAuthority === -1) { delete model.registrationAuthority; }
    delete model.service;
    delete model.statusInfo;
    // delete model.NpoprofileTypeInfo;
    delete model.registrationAuthorityInfo;
    return model;
  }
  receive(model: NpoProfile): NpoProfile {
    // model.NpoprofileTypeInfo = AdminResult.createInstance(model.NpoprofileTypeInfo);
    model.registrationAuthorityInfo = AdminResult.createInstance(model.registrationAuthorityInfo);
    model.statusInfo && (model.statusInfo = AdminResult.createInstance(model.statusInfo??{}));
    return model;
  }
}
