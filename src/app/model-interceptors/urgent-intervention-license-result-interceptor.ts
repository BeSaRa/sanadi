import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {UrgentInterventionLicense} from '@app/models/urgent-intervention-license';

export class UrgentInterventionLicenseResultInterceptor implements  IModelInterceptor<UrgentInterventionLicense>{
  receive(model: UrgentInterventionLicense): UrgentInterventionLicense {
    return model;
  }

  send(model: Partial<UrgentInterventionLicense>): Partial<UrgentInterventionLicense> {
    return model;
  }
}
