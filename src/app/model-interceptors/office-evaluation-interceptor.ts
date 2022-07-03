import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {OfficeEvaluation} from '@app/models/office-evaluation';
import {AdminResult} from '@app/models/admin-result';

export class OfficeEvaluationInterceptor implements IModelInterceptor<OfficeEvaluation>{
  receive(model: OfficeEvaluation): OfficeEvaluation {
    model.evaluationHubInfo && (model.evaluationHubInfo = AdminResult.createInstance(model.evaluationHubInfo));
    model.evaluationResultInfo && (model.evaluationResultInfo = AdminResult.createInstance(model.evaluationResultInfo));
    return model;
  }

  send(model: Partial<OfficeEvaluation>): Partial<OfficeEvaluation> {
    OfficeEvaluationInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<OfficeEvaluation>): void {
    delete model.evaluationHubInfo;
    delete model.evaluationResultInfo;
  }
}
