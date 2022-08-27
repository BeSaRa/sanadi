import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { CharityOrganizationUpdate } from '@app/models/charity-organization-update';

export class CharityOrganizationUpdateInterceptor implements IModelInterceptor<CharityOrganizationUpdate> {
  caseInterceptor?: IModelInterceptor<CharityOrganizationUpdate> | undefined;
  send(model: Partial<CharityOrganizationUpdate>): Partial<CharityOrganizationUpdate> {
    return model;
  }
  receive(model: CharityOrganizationUpdate): CharityOrganizationUpdate {
    return model;
  }
}
