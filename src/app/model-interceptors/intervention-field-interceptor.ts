import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {InterventionField} from '@app/models/intervention-field';
import {AdminResult} from '@app/models/admin-result';

export class InterventionFieldInterceptor implements IModelInterceptor<InterventionField> {
  receive(model: InterventionField): InterventionField {
    model.mainUNOCHACategoryInfo && (model.mainUNOCHACategoryInfo = AdminResult.createInstance(model.mainUNOCHACategoryInfo));
    model.subUNOCHACategoryInfo && (model.subUNOCHACategoryInfo = AdminResult.createInstance(model.subUNOCHACategoryInfo));
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
