import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {UrgentInterventionLicenseFollowup} from '@app/models/urgent-intervention-license-followup';

export class UrgentInterventionLicenseFollowupInterceptor implements IModelInterceptor<UrgentInterventionLicenseFollowup>{
  receive(model: UrgentInterventionLicenseFollowup): UrgentInterventionLicenseFollowup {
    return model;
  }

  send(model: Partial<UrgentInterventionLicenseFollowup>): Partial<UrgentInterventionLicenseFollowup> {
    UrgentInterventionLicenseFollowupInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<UrgentInterventionLicenseFollowup>): void {

  }
}
