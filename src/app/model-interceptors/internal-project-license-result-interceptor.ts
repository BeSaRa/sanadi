import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {InternalProjectLicense} from '@app/models/internal-project-license';

export class InternalProjectLicenseResultInterceptor implements IModelInterceptor<InternalProjectLicense> {
  receive(model: InternalProjectLicense): InternalProjectLicense {
    return model;
  }

  send(model: Partial<InternalProjectLicense>): Partial<InternalProjectLicense> {
    return model;
  }
}
