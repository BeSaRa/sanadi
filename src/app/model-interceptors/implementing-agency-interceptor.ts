import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {ImplementingAgency} from '@app/models/implementing-agency';
import {AdminResult} from '@app/models/admin-result';

export class ImplementingAgencyInterceptor implements IModelInterceptor<ImplementingAgency> {
  receive(model: ImplementingAgency): ImplementingAgency {
    model.implementingAgencyInfo = AdminResult.createInstance(model.implementingAgencyInfo);
    model.agencyTypeInfo = AdminResult.createInstance(model.agencyTypeInfo);
    return model;
  }

  send(model: Partial<ImplementingAgency>): Partial<ImplementingAgency> {
    ImplementingAgencyInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<ImplementingAgency>): void {
    delete model.implementingAgencyInfo;
    delete model.agencyTypeInfo;
  }
}
