import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {InterventionField} from '@app/models/intervention-field';

export class InterventionFieldInterceptor implements IModelInterceptor<InterventionField> {
  receive(model: InterventionField): InterventionField {
    return model;
  }

  send(model: Partial<InterventionField>): Partial<InterventionField> {
    InterventionFieldInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<InterventionField>): void {
    delete model.mainUNOCHACategoryInfo;
    delete model.subUNOCHACategoryInfo;
  }
}
