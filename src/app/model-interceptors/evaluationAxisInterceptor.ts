import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { AdminResult } from '@app/models/admin-result';
import { EvaluationAxis } from '@app/models/evaluationAxis';

export class EvaluationAxisInterceptor implements IModelInterceptor<EvaluationAxis> {
  send(model: Partial<EvaluationAxis>): Partial<EvaluationAxis> {
   
    EvaluationAxisInterceptor._deleteBeforeSend(model);
    return model;
  }

  receive(model: EvaluationAxis): EvaluationAxis {
    model.evaluationAxisInfo = AdminResult.createInstance(model.evaluationAxisInfo);
    return model;
  }
  private static _deleteBeforeSend(model: Partial<EvaluationAxis>) {

    delete model.evaluationAxisInfo;
    delete model.search;
    delete model.searchFields;
  }
}
