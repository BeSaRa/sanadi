import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {OrgUnitField} from '@app/models/org-unit-field';

export class OrgUnitFieldInterceptor implements IModelInterceptor<OrgUnitField>{
  receive(model: OrgUnitField): OrgUnitField {
    return model;
  }

  send(model: Partial<OrgUnitField>): Partial<OrgUnitField> {
    return model;
  }
}
